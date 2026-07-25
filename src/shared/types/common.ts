import { Type } from "typebox";

const StringSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

const EmailSchema = Type.String({
  format: "email",
  minLength: 1,
  maxLength: 255,
});

const UrlSchema = Type.String({
  format: "uri",
  pattern: "^https?://",
});

const DateTimeSchema = Type.String({ format: "date-time" });

const IdSchema = Type.String({ minimum: 1 });

export { StringSchema, EmailSchema, DateTimeSchema, IdSchema, UrlSchema };
