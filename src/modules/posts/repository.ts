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

    async findById({ userId, id }: { userId: string; id: string }) {
      return prisma.posts.findUnique({
        where: { userId, id },
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
        return post;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return false;
        }
        throw error;
      }
    },

    async addLike({ userId, id }: { userId: string; id: string }) {
      await prisma.$transaction(async (tx) => {
        await tx.postLikes.create({
          data: { userId, postId: id },
        });

        await tx.posts.update({
          where: { userId, id },
          data: {
            likes: { increment: 1 },
          },
        });
      });
    },
    async removeLike({ userId, id }: { userId: string; id: string }) {
      await prisma.$transaction(async (tx) => {
        await tx.postLikes.delete({
          where: {
            postId_userId: { userId, postId: id },
          },
        });

        await tx.posts.update({
          where: { userId, id },
          data: {
            likes: { decrement: 1 },
          },
        });
      });
    },
  };
}

export { createPostsRepository };
