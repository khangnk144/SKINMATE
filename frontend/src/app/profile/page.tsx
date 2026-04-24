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
        const res = await fetch("http://localhost:5000/api/v1/users/profile", {
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
      const res = await fetch("http://localhost:5000/api/v1/users/profile", {
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
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
          <div className="text-lg font-light text-slate-400 animate-pulse tracking-wide">Loading profile...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-16 sm:px-6 lg:px-8 font-sans">
        <div className="w-full max-w-lg space-y-8 rounded-3xl bg-white p-10 md:p-14 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-50/50 transition-all">
          <div>
            <h2 className="mt-2 text-center text-3xl font-serif tracking-tight text-slate-900">
              Your Profile
            </h2>
            <p className="mt-4 text-center text-sm text-slate-500 font-light">
              Manage your personal settings and skincare preferences
            </p>
          </div>

          {message && (
            <div
              className={`rounded-xl p-4 text-sm font-medium text-center border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 ml-1 mb-2">Username</label>
              <div className="flex items-center px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-slate-500 cursor-not-allowed text-sm">
                {profile?.username}
              </div>
              <p className="mt-2 text-xs text-slate-400 ml-1">Your username cannot be changed.</p>
            </div>

            <div>
              <label htmlFor="skinType" className="block text-sm font-medium text-slate-700 ml-1 mb-2">
                Skin Type
              </label>
              <div className="relative">
                <select
                  id="skinType"
                  name="skinType"
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-10 text-slate-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all sm:text-sm"
                >
                  {SKIN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-400 ml-1">Select the skin type that best describes you.</p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving || skinType === profile?.skinType}
                className="w-full flex justify-center py-3.5 px-4 rounded-full text-sm font-medium tracking-wide text-white bg-slate-900 hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
