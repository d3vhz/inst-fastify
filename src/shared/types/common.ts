import { Type } from "typebox";

const StringSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

const NumberSchema = Type.Number();

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

const IdSchema = Type.String({ minLength: 1 });

export { StringSchema, NumberSchema, EmailSchema, DateTimeSchema, IdSchema, UrlSchema };
