"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="flex space-x-8 items-center">
      <Link href="/analysis" className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
        Analysis
      </Link>
      {!isLoading && (
        user ? (
          <>
            <Link href="/history" className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
              History
            </Link>
            <Link href="/profile" className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
              Profile
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm tracking-wide text-emerald-600 hover:text-emerald-700 transition-colors">
                Admin Panel
              </Link>
            )}
            <button 
              onClick={logout}
              className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide text-white bg-rose-400 hover:bg-rose-500 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              Join Now
            </Link>
          </>
        )
      )}
    </nav>
  );
}
