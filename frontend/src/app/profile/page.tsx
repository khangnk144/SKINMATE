"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const SKIN_TYPES = ["OILY", "DRY", "SENSITIVE", "COMBINATION", "NORMAL"];

interface ProfileData {
  username: string;
  skinType: string;
}

export default function ProfilePage() {
  const { token, user, login } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skinType, setSkinType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}`}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data);
        setSkinType(data.skinType || "NORMAL");
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}`}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skinType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      // Update local context user data
      if (user) {
        login(token, { ...user, skinType: data.skinType });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "An error occurred" });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-lg font-light text-gray-400 animate-pulse tracking-wide">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-5rem)] relative flex items-center justify-center px-4 py-16">
        <div className="absolute top-20 right-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(252,232,238,0.25)_0%,transparent_100%)] rounded-full blur-[140px] -z-10"></div>
        <div className="absolute bottom-20 left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(245,250,248,0.2)_0%,transparent_100%)] rounded-full blur-[140px] -z-10"></div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1
                className="text-4xl text-gray-900 tracking-tight mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Your Profile
              </h1>
              <p className="text-gray-400 text-sm tracking-widest uppercase">Personal Settings</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-gray-800 transition-all duration-300"
            >
              <span className="w-8 h-px bg-gray-200 group-hover:w-12 group-hover:bg-rose-300 transition-all duration-500"></span>
              Back
            </button>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-10 md:p-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
            {message && (
              <div
                className={`mb-8 rounded-2xl p-4 text-sm font-medium text-center border ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                  Username
                </label>
                <div className="flex items-center px-6 py-4 bg-gray-100 rounded-2xl border border-gray-200 text-gray-500 cursor-not-allowed">
                  {profile?.username}
                </div>
                <p className="mt-2 text-xs text-gray-400 ml-1">Your username cannot be changed.</p>
              </div>

              <div>
                <label htmlFor="skinType" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                  Skin Type
                </label>
                <div className="relative">
                  <select
                    id="skinType"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    className="block w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 px-6 py-4 pr-10 text-gray-700 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-50 focus:bg-white transition-all"
                  >
                    {SKIN_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-gray-400">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400 ml-1">Select the skin type that best describes you.</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || skinType === profile?.skinType}
                  className={`group relative w-full py-5 rounded-[2rem] overflow-hidden transition-all duration-500 ${
                    saving || skinType === profile?.skinType
                      ? 'bg-gray-200 cursor-not-allowed'
                      : 'bg-gray-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300/20 to-emerald-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative text-white text-sm font-semibold tracking-widest uppercase flex items-center justify-center gap-3">
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
