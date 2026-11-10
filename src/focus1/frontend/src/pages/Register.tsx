import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await register({ username, password });
      navigate("/");
    } catch (err) {
      setError("Username already exists");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-earth-accent rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-lg mx-auto mb-4">
            F
          </div>
          <h2 className="text-2xl font-black text-earth-text tracking-tighter">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-earth-text-sec">
            Join FocusCompanion today
          </p>
        </div>

        {error && (
          <div className="bg-earth-danger/10 border border-earth-danger/20 text-earth-danger text-sm font-bold px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-earth-text mb-1"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none block w-full px-4 py-3 bg-earth-bg border border-earth-border rounded-xl shadow-sm placeholder-earth-text-sec focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-earth-text mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none block w-full px-4 py-3 bg-earth-bg border border-earth-border rounded-xl shadow-sm placeholder-earth-text-sec focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-earth-text mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="appearance-none block w-full px-4 py-3 bg-earth-bg border border-earth-border rounded-xl shadow-sm placeholder-earth-text-sec focus:outline-none focus:ring-2 focus:ring-earth-accent focus:border-transparent transition-all"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-xl hover:shadow-earth-accent/20 hover:-translate-y-1.5 transition-all font-black uppercase tracking-widest"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-earth-text-sec">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-earth-accent hover:text-earth-accent/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
