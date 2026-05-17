### [Prisma in Monorepo (v6.3.1)](https://github.com/Harsh8089/monorepo-deployment/commit/2adabfa4a06e3a9f56beb35903324e39b2720fd3)

- Prisma v6.3.1 doesn't require `output` path in `schema.prisma`. Generates prisma client to `node_modules/.prisma/client` by default.
- Import from `@prisma/client` in `packages/db/src/index.ts` (not a relative generated path).
- Run `prisma generate` explicitly — in CI, Docker, and any fresh environment.
  (it does not run automatically on `pnpm install`)
- `packages/db/package.json` exports must point to compiled JS for prod:

```json
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
```

Pointing exports to `./src/index.ts` works in dev (tsx handles .ts)
but breaks in prod (plain node cannot run .ts files).

### [Dockerfile for http](https://github.com/Harsh8089/monorepo-deployment/commit/2adabfa4a06e3a9f56beb35903324e39b2720fd3#diff-1889a39cd8e5503a22aa01cf4e8f67d491cedd51f11a10d7893f454ab298560b)

- `.dockerignore` file must be created at root level
- prisma client must be re-generated in docker container
- Added script to start http server at root package.json
- Copies entire workspace
- While running db, attach volume to make data persistent in postgres container (optional), or else run `npx prisma migrate dev` to sync current migrations in newly created postgres container
- Image build command

```bash
docker build -f apps/http/Dockerfile.backend -t backend .
```

- Image run command

```bash
docker run -p 3000:3000 backend
```

- If need shell access

```bash
docker exec -it <container-name> /bin/sh
```

### Backend container connection with postgresql

- Create a network
- Attach created n/w to backend and postgres container
- Pass DATABASE_URL to backend image to turn up container

### Dev docker setup

Run below steps at root level

1. Create n/w connection b/w http server and postgres sql

```bash
docker network create http-db
```

2. Run postgres image, attach n/w, pass env var and set name as sql

```bash
docker run --name sql -e POSTGRES_USER=user -e POSTGRES_PASSWORD=pswd -e POSTGRES_DB=db -d --network http-db -p 5432:5432 postgres
```

3. Build backend image

```bash
docker build -f apps/http/Dockerfile.backend -t backend .
```

4. Run backend image, attach n/w, pass db url as env and set name as backend

```bash
docker run --name backend -e DATABASE_URL="postgresql://user:pswd@sql:5432/db" -e JWT_SECRET="some_random_123#_jwt_secret!" -e PORT=3000 -d -p 3000:3000 backend
```

5. Build frontend image

```bash
docker build -f apps/web/Dockerfile.frontend -t frontend .
```

6. Run frontend image, attach n/w

```bash
docker run --name frontend -d --network http-db -p 5173:5173 frontend
```

Access application on browser at - http://localhost:5173
