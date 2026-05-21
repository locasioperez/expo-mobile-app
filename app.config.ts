import * as dotenv from "dotenv";
dotenv.config(); // loads .env into process.env

import type { ExpoConfig } from "@expo/config-types";

// Allow three environments: development, staging, production
type AppEnv = "development" | "staging" | "production";

// Prefer APP_ENV from the process (npm scripts, EAS env), default to development
const rawEnv = process.env.APP_ENV as AppEnv | undefined;
const appEnv: AppEnv = rawEnv ?? "development";

const isStaging = appEnv === "staging";
const isProduction = appEnv === "production";

// Derive human-readable name per environment
const appName =
  appEnv === "production"
    ? "expo Mobile App"
    : appEnv === "staging"
      ? "expo Mobile App Staging"
      : "expo Mobile App Development";

// Derive API base URL per environment
const apiBaseUrl =
  appEnv === "production"
    ? "https://api.example.com"
    : appEnv === "staging"
      ? "https://api-staging.example.test"
      : "https://api-dev.example.test";

// Derive bundle identifiers / package names per environment
const iosBundleIdentifier = isProduction
  ? "com.yourcompany.expoapp"
  : isStaging
    ? "com.yourcompany.expoapp.staging"
    : "com.yourcompany.expoapp.dev";

const androidPackage = isProduction
  ? "com.yourcompany.expoapp"
  : isStaging
    ? "com.yourcompany.expoapp.staging"
    : "com.yourcompany.expoapp.dev";

const config: ExpoConfig = {
  name: appName,
  slug: "expo-mobile-app",
  version: "1.0.0", // bump this as you cut releases

  extra: {
    eas: {
      projectId: "66d22f13-7b0c-4573-a26a-fddc5128141a",
    },
    appEnv,
    apiBaseUrl,
  },

  ios: {
    bundleIdentifier: iosBundleIdentifier,
  },

  android: {
    package: androidPackage,
  },

  // EAS Update config (shared across envs; channel selection is done via EAS)
  updates: {
    url: "https://u.expo.dev/66d22f13-7b0c-4573-a26a-fddc5128141a",
  },

  // runtimeVersion ties OTA updates to the native build version
  runtimeVersion: {
    policy: "appVersion",
  },
};

export default config;
