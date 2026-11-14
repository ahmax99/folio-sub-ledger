# Changelog

## 1.0.0 (2026-11-14)


### Features

* **agents:** add product-side agents (accounting, PM, UX, AI eval, compliance) and sprint-runner loop ([#15](https://github.com/ahmax99/folio-sub-ledger/issues/15)) ([955346b](https://github.com/ahmax99/folio-sub-ledger/commit/955346b4acbaa77b666a373a1257178d8cbb72fd))
* **claude:** design and critique in Figma through the Figma MCP server ([#35](https://github.com/ahmax99/folio-sub-ledger/issues/35)) ([7562fb4](https://github.com/ahmax99/folio-sub-ledger/commit/7562fb4601b1320d798d12b8f553bc8fe734f374))
* isolate each firm's data with CASL and Postgres RLS ([#56](https://github.com/ahmax99/folio-sub-ledger/issues/56)) ([ecd1115](https://github.com/ahmax99/folio-sub-ledger/commit/ecd11154af191ba27af2feea45f571506144481f))
* signup creates the firm and its Owner ([#46](https://github.com/ahmax99/folio-sub-ledger/issues/46)) ([36187b8](https://github.com/ahmax99/folio-sub-ledger/commit/36187b8febc253fe41a0dd6a080359b7a31d0b44))
* **web:** migrate frontend from Next.js 16 to TanStack Start v1 ([#18](https://github.com/ahmax99/folio-sub-ledger/issues/18)) ([f423af5](https://github.com/ahmax99/folio-sub-ledger/commit/f423af51dbe9d4540a54c2f86eda9a10804c5802))
* **web:** move forms to TanStack Form and data fetching to TanStack Query ([#33](https://github.com/ahmax99/folio-sub-ledger/issues/33)) ([164a3e9](https://github.com/ahmax99/folio-sub-ledger/commit/164a3e9f431170b25e92bdc3f26508853c6db67e))
* **web:** swap React's client runtime for TanStack Redact; upgrade all packages ([#31](https://github.com/ahmax99/folio-sub-ledger/issues/31)) ([6b37f14](https://github.com/ahmax99/folio-sub-ledger/commit/6b37f1431f0601784a86eef9410fd1b7d8d420a2))


### Bug Fixes

* **web:** bump TanStack Redact to 0.3.1 so loader errors reach the error screen ([#55](https://github.com/ahmax99/folio-sub-ledger/issues/55)) ([ff0fd63](https://github.com/ahmax99/folio-sub-ledger/commit/ff0fd6316f21798be0f3f5c4ed904aaf4a2ef2b4))
* **web:** install bun outside /root so the Lambda user can run it ([#20](https://github.com/ahmax99/folio-sub-ledger/issues/20)) ([f485525](https://github.com/ahmax99/folio-sub-ledger/commit/f4855251590a5cd19ac4f5662fca17afa8542cd1))
* **web:** keep the signed-in header on one line at 375px and focus the firm field on invalid submit ([#47](https://github.com/ahmax99/folio-sub-ledger/issues/47)) ([6237e74](https://github.com/ahmax99/folio-sub-ledger/commit/6237e745083361b1e3fbd46cb5ccc6b02e165658))
* **web:** run bun with --no-install so Lambda's read-only disk doesn't crash it ([#21](https://github.com/ahmax99/folio-sub-ledger/issues/21)) ([c9a56ca](https://github.com/ahmax99/folio-sub-ledger/commit/c9a56cafb91c5598187557b93e7d6430eef3b050))
* **web:** scope Tailwind's class scan to src so SSR and client CSS match ([#22](https://github.com/ahmax99/folio-sub-ledger/issues/22)) ([a6ceaaa](https://github.com/ahmax99/folio-sub-ledger/commit/a6ceaaa277861754ffc839cc8f834e6a06a4c05d))
