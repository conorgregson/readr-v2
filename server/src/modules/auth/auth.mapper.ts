import type { AuthUser } from "./auth.types";

export function toAuthUser(user: { id: string; email: string }): AuthUser {
  return {
    id: user.id,
    email: user.email,
  };
}
