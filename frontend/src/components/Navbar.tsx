"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const NavLinks = () => (
    <>
      <Link href="/analysis" onClick={() => setIsOpen(false)} className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
        Phân tích
      </Link>
      {!isLoading && (
        user ? (
          <>
            <Link href="/history" onClick={() => setIsOpen(false)} className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
              Lịch sử
            </Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors group">
              <span className="text-rose-400 font-medium italic" style={{ fontFamily: 'var(--font-serif)' }}>
                Xin chào, {user.displayName || user.username}
              </span>
              <span className="text-gray-300 group-hover:text-rose-200 transition-colors">·</span>
              <span>Hồ sơ</span>
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin" onClick={() => setIsOpen(false)} className="text-sm tracking-wide text-emerald-600 hover:text-emerald-700 transition-colors">
                Quản trị
              </Link>
            )}
            <button 
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors text-left"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-sm tracking-wide text-gray-500 hover:text-rose-400 transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)} className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium tracking-wide text-white bg-rose-400 hover:bg-rose-500 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md w-max">
              Tham gia ngay
            </Link>
          </>
        )
      )}
    </>
  );

  return (
    <>
      {/* Desktop Menu */}
      <nav className="hidden md:flex space-x-8 items-center">
        <NavLinks />
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden p-2 text-gray-500 hover:text-rose-400 focus:outline-none" 
        onClick={toggleMenu}
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

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-rose-100 md:hidden z-50 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-6 px-6 py-8">
            <NavLinks />
          </div>
        </div>
      )}
    </>
  );
}
