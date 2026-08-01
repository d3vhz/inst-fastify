import { FastifyInstance } from "fastify";

import { Prisma } from "~/shared/lib";

import { buildWhere } from "./helpers";
import { CreatePost, PostQuery, UpdatePost } from "./types";

function createPostsRepository(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  return {
    async paginate(q: PostQuery) {
      const skip = (q.page - 1) * q.limit;

      const where = buildWhere(q);

      const [posts, total] = await Promise.all([
        prisma.posts.findMany({
          where,
          skip,
          take: q.limit,
          orderBy: {
            createdAt: q.order,
          },
        }),
        prisma.posts.count({ where }),
      ]);

      return {
        posts,
        total,
      };
    },

    async findById(id: string) {
      return prisma.posts.findUnique({
        where: { id },
      });
    },

    async create(newPost: CreatePost) {
      const post = await prisma.posts.create({
        data: newPost,
      });
      return post.id;
    },

    async update({ userId, id, changes }: UpdatePost) {
      try {
        const post = await prisma.posts.update({
          where: { userId, id },
          data: changes,
        });
        return post;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return null;
        }
        throw error;
      }
    },

    async delete({ userId, id }: { userId: string; id: string }) {
      try {
        const post = await prisma.posts.delete({
          where: { userId, id },
        });
        return post.id;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return false;
        }
        throw error;
      }
    },

    async findPostLike({ userId, id }: { userId: string; id: string }) {
      return prisma.postLikes.findUnique({
        where: {
          postId_userId: { postId: id, userId },
        },
      });
    },

    async addLike({ userId, id }: { userId: string; id: string }) {
      const existingPostLike = await prisma.postLikes.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (existingPostLike) return id;

      const createdPostLike = await prisma.postLikes.create({
        data: { userId, postId: id },
      });

      return createdPostLike.postId;
    },
    async removeLike({ userId, id }: { userId: string; id: string }) {
      const existingPostLike = await prisma.postLikes.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (!existingPostLike) return id;

      const deletedPostLike = await prisma.postLikes.delete({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      return deletedPostLike.postId;
    },
  };
}

export { createPostsRepository };
