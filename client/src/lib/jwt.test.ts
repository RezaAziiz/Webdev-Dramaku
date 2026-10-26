import {
  decodeJwtPayload,
  getTokenExpiryMs,
  getUserFromToken,
  isTokenExpired,
} from "./jwt";

const createToken = (claims: Record<string, unknown>): string => {
  const payload = window.btoa(JSON.stringify(claims));
  return `header.${payload}.signature`;
};

describe("jwt utils", () => {
  test("decodes a valid payload", () => {
    const token = createToken({ username: "admin", role: "Admin" });

    expect(decodeJwtPayload(token)).toMatchObject({
      username: "admin",
      role: "Admin",
    });
  });

  test("returns null for malformed or missing tokens", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("header..signature")).toBeNull();
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload(undefined)).toBeNull();
  });

  test("detects expired tokens", () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) - 1 });

    expect(isTokenExpired(token)).toBe(true);
    expect(getUserFromToken(token)).toBeNull();
  });

  test("extracts the authenticated user from a valid token", () => {
    const token = createToken({
      id: 7,
      username: "writer",
      role: "Writer",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(getUserFromToken(token)).toMatchObject({
      id: 7,
      username: "writer",
      role: "Writer",
    });
    expect(getTokenExpiryMs(token)).toBeGreaterThan(Date.now());
  });

  test("defaults missing username and role safely", () => {
    const token = createToken({ exp: Math.floor(Date.now() / 1000) + 60 });

    expect(getUserFromToken(token)).toMatchObject({
      username: "",
      role: null,
    });
  });
});
