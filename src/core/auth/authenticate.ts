import { FastifyRequest, FastifyReply } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { ISupabaseJwtPayload } from "./types";

const supabaseUrl = process.env.SUPABASE_URL;

const createAuthenticate = () => {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!supabaseUrl) {
      throw new Error("SUPABASE_API_URL is required");
    }

    const jwksUrl = new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`);
    const jwksKey = createRemoteJWKSet(jwksUrl);

    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "Authorization header is required",
        });
      }

      const token = authHeader.replace("Bearer ", "");

      const { payload } = await jwtVerify<ISupabaseJwtPayload>(token, jwksKey);

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch (error) {
      return reply.code(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: `Invalid or expired token ${(error as Error).message}`,
      });
    }
  };
};

export { createAuthenticate };
