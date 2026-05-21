import * as dotenv from "dotenv";
dotenv.config(); // loads .env into process.env

import type { ExpoConfig } from "@expo/config-types";

console.log(">>> app.config.ts IS BEING USED");

const rawEnv = process.env.APP_ENV as "development" | "staging" | undefined;
const appEnv: "development" | "staging" = rawEnv ?? "development";

console.log("app.config.ts process.env.APP_ENV =", process.env.APP_ENV);
console.log("app.config.ts resolved appEnv =", appEnv);

const isStaging = appEnv === "staging";

const config: ExpoConfig = {
  name: isStaging ? "expo Mobile App Staging" : "expo Mobile App Development",
  slug: "expo-mobile-app",
  version: "1.0.0", // you can bump this later or wire it to git
  extra: {
    eas: {
      projectId: "66d22f13-7b0c-4573-a26a-fddc5128141a",
    },
    appEnv,
    apiBaseUrl: isStaging
      ? "https://api-staging.example.test"
      : "https://api-dev.example.test",
  },
  ios: {
    bundleIdentifier: isStaging
      ? "com.yourcompany.expoapp.staging"
      : "com.yourcompany.expoapp.dev",
  },
  android: {
    package: isStaging
      ? "com.yourcompany.expoapp.staging"
      : "com.yourcompany.expoapp.dev",
  },
  // 👇 This is what EAS asked you to add
  updates: {
    url: "https://u.expo.dev/66d22f13-7b0c-4573-a26a-fddc5128141a",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};

export default config;
