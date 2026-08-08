import { FastifyInstance } from "fastify";

import { Prisma } from "~/shared/lib";

import { UpdateUser } from "./types";

function createUsersRepository(fastify: FastifyInstance) {
  const prisma = fastify.prisma;

  return {
    async findById(id: string) {
      return prisma.user.findUnique({
        where: { id },
      });
    },

    async update({ id, changes }: UpdateUser) {
      try {
        const user = await prisma.user.update({
          where: { id },
          data: changes,
        });
        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return null;
        }
        throw error;
      }
    },

    async delete(id: string) {
      try {
        const deletedUser = await prisma.user.delete({
          where: { id },
        });
        return deletedUser;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
          return false;
        }
        throw error;
      }
    },
  };
}

export { createUsersRepository };
