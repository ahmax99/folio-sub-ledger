# Changelog

## 1.0.0 (2026-10-17)


### Features

* **agents:** add product-side agents (accounting, PM, UX, AI eval, compliance) and sprint-runner loop ([#15](https://github.com/ahmax99/folio-sub-ledger/issues/15)) ([955346b](https://github.com/ahmax99/folio-sub-ledger/commit/955346b4acbaa77b666a373a1257178d8cbb72fd))
* **web:** migrate frontend from Next.js 16 to TanStack Start v1 ([#18](https://github.com/ahmax99/folio-sub-ledger/issues/18)) ([f423af5](https://github.com/ahmax99/folio-sub-ledger/commit/f423af51dbe9d4540a54c2f86eda9a10804c5802))


### Bug Fixes

* **web:** install bun outside /root so the Lambda user can run it ([#20](https://github.com/ahmax99/folio-sub-ledger/issues/20)) ([f485525](https://github.com/ahmax99/folio-sub-ledger/commit/f4855251590a5cd19ac4f5662fca17afa8542cd1))
* **web:** run bun with --no-install so Lambda's read-only disk doesn't crash it ([#21](https://github.com/ahmax99/folio-sub-ledger/issues/21)) ([c9a56ca](https://github.com/ahmax99/folio-sub-ledger/commit/c9a56cafb91c5598187557b93e7d6430eef3b050))
* **web:** scope Tailwind's class scan to src so SSR and client CSS match ([#22](https://github.com/ahmax99/folio-sub-ledger/issues/22)) ([a6ceaaa](https://github.com/ahmax99/folio-sub-ledger/commit/a6ceaaa277861754ffc839cc8f834e6a06a4c05d))
