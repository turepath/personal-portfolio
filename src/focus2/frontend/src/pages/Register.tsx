import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Common";
import { useAuth } from "../context/AuthContext";

export const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        password,
        displayName: username,
      });
      alert("Account created successfully! Redirecting to home...");
      navigate("/");
    } catch (err: any) {
      console.error("Registration failed", err);
      alert(
        err?.response?.data?.error || err?.message || "Registration failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-bg p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-earth-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-earth-accent/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-earth-text tracking-tighter uppercase mb-2">
            Join the Community
          </h1>
          <p className="text-earth-text-sec font-medium opacity-70">
            Start your journey to deep focus.
          </p>
        </div>

        <div className="bg-white border border-earth-border rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">
                Username
              </label>
              <input
                type="text"
                placeholder="How should we call you?"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex@example.com"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">
                Set Password
              </label>
              <input
                type="password"
                placeholder="Choose a strong password"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-text-sec tracking-[0.2em] px-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="w-full bg-earth-bg border border-earth-border rounded-2xl px-6 py-4 text-sm font-bold focus:border-earth-accent outline-none transition-all shadow-inner"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-16 text-lg shadow-xl font-black uppercase tracking-widest mt-4"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-earth-border text-center">
            <p className="text-sm text-earth-text-sec font-medium">
              Already have an account? <br />
              <Link
                to="/login"
                className="text-earth-accent font-black hover:underline mt-1 inline-block"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 px-4">
          <p className="text-[9px] text-earth-text-sec text-center leading-relaxed font-medium">
            By joining, you agree to our{" "}
            <span className="underline cursor-pointer">Terms</span> and{" "}
            <span className="underline cursor-pointer">Privacy Protocol</span>.
            Focus Companion values your digital peace.
          </p>
        </div>
      </div>
    </div>
  );
};
