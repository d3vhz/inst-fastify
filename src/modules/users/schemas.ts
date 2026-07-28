import { Type } from "typebox";

import { IdSchema, UrlSchema, StringSchema } from "~/shared/types";

const UserRoleSchema = Type.Union([Type.Literal("user"), Type.Literal("admin")]);
const RolesSchema = Type.Array(UserRoleSchema);
const avatarUrlSchema = Type.Union([UrlSchema, Type.Null()]);
const firstNameSchema = Type.Union([StringSchema, Type.Null()]);
const lastNameSchema = Type.Union([StringSchema, Type.Null()]);

const UserSchema = Type.Object({
  id: IdSchema,
  avatarUrl: avatarUrlSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  roles: RolesSchema,
});

const UpdateUserSchema = Type.Object({
  firstName: Type.Optional(firstNameSchema),
  lastName: Type.Optional(lastNameSchema),
});

export { UserSchema, UpdateUserSchema };
