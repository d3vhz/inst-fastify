import { Static } from "typebox";

import { UserSchema, UpdateUserSchema } from "./schemas";

type User = Static<typeof UserSchema>;

type UpdateUser = Pick<Static<typeof UserSchema>, "id"> & {
  changes: Static<typeof UpdateUserSchema>;
};

export type { User, UpdateUser };
