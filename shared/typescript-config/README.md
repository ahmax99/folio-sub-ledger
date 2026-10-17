# @shared/typescript-config

Shared TypeScript configurations used across the monorepo. Every app and shared package extends one of the configs here rather than duplicating `compilerOptions`.

## Configs

### `base.json`

Foundation config for all packages. Key settings:

| Option                           | Value     | Why                                                            |
| -------------------------------- | --------- | -------------------------------------------------------------- |
| `target` / `lib`                 | `ES2022`  | Matches Bun's runtime capabilities.                            |
| `module`                         | `ESNext`  | ESM output; pairs with `moduleResolution: bundler`.            |
| `moduleResolution`               | `bundler` | Resolves bare specifiers the way Bun and Vite do.              |
| `strict`                         | `true`    | Catches nullability, implicit `any`, and other common bugs.    |
| `noUncheckedIndexedAccess`       | `true`    | Array/object index accesses return `T \| undefined`, not `T`.  |
| `isolatedModules`                | `true`    | Required for single-file transpilation (Bun, esbuild, SWC).    |
| `declaration` + `declarationMap` | `true`    | Emits `.d.ts` + source maps for cross-package type navigation. |
| `incremental`                    | `false`   | Disabled — Turborepo manages caching at a higher level.        |

### `react-app.json`

Extends `base.json` for the Vite-built React app (TanStack Start):

- `jsx: "react-jsx"` — the automatic JSX runtime Vite compiles to.
- `allowJs: true` — JS config files live alongside TypeScript sources.
- `noEmit: true`, `declaration: false` — `tsc` is type-check only; Vite handles the actual build.
- `types: ["vite/client"]` — `import.meta.env` and `?url` asset imports.

## Usage

Extend the right config in your package's `tsconfig.json`:

**Elysia backend / shared packages** (`base.json`):

```json
{
  "extends": "@shared/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**TanStack Start app** (`react-app.json`):

```json
{
  "extends": "@shared/typescript-config/react-app.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".output", ".nitro", ".tanstack"]
}
```

## Extending or overriding

Any option in the extending `tsconfig.json` overrides the base. For example, the backend sets `"module": "ES2022"` over the base's `"ESNext"` to produce explicit ES2022 module syntax for Lambda compatibility.

Run type-checking across the whole monorepo from the repo root:

```bash
bun run check-types
```
