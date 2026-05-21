# expo-mobile-app

Expo + React Native mobile app with explicit **development**, **staging**, and **production** environments.  
Environment selection is driven by `APP_ENV` and is consistent across local runs and EAS build profiles.

---

## Prerequisites

- Node.js (LTS) and npm
- iOS Simulator (Xcode) and/or Android emulator
- Expo CLI via `npx expo`

---

## Installation

```bash
npm install
```

---

## Running the app locally

The app reads `APP_ENV` in `app.config.ts`, exposes it via `extra.appEnv` and `extra.apiBaseUrl`, and `apiClient` surfaces these in the UI (for example, “Current environment” and base URL).

### Environment-aware scripts

Defined in `package.json`:

```jsonc
"scripts": {
  "start": "expo start",
  "dev:dev": "cross-env APP_ENV=development expo start",
  "dev:staging": "cross-env APP_ENV=staging expo start",
  "dev:production": "cross-env APP_ENV=production expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint"
}
```

Usage (with Expo Go on simulator/emulator):

- Development:

  ```bash
  npm run dev:dev
  ```

- Staging:

  ```bash
  npm run dev:staging
  ```

- Production (for validation):

  ```bash
  npm run dev:production
  ```

Then, in the Expo dev tools or terminal, choose **Expo Go** and open on iOS Simulator or Android emulator. The environment indicator in the app should match the script you used.

---

## Environment configuration

`app.config.ts` centralizes environment-specific behavior:

- Supported environments: `development`, `staging`, `production` (via `APP_ENV`)
- Per-environment values:
  - App name:
    - `expo Mobile App Development`
    - `expo Mobile App Staging`
    - `expo Mobile App`
  - API base URL (example placeholders):
    - Dev: `https://api-dev.example.test`
    - Staging: `https://api-staging.example.test`
    - Prod: `https://api.example.com`
  - Bundle identifiers / package names:
    - iOS / Android dev: `com.yourcompany.expoapp.dev`
    - iOS / Android staging: `com.yourcompany.expoapp.staging`
    - iOS / Android prod: `com.yourcompany.expoapp`

These values are exposed via `extra.appEnv` and `extra.apiBaseUrl`, and consumed by `apiClient` and the UI.

---

## EAS build profiles

`eas.json` defines environment-aligned build profiles:

```jsonc
{
  "cli": {
    "appVersionSource": "remote",
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_ENV": "development" },
      "channel": "development",
    },
    "staging": {
      "distribution": "internal",
      "env": { "APP_ENV": "staging" },
      "channel": "staging",
    },
    "production": {
      "distribution": "store",
      "env": { "APP_ENV": "production" },
      "channel": "production",
    },
  },
}
```

Each profile:

- Sets `APP_ENV` for the build.
- Selects the corresponding update channel (for future EAS Update usage).
- Uses `app.config.ts` to derive app name, bundle IDs, and API base URL.

Example build commands (for later, when accounts are configured):

```bash
# Development build
eas build --profile development --platform ios

# Staging build
eas build --profile staging --platform ios

# Production build
eas build --profile production --platform ios
```

---

## GitHub workflows

Located under `.github/workflows`:

### `mobile-lint.yml`

- Runs on:
  - Manual trigger (`workflow_dispatch`)
  - Pushes to `main`
  - Pull requests targeting `main`
- Steps:
  - Checkout repo
  - Setup Node with npm cache
  - `npm ci`
  - `npm run lint`
- Purpose: fast feedback on linting and basic code quality for the mobile app.

### `mobile-eas-build.yml`

- **Manual only**: triggered via `workflow_dispatch` from the GitHub Actions UI.
- Inputs:
  - `platform`: `all` | `ios` | `android`
  - `profile`: `development` | `staging` | `production`
- Steps:
  - Checkout repo
  - Setup Node
  - Setup Expo/EAS using `EXPO_TOKEN` GitHub secret
  - `npm ci`
  - `eas build` with the chosen profile and platform (`--non-interactive --no-wait`)
- Purpose: on-demand EAS builds aligned with `eas.json` profiles, without tying builds to any particular branch or release flow yet.

---

## Linting

ESLint is configured using `eslint-config-expo` with TypeScript support. Run:

```bash
npm run lint
```

to check for common issues (e.g., equality, unused variables, basic TypeScript rules).
