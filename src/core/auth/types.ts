import { JWTPayload } from "jose";

interface IUser {
  id: string;
  email: string;
  role: string;
}

interface ISupabaseJwtPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
}

export type { IUser, ISupabaseJwtPayload };
