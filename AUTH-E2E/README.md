# AUTH-E2E (Static) — Playwright E2E for Sign-up

A minimal **static HTML/CSS/JS** page with a sign-up form and **Playwright** tests.
No framework, no dev server — tests open the page via `file://` URL.

## Files
- `index.html` – the sign-up form
- `styles.css` – minimal styles
- `script.js` – simple validation + success message
- `e2e/signup.spec.js` – Playwright tests
- `playwright.config.ts` – Playwright config (no webServer)
- `package.json` – scripts and devDependency on `@playwright/test`

## Run
```bash
npm i
npx playwright install

# headless tests
npm run test:e2e

# UI mode
npm run test:e2e:ui
```

The tests will open `index.html` directly (no server needed).
