import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { LuCheck, LuEye, LuEyeOff } from "react-icons/lu";
import AuthShowcase from "../components/auth/AuthShowcase";
import { normalizeGenre } from "../adapters/mediaAdapter";
import { GOOGLE_CLIENT_ID, apiUrl } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import { getGenres } from "../services/catalogService";
import { unwrapList } from "../lib/media";

const PREFERENCE_STORAGE_KEY = "dramaku.genrePreferences";

export default function Register() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState("");
  const [genreAttempt, setGenreAttempt] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let current = true;
    setGenresLoading(true);
    setGenresError("");

    getGenres()
      .then((response) => {
        if (!current) return;
        const items = unwrapList(response)
          .filter((item) => item && typeof item === "object")
          .map(normalizeGenre)
          .filter((genre) => genre !== null);
        setGenres(items);
      })
      .catch((requestError) => {
        if (!current) return;
        console.error("Unable to load registration genres.", requestError);
        setGenresError("Genres are unavailable right now. You can skip this step.");
      })
      .finally(() => {
        if (current) setGenresLoading(false);
      });

    return () => {
      current = false;
    };
  }, [genreAttempt]);

  const validateAccountDetails = () => {
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const continueToGenres = (event) => {
    event.preventDefault();
    setError("");
    if (!validateAccountDetails()) return;
    setStep(2);
  };

  const completeRegistration = async (event, skipPersonalization = false) => {
    event?.preventDefault();
    setError("");
    setMessage("");
    if (!validateAccountDetails()) {
      setStep(1);
      return;
    }
    if (
      !skipPersonalization &&
      selectedGenres.length < 3 &&
      genres.length >= 3
    ) {
      setError("Choose at least 3 genres, or skip personalization for now.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "We couldn't create your account. Try again.");
        return;
      }

      let preferenceSaveFailed = false;
      try {
        const preferenceKey = `${PREFERENCE_STORAGE_KEY}:${email
          .trim()
          .toLowerCase()}`;
        window.localStorage.setItem(preferenceKey, JSON.stringify(
          skipPersonalization ? [] : selectedGenres,
        ));
      } catch (storageError) {
        console.error("Unable to save local genre preferences.", storageError);
        preferenceSaveFailed = true;
      }

      setMessage(
        preferenceSaveFailed
          ? "Your account was created, but your genre choices couldn't be saved on this device."
          : "Account created. Your genre choices are saved on this device for now.",
      );
      window.setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (requestError) {
      console.error("Account registration failed.", requestError);
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google sign-up did not return a credential. Please try again.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const response = await axios.post(apiUrl("/api/google-login"), {
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
          : "Google sign-up failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGenre = (genreName) => {
    setSelectedGenres((current) =>
      current.includes(genreName)
        ? current.filter((name) => name !== genreName)
        : [...current, genreName],
    );
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-page">
        <AuthShowcase mode="register" />
        <main className="auth-main">
          <div className="auth-content">
            <div className="auth-progress" aria-label={`Step ${step} of 2`}>
              <div className="auth-progress-label">
                <span>Step {step} of 2</span>
                <span>{step === 1 ? "Your account" : "Personalization"}</span>
              </div>
              <div className="auth-progress-track" aria-hidden="true">
                <span className="is-complete" />
                <span className={step === 2 ? "is-complete" : ""} />
              </div>
            </div>

            {step === 1 ? (
              <>
                <header className="auth-heading">
                  <h1>Create your account</h1>
                  <p>Set up your account to start watching.</p>
                </header>

                {error && (
                  <p className="auth-message is-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="auth-google">
                  <GoogleLogin
                    text="signup_with"
                    shape="pill"
                    theme="outline"
                    onSuccess={handleGoogleSignup}
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

                <form className="auth-form" onSubmit={continueToGenres}>
                  <div className="auth-field">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="register-username">Username</label>
                    <input
                      id="register-username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={3}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="register-password">Password</label>
                    <div className="auth-password-field">
                      <input
                        id="register-password"
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={6}
                        required
                      />
                      <button
                        className="auth-password-toggle"
                        type="button"
                        aria-label={
                          passwordVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={passwordVisible}
                        onClick={() =>
                          setPasswordVisible((visible) => !visible)
                        }
                      >
                        {passwordVisible ? <LuEyeOff /> : <LuEye />}
                      </button>
                    </div>
                  </div>
                  <button className="auth-button" type="submit">
                    Continue
                  </button>
                </form>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <Link className="auth-inline-link" to="/login">
                    Sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <header className="auth-heading">
                  <h1>Choose your favorite genres</h1>
                  <p className="auth-step-copy">
                    Pick at least 3 so your recommendations feel more personal.
                  </p>
                </header>

                {error && (
                  <p className="auth-message is-error" role="alert">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="auth-message is-success" role="status">
                    {message}
                  </p>
                )}

                {genresLoading ? (
                  <p className="auth-genre-status" role="status">
                    Loading genres…
                  </p>
                ) : genresError ? (
                  <div className="auth-content">
                    <p className="auth-genre-status" role="alert">
                      {genresError}
                    </p>
                    <button
                      className="auth-button auth-button-secondary"
                      type="button"
                      onClick={() => setGenreAttempt((attempt) => attempt + 1)}
                    >
                      Try loading genres again
                    </button>
                  </div>
                ) : genres.length ? (
                  <div
                    className="auth-genre-list"
                    role="group"
                    aria-label="Choose your favorite genres"
                  >
                    {genres.map((genre) => {
                      const selected = selectedGenres.includes(genre.name);
                      return (
                        <button
                          key={genre.id}
                          className={`auth-genre-chip${selected ? " is-selected" : ""}`}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleGenre(genre.name)}
                        >
                          {selected && <LuCheck aria-hidden="true" />}
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="auth-genre-status" role="status">
                    No genres are available. You can still create your account.
                  </p>
                )}

                <p className="auth-genre-status" aria-live="polite">
                  {selectedGenres.length} selected
                </p>

                <div className="auth-step-actions">
                  <button
                    className="auth-button"
                    type="button"
                    onClick={completeRegistration}
                    disabled={
                      isSubmitting ||
                      genresLoading ||
                      (genres.length >= 3 && selectedGenres.length < 3)
                    }
                  >
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </button>
                  <button
                    className="auth-back-button"
                    type="button"
                    onClick={() => completeRegistration(undefined, true)}
                    disabled={isSubmitting || genresLoading}
                  >
                    Skip personalization for now
                  </button>
                  <button
                    className="auth-back-button"
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    disabled={isSubmitting}
                  >
                    Back to account details
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}
