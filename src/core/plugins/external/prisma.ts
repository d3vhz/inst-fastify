import { PrismaPg } from "@prisma/adapter-pg";
import fp from "fastify-plugin";

import { PrismaClient } from "~/shared/lib/prisma";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const databaseUrl = process.env.SUPABASE_DATABASE_URL;

export default fp(
  async function (server) {
    if (!databaseUrl) {
      throw new Error("SUPABASE_DATABASE_URL is required");
    }

    const prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: databaseUrl,
      }),
    });
    await prisma.$connect();
    server.decorate("prisma", prisma);
    server.addHook("onClose", async (server) => {
      await server.prisma.$disconnect();
    });
  },
  { name: "prisma" },
);
