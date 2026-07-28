import fp from "fastify-plugin";

import { createUsersRepository } from "~/modules/users";

declare module "fastify" {
  export interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export default fp(
  async function (fastify) {
    fastify.decorate("usersRepository", createUsersRepository(fastify));
  },
  {
    name: "users-repository",
    dependencies: ["prisma"],
  },
);
