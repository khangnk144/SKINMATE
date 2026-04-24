"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const SKIN_TYPES = [
  { value: "NORMAL", label: "Normal" },
  { value: "OILY", label: "Oily" },
  { value: "DRY", label: "Dry" },
  { value: "SENSITIVE", label: "Sensitive" },
  { value: "COMBINATION", label: "Combination" },
];

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [skinType, setSkinType] = useState("NORMAL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, skinType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically login after registration
      const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        login(loginData.token, loginData.user);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 py-16 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50">
        <div>
          <h2 className="mt-2 text-center text-3xl font-serif tracking-tight text-slate-900">
            Begin Your Journey
          </h2>
          <p className="mt-4 text-center text-sm text-slate-500 font-light">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-rose-400 hover:text-rose-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
              <div className="text-sm text-rose-700 font-medium text-center">{error}</div>
            </div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 ml-1 mb-2">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-slate-700 placeholder-gray-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all sm:text-sm"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="skinType" className="block text-sm font-medium text-slate-700 ml-1 mb-2">Skin Type</label>
              <select
                id="skinType"
                name="skinType"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-slate-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all sm:text-sm"
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
              >
                {SKIN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 ml-1 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-slate-700 placeholder-gray-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all sm:text-sm"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 ml-1 mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-slate-700 placeholder-gray-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all sm:text-sm"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-full bg-slate-900 py-3.5 px-4 text-sm font-medium tracking-wide text-white hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:bg-slate-300 disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
            >
              {loading ? "Registering..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
