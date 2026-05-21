# expo-mobile-app

Environment-aware Expo app with development and staging builds, wired for local iOS/Android testing and ready for EAS build profiles.

This project uses:

- Expo + React Native
- Dynamic `app.config.ts` with `APP_ENV`-driven configuration [file:46]
- A small `apiClient` that reads environment info from Expo config and exposes it in the UI

---

## Prerequisites

- Node.js (LTS) and npm
- macOS with Xcode for iOS Simulator (no Apple Developer account required for simulator) [web:1]
- Android Studio for Android emulator (optional) [web:2]
- Expo CLI (installed via `npx` in the commands below)

---

## Install and bootstrap

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Metro bundler with an environment-specific script (see next section).

You can start developing by editing the files inside the `app` (or `src/app`) directory. This project uses file-based routing via Expo Router. [file:46][web:3]

---

## Running the app locally

The home screen imports `appEnv` and `apiBaseUrl` from `apiClient` and displays a “Current environment” row so you can visually verify which environment a given run is using. [file:46]

### Development environment (APP_ENV=development)

Add this script in `package.json`:

```jsonc
"scripts": {
  "dev:dev": "APP_ENV=development npx expo start"
}
```

Run:

```bash
npm run dev:dev
```

Then in the Metro CLI:

- Press `i` to open the iOS Simulator
- Press `a` to open the Android emulator

On the home screen you should see something like:

- Environment: `development`
- API base URL: `https://api-dev.example.test` (stubbed value from config)

This confirms the environment wiring from `APP_ENV` → `app.config.ts` → `extra` → `apiClient` → UI.

### Staging environment (APP_ENV=staging)

Add this script in `package.json`:

```jsonc
"scripts": {
  "dev:staging": "APP_ENV=staging npx expo start"
}
```

Run:

```bash
npm run dev:staging
```

Open the app on iOS Simulator or Android emulator as above.

You should now see:

- Environment: `staging`
- API base URL: `https://api-staging.example.test` (stubbed)

This gives you an instant environment validation check per run.

---

## Configuration: `app.config.ts`

The dynamic Expo config is responsible for translating `APP_ENV` into app behavior.

Core responsibilities:

- Read `APP_ENV` from `process.env` with a default of `development`
- Expose env info to JS via `extra`:

  ```ts
  extra: {
    appEnv,
    apiBaseUrl: appEnv === "staging"
      ? "https://api-staging.example.test"
      : "https://api-dev.example.test",
  }
  ```

- Configure bundle identifiers / package names per environment:

  ```ts
  ios: {
    bundleIdentifier: appEnv === "staging"
      ? "com.yourcompany.expoapp.staging"
      : "com.yourcompany.expoapp.dev",
  },
  android: {
    package: appEnv === "staging"
      ? "com.yourcompany.expoapp.staging"
      : "com.yourcompany.expoapp.dev",
  },
  ```

- Set up `updates.url` and `runtimeVersion` so OTA updates can later be targeted per channel/runtime when you use EAS. [web:4]

This lets you have separate dev/staging apps that can coexist on devices and be rolled out independently once you start building with EAS.

---

## Runtime environment access: `apiClient`

`apiClient` is responsible for reading the Expo config at runtime and exposing environment data to the app.

Typical behavior:

- Reads `extra` from `Constants.expoConfig` (or manifest fallback on some platforms) [web:5]
- Exports:
  - `appEnv` – `"development"` or `"staging"`
  - `apiBaseUrl` – the base URL for network calls in the current environment
- Logs the resolved values on startup so you can see them in Metro logs
- The home screen imports `appEnv` and `apiBaseUrl` and renders them in a “Current environment” row

This pattern makes environment validation and future observability (e.g., logging with env tags) straightforward.

---

## EAS build profiles

This project is already wired with EAS build profiles in `eas.json`. [file:47]

`eas.json`:

```jsonc
{
  "cli": {
    "appVersionSource": "remote",
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development",
      },
      "channel": "development",
    },
    "staging": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "staging",
      },
      "channel": "staging",
    },
    "production": {
      "distribution": "store",
      "env": {
        "APP_ENV": "staging",
      },
      "channel": "production",
    },
  },
}
```

How this ties into the app:

- Each build profile sets `env.APP_ENV` for that build. [file:47]
- `app.config.ts` reads `process.env.APP_ENV` and:
  - sets `extra.appEnv` and `extra.apiBaseUrl`
  - chooses bundle identifiers / package names based on the environment
- At runtime, `apiClient` reads `extra`, and the UI/console confirms which environment that build is targeting.

### Example EAS commands (for when you’re ready)

Once you’re ready to use EAS and have platform accounts configured, you can run:

```bash
# Dev client / development env
npx eas build --profile development --platform ios

# Staging env internal build
npx eas build --profile staging --platform ios

# Store build (currently wired to staging env)
npx eas build --profile production --platform ios
```

Each of these builds will:

- Use the correct `APP_ENV` from `eas.json`
- Show the environment and base URL on the home screen
- Be associated with the corresponding EAS update channel (`development`, `staging`, `production`) for OTA updates later [web:4][file:47]

---

## iOS and Android (local only)

Right now, the project is set up to:

- Run on iOS Simulator and Android emulator via `npx expo start` [file:46]
- Use dynamic config for bundle IDs and API base URLs
- Be ready for EAS profiles, but you can still work entirely locally without an Apple Developer account or EAS setup

Use the `dev:dev` and `dev:staging` scripts during local development, and move to EAS builds when you want installable dev/staging apps on devices.
