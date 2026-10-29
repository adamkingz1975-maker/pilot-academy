# Checks

Run `npm test` with Node.js 22 or newer. No dependency installation is needed.

For integration tests, serve the repository over localhost, install Playwright and
its Chromium browser separately, then run `node tests/browser.cjs`.
`PILOT_CHROMIUM_PATH` selects an existing Chromium executable;
`PILOT_TEST_URL` selects the URL, including a GitHub Pages style subpath.
`PILOT_TEST_WEBKIT=1` additionally runs an installed Playwright WebKit browser.
Browser tests write only to the isolated test browser's storage.

Coverage includes legacy migration, language switching within lessons and answered
questions, correct and wrong answers, all lesson/quiz content, disabled duplicate
answers, persisted totals, offline reload, reset, corrupt/blocked/future storage,
and horizontal layout at 390 CSS pixels. Playwright WebKit is not an actual iPhone;
installation, microphone and device voices still require real-device checks.

Training-variant checks cover Germany as the default and selection of Poland
independently of German/Polish display language, including persisted country.

## Phase 1.1

`npm run prepare:release` generates versioned asset URLs and the SHA-256 release
manifest locally. `npm run check:release` detects stale preparation without writing.
Always run preparation again after changing a runtime file.

`npm run test:browser` starts a temporary loopback-only server and runs both the
existing browser suite and the new release tests. No fixtures are written to the
repository and no external service is contacted. Historical fixtures are read
from the original Git commit `409d47e100488ce51917ea5ba7fce1e7cce36800`.

Release cases include missing modules and retry, JavaScript-disabled fallback,
failed worker precaching and retry in both languages, keyboard focus, stable focus
on background events, manifest identity/localization, cache eviction and repair,
recovery updates without a functioning app module graph, original-version update
and progress migration, mixed-release rejection, preservation of the active app,
and a waiting-update notice in German and Polish.

The next-release fixture changes worker/release metadata only in memory. It is
not a deployment. Chromium checks do not replace actual iPhone Safari, installed
PWA, VoiceOver, storage-pressure, or device-voice testing. HTTP caching headers on
GitHub Pages also require post-deployment observation after explicit approval.

## Version 1.1.1 redirect regressions

`npm run test:redirects` uses the exact historical 1.1 commit `85c1744...` and the
local 1.1.1 files. It runs at both `/` and `/pilot-academy/` with HTTP 301, 302, 307
and 308 index redirects. The test reproduces the historical bad cache and failed
navigation, serves the independent recovery page through that old worker, updates
the existing registration, closes controlled pages, and checks offline startup
and byte-identical localStorage progress. It also tests a deliberately unavailable
recovery page, a canonical HTML redirect, backup download, and injected redirected
cache entries. Isolation is through disposable Playwright contexts; these fixtures
are not connected to the user's Safari data.

The release manifest lists `./` and `./recovery/`, mapped to physical index.html
files by the generator and test server. Do not reinstate network precaching of
`./index.html`. Hosting must return the canonical directory URLs directly as 200
HTML. Actual iOS Safari and deployed Cloudflare/GitHub headers remain manual checks.
