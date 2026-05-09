"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    if (!token || !user) return;
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (!isOpen) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [token, user, isOpen]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string) => {
    if (!token) return;
    
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error marking as read", error);
    }

    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error marking all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors focus:outline-none"
        aria-label="Thông báo"
      >
        <Bell className="w-[1.125rem] h-[1.125rem] md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white md:h-4 md:w-4">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:-right-4 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-rose-50/60 bg-white/50">
            <h3 className="font-semibold text-slate-800 tracking-wide text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-rose-200" />
                </div>
                <p className="text-sm text-slate-500">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.slice(0, 15).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleMarkAsRead(notification.id, notification.link)}
                    className={`group flex flex-col items-start px-4 py-3.5 border-b border-slate-50/50 hover:bg-slate-50/60 transition-all text-left w-full ${
                      !notification.isRead ? "bg-rose-50/20" : "opacity-80"
                    }`}
                  >
                    <div className="flex w-full items-start justify-between gap-3 mb-1.5">
                      <span className={`text-[13px] font-semibold leading-snug ${!notification.isRead ? "text-slate-800" : "text-slate-600"}`}>
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1 shadow-sm shadow-rose-500/20" />
                      )}
                    </div>
                    <p className="text-[13px] text-slate-600 line-clamp-2 w-full pr-4 leading-relaxed mb-1.5">
                      {notification.message}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
