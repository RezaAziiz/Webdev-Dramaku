export type JwtClaims = {
  exp?: number;
  iat?: number;
  nbf?: number;
  [key: string]: unknown;
};

export type AuthUser = JwtClaims & {
  username: string;
  role: string | null;
};

const decodeBase64Url = (value: string): string | null => {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = atob(padded);

    return decodeURIComponent(
      Array.from(
        decoded,
        (character) =>
          `%${character.codePointAt(0)?.toString(16).padStart(2, "0")}`,
      ).join(""),
    );
  } catch {
    return null;
  }
};

export const decodeJwtPayload = (
  token: string | null | undefined,
): JwtClaims | null => {
  if (!token) return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  const json = decodeBase64Url(payload);
  if (!json) return null;

  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as JwtClaims;
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (
  token: string | null | undefined,
): number | null => {
  const claims = decodeJwtPayload(token);
  if (!claims || typeof claims.exp !== "number") return null;
  return claims.exp * 1000;
};

export const isTokenExpired = (
  token: string | null | undefined,
  now: number = Date.now(),
): boolean => {
  const expiresAt = getTokenExpiryMs(token);
  if (expiresAt === null) return true;
  return expiresAt <= now;
};

export const getUserFromToken = (
  token: string | null | undefined,
): AuthUser | null => {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;
  if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) {
    return null;
  }

  return {
    ...claims,
    username: typeof claims.username === "string" ? claims.username : "",
    role: typeof claims.role === "string" ? claims.role : null,
  };
};
