import React, { useState, useEffect } from "react";
import logo from '../assets/logo.png';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const ClientId = "193966095713-ooq3r03aaanmf67tudroa67ccctfqvk6.apps.googleusercontent.com";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Validate username can either be email or standard username
  const validateInput = (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernamePattern = /^[a-zA-Z0-9._-]{3,}$/; // Allows letters, numbers, dots, underscores, min 3 chars
    return emailPattern.test(input) || usernamePattern.test(input);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    // Input validation
    if (!validateInput(username)) {
      setError("Please enter a valid email or username (at least 3 characters).");
      return;
    }
  
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3005/login", {
        username,
        password,
      });
  
      // Check for banned status in the response
      if (response.data.banned) {
        setError("Your account has been banned. Please contact support.");
        localStorage.removeItem("token"); // Remove token if set
        return; // Prevent further execution
      }
  
      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
  
      // Redirect based on role
      if (response.data.role === "Admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setError("Your account has been banned. Please contact support.");
      } else {
        localStorage.removeItem("token");
        setError("Login failed. Please check your credentials.");
      }
    }
  };  


  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const response = await axios.post("http://localhost:3005/google-login", { token });

      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);

      if (response.data.role === "Admin") {
        window.location.href = "/";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      setError("Your account has been banned");
    }
  };

  const handleGoogleLoginError = () => {
    setError("Account is banned and cannot login");
  };

  return (
    <GoogleOAuthProvider clientId={ClientId}>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center space-y-4">
          <img src={logo} className="w-40 h-10" alt="Logo" />

          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
            <h1 className="text-white text-2xl text-center font-bold mb-3">
              Login
            </h1>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <div className="mb-4">
              <input
                className="w-full p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
                id="username"
                name="username"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <input
                className="w-full p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleLogin}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Sign in
              </button>

              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
              />
            </div>

            <div className="text-center mt-6">
              <p className="text-white text-sm">Don't have an account?</p>
              <a
                href="/register"
                className=" text-white text-sm hover:underline font-bold"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
