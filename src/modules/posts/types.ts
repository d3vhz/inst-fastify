import { Static } from "typebox";

import { PostStatusEnum } from "./constants";
import {
  CreatePostSchema,
  PostSchema,
  QueryPostPaginationSchema,
  UpdatePostSchema,
} from "./schemas";

type PostStatusType = (typeof PostStatusEnum)[keyof typeof PostStatusEnum];

type Post = Static<typeof PostSchema>;

type CreatePost = Static<typeof CreatePostSchema> &
  Pick<Static<typeof PostSchema>, "userId" | "status">;
type UpdatePost = Pick<Static<typeof PostSchema>, "userId" | "id"> & {
  changes: Static<typeof UpdatePostSchema>;
};

type PostQuery = Static<typeof QueryPostPaginationSchema>;

export type { PostStatusType, Post, CreatePost, UpdatePost, PostQuery };
