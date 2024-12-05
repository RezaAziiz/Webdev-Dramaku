import React, { useState } from "react";
import logo from '../assets/logo.png';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // Send a request to the backend to initiate the password reset process
      const response = await axios.post("/api/forgot-password", { email });
      setMessage("Password reset link has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center items-center space-y-4">
          <img src={logo} className="w-40 h-10" alt="Logo" />
          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
            <h2 className="text-white text-3xl text-center font-bold mb-6">Forgot Password</h2>

            {error && <p className="text-red-500 text-center">{error}</p>}
            {message && <p className="text-green-500 text-center">{message}</p>}

            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <input
                  className="w-full p-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  type="email"
                  id="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
