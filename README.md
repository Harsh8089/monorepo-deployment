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
