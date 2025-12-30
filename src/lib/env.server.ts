const readRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getNodeEnv = () => process.env.NODE_ENV ?? "development";

export const getAuthEnv = () => ({
  betterAuthSecret: readRequiredEnv("BETTER_AUTH_SECRET"),
  betterAuthUrl: readRequiredEnv("BETTER_AUTH_URL"),
});

export const getLiveKitEnv = () => ({
  liveKitApiKey: readRequiredEnv("LIVEKIT_API_KEY"),
  liveKitApiSecret: readRequiredEnv("LIVEKIT_API_SECRET"),
  liveKitUrl: readRequiredEnv("NEXT_PUBLIC_LIVEKIT_URL"),
});
