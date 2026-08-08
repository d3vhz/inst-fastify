import { FastifyInstance } from "fastify";

import { Prisma } from "~/shared/lib";

import { buildWhere } from "./helpers";
import { CreatePost, PostQuery, UpdatePost } from "./types";

function createPostsRepository(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  return {
    async paginate({ q, userId }: { q: PostQuery; userId: string }) {
      const skip = (q.page - 1) * q.limit;
      const where = buildWhere(q);

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          skip,
          take: q.limit,
          orderBy: { createdAt: q.order },
          include: {
            user: true,
            postLikes: {
              take: 20,
              orderBy: { createdAt: "desc" },
              select: {
                user: true,
                postId: true,
                userId: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.post.count({ where }),
      ]);

      let likedPostIds = new Set<string>();
      let savedPostIds = new Set<string>();

      if (userId) {
        const postIds = posts.map((p) => p.id);

        if (postIds.length > 0) {
          const userLikes = await prisma.postLike.findMany({
            where: {
              userId,
              postId: { in: postIds },
            },
            select: { postId: true },
          });

          const userSaves = await prisma.postSave.findMany({
            where: {
              userId,
              postId: { in: postIds },
            },
            select: { postId: true },
          });

          likedPostIds = new Set(userLikes.map((like) => like.postId));
          savedPostIds = new Set(userSaves.map((like) => like.postId));
        }
      }

      const postsWithLikeStatus = posts.map((post) => ({
        ...post,
        likedByUser: likedPostIds.has(post.id),
        savedByUser: savedPostIds.has(post.id),
      }));

      return {
        posts: postsWithLikeStatus,
        total,
      };
    },

    async findById({ id, userId }: { id: string; userId: string }) {
      const [post, userLike, userSave] = await Promise.all([
        prisma.post.findUnique({
          where: { id },
          include: {
            user: true,
            postLikes: {
              take: 20,
              orderBy: { createdAt: "desc" },
              select: {
                user: true,
                postId: true,
                userId: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.postLike.findUnique({
          where: {
            postId_userId: { postId: id, userId },
          },
          select: { userId: true },
        }),
        prisma.postSave.findUnique({
          where: {
            postId_userId: { postId: id, userId },
          },
          select: { userId: true },
        }),
      ]);

      if (!post) return null;

      return {
        ...post,
        likedByUser: Boolean(userLike),
        savedByUser: Boolean(userSave),
      };
    },

    async create(newPost: CreatePost) {
      const post = await prisma.post.create({
        data: newPost,
      });
      return post.id;
    },

    async update({ userId, id, changes }: UpdatePost) {
      try {
        const post = await prisma.post.update({
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
        const post = await prisma.post.delete({
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

    async findSave({ userId, id }: { userId: string; id: string }) {
      return prisma.postSave.findUnique({
        where: {
          postId_userId: { postId: id, userId },
        },
      });
    },

    async addSave({ userId, id }: { userId: string; id: string }) {
      const existingPostSave = await prisma.postSave.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (existingPostSave) return id;

      const createdPostSave = await prisma.postSave.create({
        data: { userId, postId: id },
      });

      return createdPostSave.postId;
    },
    async removeSave({ userId, id }: { userId: string; id: string }) {
      const existingPostSave = await prisma.postSave.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (!existingPostSave) return id;

      const deletedPostSave = await prisma.postSave.delete({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      return deletedPostSave.postId;
    },

    async findLike({ userId, id }: { userId: string; id: string }) {
      return prisma.postLike.findUnique({
        where: {
          postId_userId: { postId: id, userId },
        },
      });
    },

    async addLike({ userId, id }: { userId: string; id: string }) {
      const existingPostLike = await prisma.postLike.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (existingPostLike) return id;

      const createdPostLike = await prisma.postLike.create({
        data: { userId, postId: id },
      });

      return createdPostLike.postId;
    },
    async removeLike({ userId, id }: { userId: string; id: string }) {
      const existingPostLike = await prisma.postLike.findUnique({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      if (!existingPostLike) return id;

      const deletedPostLike = await prisma.postLike.delete({
        where: {
          postId_userId: { userId, postId: id },
        },
      });

      return deletedPostLike.postId;
    },
  };
}

export { createPostsRepository };
