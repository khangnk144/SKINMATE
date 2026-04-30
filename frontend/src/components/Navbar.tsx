"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, User, History, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);       // mobile hamburger
  const [dropdownOpen, setDropdownOpen] = useState(false); // user dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setIsOpen(false);
  };

  // First letter of displayName (or username) for the avatar
  const avatarLetter = (user?.displayName || user?.username || "U")[0].toUpperCase();
  const displayLabel = user?.displayName || user?.username || "";

  return (
    <>
      {/* ─── Desktop Nav ─────────────────────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-8">

        {/* Always-visible link */}
        <Link
          href="/analysis"
          className="text-base tracking-wide text-gray-500 hover:text-rose-400 transition-colors duration-300"
        >
          Phân tích
        </Link>

        {!isLoading && (
          <>
            {/* Admin Panel — outside dropdown, refined rose-slate style */}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-base tracking-wide text-slate-700 bg-rose-50/50 border border-rose-100 px-3.5 py-1.5 rounded-full hover:bg-rose-100/80 transition-all duration-300"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-rose-400" />
                Quản trị
              </Link>
            )}

            {/* ── User Dropdown ── */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger */}
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 group focus:outline-none"
                  aria-label="Mở menu người dùng"
                >
                  {/* Avatar circle */}
                  <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-xs font-semibold tracking-wide ring-2 ring-white group-hover:ring-rose-200 transition-all duration-300">
                    {avatarLetter}
                  </span>
                  {/* Display name */}
                  <span
                    className="text-sm text-rose-400 group-hover:text-rose-500 transition-colors duration-300"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {displayLabel}
                  </span>
                  {/* Chevron */}
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {/* Name header inside dropdown */}
                    <div className="px-4 pt-4 pb-3 border-b border-rose-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                        Đang đăng nhập
                      </p>
                      <p
                        className="text-sm text-slate-800 truncate"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {displayLabel}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-2 px-1.5">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group"
                      >
                        <User className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors duration-200" />
                        Hồ sơ
                      </Link>
                      <Link
                        href="/history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group"
                      >
                        <History className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors duration-200" />
                        Lịch sử
                      </Link>
                    </div>

                    {/* Divider + Logout */}
                    <div className="px-1.5 pb-2 border-t border-rose-50">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm text-gray-500 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group text-left"
                      >
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors duration-200" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest links */
              <>
                <Link
                  href="/login"
                  className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors duration-300"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide text-white bg-rose-400 hover:bg-rose-500 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Tham gia ngay
                </Link>
              </>
            )}
          </>
        )}
      </nav>

      {/* ─── Mobile Hamburger Button ──────────────────────────────────── */}
      <button
        className="md:hidden p-2 text-gray-500 hover:text-rose-400 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* ─── Mobile Dropdown Menu ─────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100 md:hidden z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col px-6 py-8 gap-1">

            {/* User identity header (mobile) */}
            {user && (
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-rose-50">
                <span className="w-9 h-9 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-sm font-semibold ring-2 ring-white">
                  {avatarLetter}
                </span>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Đang đăng nhập</p>
                  <p
                    className="text-sm text-slate-800"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {displayLabel}
                  </p>
                </div>
              </div>
            )}

            {/* Always-visible */}
            <Link
              href="/analysis"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200"
            >
              Phân tích
            </Link>

            {!isLoading && user && (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group"
                >
                  <User className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors" />
                  Hồ sơ
                </Link>
                <Link
                  href="/history"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group"
                >
                  <History className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors" />
                  Lịch sử
                </Link>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 bg-rose-50/50 border border-rose-100 hover:bg-rose-100/80 transition-all duration-200 group"
                  >
                    <LayoutDashboard className="w-4 h-4 text-rose-400" />
                    Quản trị
                  </Link>
                )}

                <div className="pt-3 mt-3 border-t border-rose-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200 group text-left"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors" />
                    Đăng xuất
                  </button>
                </div>
              </>
            )}

            {!isLoading && !user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-rose-50/70 hover:text-rose-500 transition-all duration-200"
                >
                  Đăng nhập
                </Link>
                <div className="pt-2">
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-medium tracking-wide text-white bg-rose-400 hover:bg-rose-500 rounded-full transition-all duration-300"
                  >
                    Tham gia ngay
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
