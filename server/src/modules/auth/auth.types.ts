export type AuthUser = {
  id: string;
  email: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
};
