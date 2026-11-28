# Changelog

## 1.0.0 (2026-11-28)


### ⚠ BREAKING CHANGES

* **web:** POST setup now takes { name } instead of { firmName }. Deploy the web app and the API together.

### Features

* **agents:** add product-side agents (accounting, PM, UX, AI eval, compliance) and sprint-runner loop ([#15](https://github.com/ahmax99/folio-sub-ledger/issues/15)) ([955346b](https://github.com/ahmax99/folio-sub-ledger/commit/955346b4acbaa77b666a373a1257178d8cbb72fd))
* **ci:** write the runtime database credential once on deploy ([#85](https://github.com/ahmax99/folio-sub-ledger/issues/85)) ([19deafd](https://github.com/ahmax99/folio-sub-ledger/commit/19deafdb057a63d1edccbb5b011c6edc91b77167))
* **claude:** design and critique in Figma through the Figma MCP server ([#35](https://github.com/ahmax99/folio-sub-ledger/issues/35)) ([7562fb4](https://github.com/ahmax99/folio-sub-ledger/commit/7562fb4601b1320d798d12b8f553bc8fe734f374))
* **design:** move the design workflow from Figma to Penpot ([#61](https://github.com/ahmax99/folio-sub-ledger/issues/61)) ([dfb2913](https://github.com/ahmax99/folio-sub-ledger/commit/dfb29138c55fd67a4d9affccb0118c7188d60937))
* **harness:** add read-only Neon diagnostics to /db-check ([#78](https://github.com/ahmax99/folio-sub-ledger/issues/78)) ([f41d23c](https://github.com/ahmax99/folio-sub-ledger/commit/f41d23c00b2a41b3a6be8c87dabb7c5358ad4ce3))
* **harness:** record architecture decisions as ADRs ([#68](https://github.com/ahmax99/folio-sub-ledger/issues/68)) ([85851bf](https://github.com/ahmax99/folio-sub-ledger/commit/85851bf7d18499685afd4511d24078f86e8e1ce6))
* **infra:** manage the Neon projects in Terraform ([#80](https://github.com/ahmax99/folio-sub-ledger/issues/80)) ([2508f17](https://github.com/ahmax99/folio-sub-ledger/commit/2508f1754e598ed5bba5e37de9fea9cbd65def97))
* **infra:** stop managing the runtime secret's value in Terraform ([#83](https://github.com/ahmax99/folio-sub-ledger/issues/83)) ([be9a078](https://github.com/ahmax99/folio-sub-ledger/commit/be9a078c622d6ef417c95a3530472742456ca2d9))
* isolate each firm's data with CASL and Postgres RLS ([#56](https://github.com/ahmax99/folio-sub-ledger/issues/56)) ([ecd1115](https://github.com/ahmax99/folio-sub-ledger/commit/ecd11154af191ba27af2feea45f571506144481f))
* **members:** add the firm members page at /organization/members ([#96](https://github.com/ahmax99/folio-sub-ledger/issues/96)) ([1d64a88](https://github.com/ahmax99/folio-sub-ledger/commit/1d64a88eafcb4f3c0248ad6a948077ee26b37df1))
* **neon:** log the API in as rotating runtime database users ([#79](https://github.com/ahmax99/folio-sub-ledger/issues/79)) ([223a8bc](https://github.com/ahmax99/folio-sub-ledger/commit/223a8bc220775ad0704050c979ec614f3ab7275a))
* signup creates the firm and its Owner ([#46](https://github.com/ahmax99/folio-sub-ledger/issues/46)) ([36187b8](https://github.com/ahmax99/folio-sub-ledger/commit/36187b8febc253fe41a0dd6a080359b7a31d0b44))
* **web:** add the Folio fold logo, brand masters and web icons ([#67](https://github.com/ahmax99/folio-sub-ledger/issues/67)) ([3911e7c](https://github.com/ahmax99/folio-sub-ledger/commit/3911e7ceb043222e1b2522e62f03dcad054b71de))
* **web:** migrate frontend from Next.js 16 to TanStack Start v1 ([#18](https://github.com/ahmax99/folio-sub-ledger/issues/18)) ([f423af5](https://github.com/ahmax99/folio-sub-ledger/commit/f423af51dbe9d4540a54c2f86eda9a10804c5802))
* **web:** move forms to TanStack Form and data fetching to TanStack Query ([#33](https://github.com/ahmax99/folio-sub-ledger/issues/33)) ([164a3e9](https://github.com/ahmax99/folio-sub-ledger/commit/164a3e9f431170b25e92bdc3f26508853c6db67e))
* **web:** swap React's client runtime for TanStack Redact; upgrade all packages ([#31](https://github.com/ahmax99/folio-sub-ledger/issues/31)) ([6b37f14](https://github.com/ahmax99/folio-sub-ledger/commit/6b37f1431f0601784a86eef9410fd1b7d8d420a2))


### Bug Fixes

* **ci:** close the Neon review's high and medium findings ([#87](https://github.com/ahmax99/folio-sub-ledger/issues/87)) ([9f87070](https://github.com/ahmax99/folio-sub-ledger/commit/9f870703c75aba0f498d70b3b4da8d71e078a05d))
* **web:** align routing, session and auth flow with TanStack conventions ([#59](https://github.com/ahmax99/folio-sub-ledger/issues/59)) ([79c9f34](https://github.com/ahmax99/folio-sub-ledger/commit/79c9f34e647897ec6f95d5684a88f39014254597))
* **web:** bump TanStack Redact to 0.3.1 so loader errors reach the error screen ([#55](https://github.com/ahmax99/folio-sub-ledger/issues/55)) ([ff0fd63](https://github.com/ahmax99/folio-sub-ledger/commit/ff0fd6316f21798be0f3f5c4ed904aaf4a2ef2b4))
* **web:** install bun outside /root so the Lambda user can run it ([#20](https://github.com/ahmax99/folio-sub-ledger/issues/20)) ([f485525](https://github.com/ahmax99/folio-sub-ledger/commit/f4855251590a5cd19ac4f5662fca17afa8542cd1))
* **web:** keep the signed-in header on one line at 375px and focus the firm field on invalid submit ([#47](https://github.com/ahmax99/folio-sub-ledger/issues/47)) ([6237e74](https://github.com/ahmax99/folio-sub-ledger/commit/6237e745083361b1e3fbd46cb5ccc6b02e165658))
* **web:** restore form spacing and give stacked member rows room ([#97](https://github.com/ahmax99/folio-sub-ledger/issues/97)) ([28a13fe](https://github.com/ahmax99/folio-sub-ledger/commit/28a13fe9a9a85699793d88ca81c11f0f092d79b5))
* **web:** run bun with --no-install so Lambda's read-only disk doesn't crash it ([#21](https://github.com/ahmax99/folio-sub-ledger/issues/21)) ([c9a56ca](https://github.com/ahmax99/folio-sub-ledger/commit/c9a56cafb91c5598187557b93e7d6430eef3b050))
* **web:** scope Tailwind's class scan to src so SSR and client CSS match ([#22](https://github.com/ahmax99/folio-sub-ledger/issues/22)) ([a6ceaaa](https://github.com/ahmax99/folio-sub-ledger/commit/a6ceaaa277861754ffc839cc8f834e6a06a4c05d))
