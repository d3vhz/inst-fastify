import { Type } from "typebox";

import { NumberSchema, IdSchema, UrlSchema, DateTimeSchema } from "~/shared/types";

const CaptionSchema = Type.String({
  minLength: 1,
  maxLength: 500,
});
const PostStatusSchema = Type.Union([Type.Literal("active"), Type.Literal("archived")]);
const PostImgUrlsSchema = Type.Array(UrlSchema, {
  minItems: 1,
  maxItems: 5,
  uniqueItems: true,
  description: "Array of valid HTTP/HTTPS URLs",
});

const PostSchema = Type.Object({
  id: IdSchema,
  userId: Type.String(),

  imgUrls: PostImgUrlsSchema,
  caption: CaptionSchema,
  status: PostStatusSchema,
  likes: NumberSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema,
});

const CreatePostSchema = Type.Object({
  caption: CaptionSchema,
});

const UpdatePostSchema = Type.Object({
  caption: Type.Optional(CaptionSchema),
  status: Type.Optional(PostStatusSchema),
  imgUrls: Type.Optional(PostImgUrlsSchema),
});

const QueryPostPaginationSchema = Type.Object({
  page: Type.Integer({ minimum: 1, default: 1 }),
  limit: Type.Integer({ minimum: 1, maximum: 100, default: 20 }),
  search: Type.Optional(Type.String()),
  userId: Type.Optional(Type.String()),
  status: Type.Optional(PostStatusSchema),
  order: Type.Optional(
    Type.Union([Type.Literal("asc"), Type.Literal("desc")], { default: "desc" }),
  ),
});

const PostPaginationResultSchema = Type.Object({
  total: Type.Integer({ minimum: 0, default: 0 }),
  posts: Type.Array(PostSchema),
});

const PostLikeSchema = Type.Object({
  postId: IdSchema,
  userId: IdSchema,
});

export {
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  QueryPostPaginationSchema,
  PostPaginationResultSchema,
  PostLikeSchema,
};
