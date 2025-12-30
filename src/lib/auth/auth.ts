import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/db";
import { getAuthEnv } from "@/lib/env.server";

const authEnv = getAuthEnv();

export const auth = betterAuth({
  secret: authEnv.betterAuthSecret,
  baseURL: authEnv.betterAuthUrl,

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  telemetry: {
    enabled: false,
  },

  plugins: [nextCookies()],
});
