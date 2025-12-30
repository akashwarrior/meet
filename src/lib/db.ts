import "server-only";

import { PrismaClient } from "@prisma/client";
import { getNodeEnv } from "@/lib/env.server";

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
};
const nodeEnv = getNodeEnv();

const prisma = globalForPrisma.prisma || new PrismaClient();

if (nodeEnv !== "production") globalForPrisma.prisma = prisma;

export default prisma;
