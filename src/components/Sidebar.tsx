import React from "react";
import { NAV_ITEMS } from "../constants/navigation";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  darkMode,
}: SidebarProps): React.JSX.Element {
  const border = darkMode ? "border-slate-800" : "border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <aside
      className={`
        ${sidebarOpen ? "translate-x-0 mobile-menu-enter" : "-translate-x-full"}
        md:translate-x-0
        fixed md:static inset-y-0 left-0 z-50
        w-72 lg:w-80
        ${darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"}
        backdrop-blur-xl border-r flex flex-col
        transition-all duration-300 ease-out
        shadow-2xl md:shadow-none
      `}
      style={{ height: "100vh", flexShrink: 0 }}
    >
      <div
        className={`px-5 lg:px-6 py-5 lg:py-6 border-b ${border} flex items-center gap-3`}
      >
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">
          ✦
        </div>
        <div>
          <h2 className={`text-base lg:text-lg font-bold ${textPrimary}`}>
            Code Neurons AI 
          </h2>
          <p className={`text-xs lg:text-sm ${textSecondary}`}>Autonomous Supply chain </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-4 lg:px-5 py-5 space-y-2">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 lg:gap-4
                px-4 lg:px-5 py-3.5 lg:py-4
                rounded-xl lg:rounded-2xl
                text-sm lg:text-base font-semibold
                transition-all duration-300 group relative overflow-hidden
                ${
                  active
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl scale-[1.02]`
                    : `${darkMode ? "text-slate-300 hover:bg-slate-800/50 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} hover:scale-[1.01]`
                }
              `}
            >
              {active && (
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <span
                className={`text-xl lg:text-2xl w-6 lg:w-7 text-center transition-transform duration-300 ${!active ? "group-hover:scale-125" : ""}`}
              >
                {item.icon}
              </span>
              <span className="relative z-10">{item.name}</span>
              {active && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      <div className={`px-4 lg:px-5 py-4 border-t ${border}`}>
        <div
          className={`${darkMode ? "bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-700/50" : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"} border rounded-xl p-4 backdrop-blur-xl hover:scale-[1.02] transition-transform duration-300`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span>✦</span>
            <p
              className={`text-xs font-bold ${darkMode ? "text-violet-300" : "text-violet-900"}`}
            >
              Pro Tip
            </p>
          </div>
          <p
            className={`text-xs ${darkMode ? "text-violet-200" : "text-violet-700"} leading-relaxed`}
          >
            Use natural language to trigger multi-agent workflows across your
            supply chain.
          </p>
        </div>
      </div>
    </aside>
  );
}
