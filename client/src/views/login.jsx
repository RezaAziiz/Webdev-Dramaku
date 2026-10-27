import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { LuEye, LuEyeOff } from "react-icons/lu";
import AuthShowcase from "../components/auth/AuthShowcase";
import { useAuth } from "../contexts/AuthContext";
import { GOOGLE_CLIENT_ID, apiUrl } from "../config/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const validateInput = (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/;
    return emailPattern.test(input) || usernamePattern.test(input);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateInput(username)) {
      setError("Enter a valid email address or username.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post(apiUrl("/login"), {
        username,
        password,
      });

      if (response.data.banned) {
        setError("Your account has been suspended. Please contact support.");
        logout();
        return;
      }

      if (!login(response.data.token)) {
        setError("We couldn't start your session. Please try again.");
        return;
      }
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? "Your account has been suspended. Please contact support."
          : "Sign in failed. Check your details and try again.",
      );
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-in did not return a credential. Please try again.");
      return;
    }

    try {
      const response = await axios.post(apiUrl("/google-login"), {
        token: credentialResponse.credential,
      });
      if (!login(response.data.token)) {
        setError("We couldn't start your session. Please try again.");
        return;
      }
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.status === 403
          ? "Your account has been suspended."
          : "Google sign-in failed. Please try again.",
      );
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-page">
        <AuthShowcase mode="login" />
        <main className="auth-main">
          <div className="auth-content">
            <header className="auth-heading">
              <h1>Welcome back</h1>
              <p>Sign in to continue watching.</p>
            </header>

            {error && (
              <p className="auth-message is-error" role="alert">
                {error}
              </p>
            )}

            <div className="auth-google">
              <GoogleLogin
                text="continue_with"
                shape="pill"
                theme="outline"
                onSuccess={handleGoogleLoginSuccess}
                onError={() =>
                  setError(
                    "Google blocked sign-in for this site. Check that its HTTPS origin is listed in Google Cloud Console under Authorized JavaScript origins.",
                  )
                }
              />
            </div>

            <div className="auth-divider" aria-hidden="true">
              OR
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-field">
                <label htmlFor="login-username">Email or username</label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <div className="auth-password-row">
                  <label htmlFor="login-password">Password</label>
                </div>
                <div className="auth-password-field">
                  <input
                    id="login-password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    aria-pressed={passwordVisible}
                    onClick={() => setPasswordVisible((visible) => !visible)}
                  >
                    {passwordVisible ? <LuEyeOff /> : <LuEye />}
                  </button>
                </div>
              </div>

              <button className="auth-button" type="submit">
                Sign in
              </button>
            </form>

            <p className="auth-switch">
              Don&apos;t have an account?{" "}
              <Link className="auth-inline-link" to="/register">
                Create account
              </Link>
            </p>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
