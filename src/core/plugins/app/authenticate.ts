import fp from "fastify-plugin";

import { createAuthenticate, type IUser } from "~/core/auth";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: IUser;
  }
}

export default fp(
  function (fastify) {
    fastify.decorate("authenticate", createAuthenticate());
  },
  {
    name: "authenticate",
  },
);
