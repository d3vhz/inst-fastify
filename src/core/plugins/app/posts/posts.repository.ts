import fp from "fastify-plugin";

import { createPostsRepository } from "~/modules/posts";

declare module "fastify" {
  export interface FastifyInstance {
    postsRepository: ReturnType<typeof createPostsRepository>;
  }
}

export default fp(
  async function (fastify) {
    fastify.decorate("postsRepository", createPostsRepository(fastify));
  },
  {
    name: "posts-repository",
    dependencies: ["prisma"],
  },
);
