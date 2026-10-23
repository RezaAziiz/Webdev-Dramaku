import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const createToken = (claims) => {
  const payload = window.btoa(JSON.stringify(claims));
  return `header.${payload}.signature`;
};

const SessionDetails = () => {
  const { isAuthenticated, username, role, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="session">{`${isAuthenticated}:${username}:${role || ""}`}</span>
      <button
        onClick={() =>
          login(createToken({ username: "writer", role: "Writer" }))
        }
      >
        Sign in
      </button>
      <button onClick={logout}>Sign out</button>
    </div>
  );
};

const renderSession = () =>
  render(
    <AuthProvider>
      <SessionDetails />
    </AuthProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

test("restores a valid session from localStorage", () => {
  localStorage.setItem(
    "token",
    createToken({
      username: "admin",
      role: "Admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );

  renderSession();

  expect(screen.getByTestId("session")).toHaveTextContent("true:admin:Admin");
});

test("updates and clears the session through context actions", () => {
  renderSession();

  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(screen.getByTestId("session")).toHaveTextContent("true:writer:Writer");
  expect(localStorage.getItem("token")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "Sign out" }));
  expect(screen.getByTestId("session")).toHaveTextContent("false::");
  expect(localStorage.getItem("token")).toBeNull();
});

test("clears an expired token during initialization", () => {
  localStorage.setItem(
    "token",
    createToken({
      username: "writer",
      role: "Writer",
      exp: Math.floor(Date.now() / 1000) - 1,
    }),
  );

  renderSession();

  expect(screen.getByTestId("session")).toHaveTextContent("false::");
  expect(localStorage.getItem("token")).toBeNull();
});
