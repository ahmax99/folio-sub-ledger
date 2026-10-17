---
description: Code conventions, patterns, and style requirements
---

# Conventions

The concrete "how to write code here" rules. `architecture.md` covers _where things live_; `principles.md` covers _why_. `oxfmt` owns pure style (single quotes, no semicolons, 2-space, 80 cols, no trailing commas) — these are the conventions it can't enforce.

- The backend uses ESM with explicit `.js` import extensions (`import { x } from './foo.js'`) even though sources are `.ts` — match this in `apps/api`.
- Prefer the neverthrow `Result` pattern in backend services over throwing across layers; only throw `AppError` inside the `catchAsyncError`-wrapped body.
- Put shared types/schemas in `@shared/config` so both apps stay in sync.

## Code Style

- Prefer `const` arrow functions over `function` declarations: `const fn = () => {}` not `function fn() {}`. **Exception:** TypeScript function overloads require the `function` keyword (e.g., a utility with multiple call signatures); the `function` keyword is acceptable only in that case.
- Prefer `switch-case` over `else-if` chains when 3 or more branches test the same discriminant expression. For simple value-to-value mappings, prefer a `Record<K, V>` lookup table over both (exhaustiveness is enforced by the type).

## Validation

- Validate all external input (request `body` / `query` / `params`, headers, env) with a Zod schema at the boundary — for the backend that's the Elysia route options (e.g. `body: PostModel.createPostBody`), never inside a service.
- Schemas live in `@shared/config` as `*.model.ts` and are imported by both apps. Add new validation there, not in an app.

## Transactions

- Use `prisma.$transaction([...])` for any multi-step write that must be atomic.
- Services call `prisma` directly (there is no separate model layer). When a transaction spans helpers, thread the `tx` client (`Prisma.TransactionClient`) into each Prisma call rather than reaching for the singleton `prisma`.

## Auth Context

The auth/authorization mechanics (Cognito JWT via `authPlugin`, `getUserPermissions`, the BFF clients) are described in `architecture.md` — the rules here are just: gate protected routes with the `auth: true` macro, and enforce the resolved ability on **every** query (`accessibleBy(ability).ofType('<Model>')` in list `where` clauses, `ability.can('<action>', subject('<Model>', record))` on single resources). Authenticating without consulting the ability is broken authorization.

## Exports

Always use named exports, never default exports — except where a framework entry requires one (`src/server.ts`, `vite.config.ts`). TanStack routes export a named `Route`.

## Frontend Components (web)

- Use CVA (`class-variance-authority`) for variant systems in atoms and organisms; co-export `<Name>Variants` alongside the component for consumers that need raw class strings.
- Mark each component's root element with `data-slot="<component-name>"` (e.g. `data-slot="button"`) to enable parent styling via attribute selectors.
- Compose subcomponents (e.g. `Card`, `CardHeader`, `CardContent`) as separate named exports from a single file — not separate files.
- Every component is isomorphic (SSR then hydrated). `'use client'` is a no-op under TanStack Start; existing ones are kept as a readability marker for interactive components, but don't rely on it for any boundary.
- Feature-specific components go in `features/<name>/client/components/` (interactive) or `features/<name>/components/` (presentational, fed by loader data); never in `src/components/`.
- Presentational components (`features/<name>/components/`) have no React hooks, no browser APIs, and no server-only imports (`env`, `serverApiClient`, services).

## Rendering and data (web)

- Page data comes from a route `loader` that calls a server function (`createServerFn` in `features/<name>/server/functions.ts`), never from fetching inside a component. Validate server-function input with `.validator(<Zod schema>)` — it is an external boundary like any route.
- Session-dependent context (the current `user`) is resolved once in the layout route's `beforeLoad` (`_main`, `_authorized`) and read with `Route.useRouteContext()`.
- After a mutation, refresh loader data with `router.invalidate()`; navigate with `useNavigate()` / `<Link to>` (typed routes), never `window.location` except for off-site or full-document redirects (`reloadDocument` on links to `/api/auth/*`).
- Server routes return `Response` objects; for redirects use `redirectResponse()` from `lib/redirectResponse.ts`, not `Response.redirect()` (its immutable headers drop the session's `Set-Cookie`).
- Search params a page depends on are declared with `validateSearch` on its route.

## Error Handling

The pipeline itself (`catchAsyncError` → `ResultAsync<T, AppError>` → `handleApiError` → `errorHandler`, error codes from `@shared/config`) is described in `architecture.md`. Conventions on top of it:

- Prefer the shared `catchError` utils over hand-written `try/catch`. Choose by intent: `catchAsyncError(promise)` reports to Sentry — use it when a throw is genuinely exceptional; `catchSyncError(() => …)` does not — use it for expected, recoverable failures (input validation, parsing untrusted data, `new URL(...)`, `JSON.parse`). Each app has its own copy: backend `src/error/utils/catchError.ts`, frontend `src/features/error/utils/catchError.ts`.
- Handle Results as values (`.match(...)`, `.unwrapOr(...)`); reserve raw `try/catch` for cases the helpers can't express. Never leak internal stack traces in responses.
