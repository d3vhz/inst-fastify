import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

import { PostStatusEnum } from "./constants";
import {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  QueryPostPaginationSchema,
  PostPaginationResultSchema,
} from "./schemas";

const postRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  const { postsRepository } = fastify;
  fastify.get(
    "/",
    {
      schema: {
        querystring: QueryPostPaginationSchema,
        response: {
          200: PostPaginationResultSchema,
        },
        tags: ["Posts"],
      },
    },
    async function (request) {
      return postsRepository.paginate(request.query);
    },
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: PostSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const post = await postsRepository.findById({
        userId: request.user.id,
        id: request.params.id,
      });

      if (!post) {
        return reply.notFound("Post not found");
      }

      return post;
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: CreatePostSchema,
        response: {
          201: {
            id: Type.Number(),
          },
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const newPost = {
        ...request.body,
        userId: request.user.id,
        status: PostStatusEnum.Active,
      };

      const id = await postsRepository.create(newPost);

      reply.code(201);

      return { id };
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
        body: UpdatePostSchema,
        response: {
          200: PostSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const updatedPost = await postsRepository.update({
        userId: request.user.id,
        id: request.params.id,
        changes: request.body,
      });

      if (!updatedPost) {
        return reply.notFound("Post not found");
      }

      return updatedPost;
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
          204: PostSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const deletedPost = await postsRepository.delete({
        userId: request.user.id,
        id: request.params.id,
      });
      if (!deletedPost) {
        return reply.notFound("Post not found");
      }

      return deletedPost;
    },
  );

  fastify.post(
    "/add-like",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          201: {
            success: Type.Boolean(),
          },
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      await postsRepository.addLike({
        userId: request.user.id,
        id: request.body.id,
      });

      reply.code(201);

      return { success: true };
    },
  );

  fastify.delete(
    "/remove-like",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: {
            success: Type.Boolean(),
          },
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      await postsRepository.removeLike({
        userId: request.user.id,
        id: request.body.id,
      });

      reply.code(200);
      return { success: true };
    },
  );
};

export { postRoutes };
