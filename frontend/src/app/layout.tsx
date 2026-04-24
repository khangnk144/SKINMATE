import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKINMATE",
  description: "Luxury Skincare Ingredient Consulting & Checking Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#FFFBFB] text-slate-700 font-sans selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden">
        <AuthProvider>
          <header className="sticky top-0 z-50 w-full border-b border-rose-100 bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="font-serif text-2xl tracking-widest text-slate-900 uppercase">
                    Skinmate
                  </Link>
                </div>
                  <Navbar />
              </div>
            </div>
          </header>
          
          <main className="min-h-[calc(100vh-5rem)] w-full mx-auto">
            {children}
          </main>

          <footer className="bg-transparent border-t border-rose-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
              <p className="font-serif text-xl tracking-widest text-slate-900 uppercase mb-4">Skinmate</p>
              <p className="text-sm text-gray-400 text-center max-w-md">
                Elevating your skincare journey with science-backed insights and uncompromising luxury.
              </p>
              <p className="text-xs text-gray-300 mt-8 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Skinmate. All rights reserved.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
