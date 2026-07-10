import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async function () {
      return { message: "ok" };
    },
  );
};

export default plugin;
