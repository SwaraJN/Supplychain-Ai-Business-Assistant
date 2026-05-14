import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeTab: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  notifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
}

export default function Header({
  activeTab,
  darkMode,
  setDarkMode,
  setSidebarOpen,
  notifOpen,
  setNotifOpen,
  profileOpen,
  setProfileOpen,
}: HeaderProps): React.JSX.Element {
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const iconBtn = darkMode
    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
  const border = darkMode ? "border-slate-700" : "border-slate-200";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/signin");
  };

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setProfileOpen]);

  return (
    <header
      className={`${darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-xl border-b shadow-lg z-30`}
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.875rem 1.5rem",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          minWidth: 0,
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className={`md:hidden p-2.5 rounded-xl ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95 shrink-0`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <h2
            className={`text-xl lg:text-2xl font-bold ${textPrimary} truncate`}
          >
            {activeTab}
          </h2>
          <p className={`text-xs ${textSecondary} mt-0.5`}>
            Autonomous operations dashboard
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setProfileOpen(false);
          }}
          className={`p-2.5 rounded-xl relative ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95`}
        >
          <svg
            className="w-5 h-5 lg:w-6 lg:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2.5 rounded-xl ${darkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"} transition-all duration-300 hover:scale-110 active:scale-95 shadow-md`}
          aria-label="Toggle theme"
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${darkMode ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700" : "bg-slate-50 hover:bg-slate-100 border-slate-200"} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
              JD
            </div>
            <div className="hidden sm:block text-left">
              <p className={`text-sm font-bold ${textPrimary} leading-none`}>
                Swaraj
              </p>
              <p className={`text-xs ${textSecondary} mt-0.5`}>SCM Manager</p>
            </div>
            <svg
              className={`w-4 h-4 ${textSecondary} transition-transform duration-300 ${profileOpen ? "rotate-180" : ""} shrink-0`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {profileOpen && (
            <div
              className={`absolute top-full right-0 mt-2 w-48 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border rounded-xl shadow-2xl overflow-hidden z-50 fade-slide-up`}
            >
              {["Profile Settings", "Preferences", "Logout"].map(
                (item, idx) => (
                  <button
                    key={item}
                    onClick={item === "Logout" ? handleLogout : undefined}
                    className={`w-full px-4 py-3 text-left text-sm ${darkMode ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"} ${idx !== 2 ? `border-b ${border}` : ""} transition-colors duration-200`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
