import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

import { UserSchema, UpdateUserSchema } from "./schemas";

const userRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { usersRepository } = fastify;
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: UserSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Users"],
      },
    },
    async function (request, reply) {
      const user = await usersRepository.findById(request.user.id);

      if (!user) {
        return reply.notFound("User not found");
      }

      return user;
    },
  );

  fastify.patch(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        body: UpdateUserSchema,
        response: {
          200: UserSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Users"],
      },
    },
    async function (request, reply) {
      const updatedUser = await usersRepository.update({
        id: request.user.id,
        changes: request.body,
      });

      if (!updatedUser) {
        return reply.notFound("User not found");
      }

      return updatedUser;
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          204: UserSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Users"],
      },
    },
    async function (request, reply) {
      const deletedUser = await usersRepository.delete(request.user.id);
      if (!deletedUser) {
        return reply.notFound("User not found");
      }

      return deletedUser;
    },
  );
};

export { userRoutes };
