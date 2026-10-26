import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const createToken = (claims) => {
  const payload = window.btoa(JSON.stringify(claims));
  return `header.${payload}.signature`;
};

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;

const renderGuardedRoute = (allowedRoles) =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <div>admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/notfound" element={<p>not found page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );

beforeEach(() => {
  localStorage.clear();
});

test("redirects unauthenticated visitors to the login page", () => {
  renderGuardedRoute(["Admin"]);

  expect(screen.getByText("login page")).toBeInTheDocument();
  expect(screen.queryByText("admin content")).not.toBeInTheDocument();
});

test("renders children for an authenticated allowed role", () => {
  localStorage.setItem(
    "token",
    createToken({ username: "admin", role: "Admin", exp: futureExp() }),
  );

  renderGuardedRoute(["Admin"]);

  expect(screen.getByText("admin content")).toBeInTheDocument();
});

test("redirects authenticated users whose role is not allowed", () => {
  localStorage.setItem(
    "token",
    createToken({ username: "writer", role: "Writer", exp: futureExp() }),
  );

  renderGuardedRoute(["Admin"]);

  expect(screen.getByText("not found page")).toBeInTheDocument();
  expect(screen.queryByText("admin content")).not.toBeInTheDocument();
});
