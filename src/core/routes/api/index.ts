import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get("/", ({ protocol, hostname }) => {
    return {
      message: `Hello! See documentation at ${protocol}://${hostname}/docs`,
    };
  });
  fastify.get("/health", () => {
    return {
      status: "ok",
    };
  });
}
