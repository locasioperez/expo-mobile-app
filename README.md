# expo-mobile-app

Environment-aware Expo app with development and staging builds, wired for local iOS/Android testing and ready for EAS build profiles.

This project uses:

- Expo + React Native
- Dynamic `app.config.ts` with `APP_ENV`-driven configuration
- A small `apiClient` that reads environment info from Expo config and exposes it in the UI

---

## Prerequisites

- Node.js (LTS) and npm
- macOS with Xcode for iOS Simulator (no Apple Developer account required for simulator)
- Android Studio for Android emulator (optional)
- Expo CLI (installed via `npx` in the commands below)

---

## Install and bootstrap

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Metro bundler with an environment-specific script (see next section).

You can start developing by editing the files inside the `app` (or `src/app`) directory. This project uses file-based routing via Expo Router.

---

## Running the app locally

The home screen imports `appEnv` and `apiBaseUrl` from `apiClient` and displays a “Current environment” row so you can visually verify which environment a given run is using.

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

- Set up `updates.url` and `runtimeVersion` so OTA updates can later be targeted per channel/runtime when you use EAS.

This lets you have separate dev/staging apps that can coexist on devices and be rolled out independently once you start building with EAS.

---

## Runtime environment access: `apiClient`

`apiClient` is responsible for reading the Expo config at runtime and exposing environment data to the app.

Typical behavior:

- Reads `extra` from `Constants.expoConfig` (or manifest fallback on some platforms)
- Exports:
  - `appEnv` – `"development"` or `"staging"`
  - `apiBaseUrl` – the base URL for network calls in the current environment
- Logs the resolved values on startup so
