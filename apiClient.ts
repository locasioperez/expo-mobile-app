// apiClient.ts
import Constants from "expo-constants";

type AppEnv = "development" | "staging" | "production";

type ExtraConfig = {
  appEnv: AppEnv;
  apiBaseUrl: string;
};

function getExtra(): ExtraConfig | undefined {
  // Native: expoConfig should be present
  const expoConfig: any = Constants.expoConfig;
  if (expoConfig?.extra) {
    console.log(
      "[apiClient] using Constants.expoConfig.extra:",
      expoConfig.extra,
    );
    return expoConfig.extra as ExtraConfig;
  }

  // Fallbacks for older/web manifests
  const manifest: any =
    (Constants as any).manifest2 ?? (Constants as any).manifest;
  if (manifest?.extra) {
    console.log("[apiClient] using manifest.extra:", manifest.extra);
    return manifest.extra as ExtraConfig;
  }

  console.log("[apiClient] no extra config found in Constants");
  return undefined;
}

const extra = getExtra();

// Default to development if nothing is set
export const appEnv: AppEnv = extra?.appEnv ?? "development";

// Default base URL is dev; app.config.ts will usually set this for you
export const apiBaseUrl: string =
  extra?.apiBaseUrl ?? "https://api-dev.example.test";

console.log("[apiClient] final appEnv:", appEnv);
console.log("[apiClient] final apiBaseUrl:", apiBaseUrl);
