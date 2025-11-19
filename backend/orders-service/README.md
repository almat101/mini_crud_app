# Orders Service — Setup Summary

- **Project type:** TypeScript-only Fastify service.
- **Runtime library:** `fastify` is installed as a production dependency.
- **Dev tooling:** `typescript` and `ts-node-dev` are used for compilation and fast-reload during development.
- **ES modules:** `"type": "module"` is enabled in `package.json` (use ESM imports/exports).

```sh
npm init -y
npm i fastify
npm i -D typescript @types/node tsx
```

**Scripts**
- `npm run dev` — runs `tsx watch src/server.ts` runs and auto-restarts on file changes
- `npm run build` — compiles TypeScript (`tsc`) according to `tsconfig.json` into `dist/`.
- `npm run start` — runs the compiled JS at `dist/server.js` in production.

**Required files / layout**
- `tsconfig.json` — ensure `rootDir: "src"` and `outDir: "dist"`.
- `src/server.ts` — entry point for the service.
- After `npm run build`: `dist/server.js` should exist and be runnable.

**How to run**
- Development: `npm run dev`
- Production: `npm run build && npm run start`