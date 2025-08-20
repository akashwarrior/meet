import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/db";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret || !baseURL) {
  console.log("secret", secret);
  console.log("baseURL", baseURL);
  throw new Error("BETTER_AUTH_SECRET and BETTER_AUTH_URL must be set");
}

export const auth = betterAuth({
  secret,
  baseURL,

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
