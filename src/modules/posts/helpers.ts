import { Prisma } from "~/shared/lib";
import { PostQuery } from "./types";

const buildWhere = (q: PostQuery): Prisma.PostsWhereInput => {
  return {
    ...(q.search && { caption: {
      contains: q.search,
      mode: 'insensitive'
    } }),
    ...(q.userId && { userId: q.userId }),
    ...(q.status && { status: q.status }),
  }
};

export { buildWhere }