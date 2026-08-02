import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

import { formatTimestamps } from "~/shared/lib";
import { IdSchema } from "~/shared/types";

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
      preHandler: [fastify.authenticate],
      schema: {
        querystring: QueryPostPaginationSchema,
        response: {
          200: PostPaginationResultSchema,
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const res = await postsRepository.paginate(request.query);

      reply.code(200);

      return {
        posts: res.posts.map((post) => formatTimestamps(post)),
        total: res.total,
      };
    },
  );

  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: PostSchema,
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const post = await postsRepository.findById(request.params.id);

      if (!post) {
        return reply.notFound("Post not found");
      }

      reply.code(200);

      return formatTimestamps(post);
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: CreatePostSchema,
        response: {
          201: Type.Object({ id: IdSchema }),
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

      const createdPostId = await postsRepository.create(newPost);

      reply.code(201);

      return { id: createdPostId };
    },
  );

  fastify.patch(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        body: UpdatePostSchema,
        response: {
          200: PostSchema,
          403: Type.Object({ message: Type.String() }),
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const foundPost = await postsRepository.findById(request.params.id);

      if (foundPost?.userId !== request.user.id) {
        return reply.forbidden("Access denied. You can only update your own posts.");
      }

      const post = await postsRepository.update({
        userId: request.user.id,
        id: request.params.id,
        changes: request.body,
      });

      if (!post) return reply.notFound("Post not found");

      reply.code(200);

      return formatTimestamps(post);
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: Type.Object({ id: IdSchema }),
          403: Type.Object({ message: Type.String() }),
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const foundPost = await postsRepository.findById(request.params.id);

      if (foundPost?.userId !== request.user.id) {
        return reply.forbidden("Access denied. You can only delete your own posts.");
      }

      const id = await postsRepository.delete({
        userId: request.user.id,
        id: request.params.id,
      });

      if (!id) return reply.notFound("Post not found");

      reply.code(200);

      return { id };
    },
  );

  fastify.get(
    "/:id/post-save",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: Type.Object({ hasPostSave: Type.Boolean() }),
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const postSave = await postsRepository.findSave({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(200);

      return {
        hasPostSave: Boolean(postSave),
      };
    },
  );

  fastify.post(
    "/:id/add-save",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          201: Type.Object({ id: IdSchema }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const id = await postsRepository.addSave({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(201);

      return { id };
    },
  );

  fastify.delete(
    "/:id/remove-save",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: Type.Object({ id: IdSchema }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const id = await postsRepository.removeSave({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(200);

      return { id };
    },
  );

  fastify.get(
    "/:id/post-like",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: Type.Object({ hasPostLike: Type.Boolean() }),
          404: Type.Object({ message: Type.String() }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const postLike = await postsRepository.findLike({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(200);

      return {
        hasPostLike: Boolean(postLike),
      };
    },
  );

  fastify.post(
    "/:id/add-like",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          201: Type.Object({ id: IdSchema }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const id = await postsRepository.addLike({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(201);

      return { id };
    },
  );

  fastify.delete(
    "/:id/remove-like",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: Type.Object({ id: IdSchema }),
        response: {
          200: Type.Object({ id: IdSchema }),
        },
        tags: ["Posts"],
      },
    },
    async function (request, reply) {
      const id = await postsRepository.removeLike({
        userId: request.user.id,
        id: request.params.id,
      });

      reply.code(200);

      return { id };
    },
  );
};

export { postRoutes };
