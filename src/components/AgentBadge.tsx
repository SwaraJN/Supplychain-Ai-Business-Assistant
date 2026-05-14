import React from "react";

interface AgentBadgeProps {
  code: string;
  active: boolean;
  darkMode?: boolean;
}

export default function AgentBadge({
  code,
  active,
}: AgentBadgeProps): React.JSX.Element {
  const colors: Record<string, string> = {
    INV: "from-emerald-500 to-emerald-600",
    PRO: "from-blue-500 to-blue-600",
    EML: "from-violet-500 to-violet-600",
    LOG: "from-amber-500 to-amber-600",
    FIN: "from-rose-500 to-rose-600",
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-white text-xs font-bold shrink-0 bg-gradient-to-br ${colors[code] || "from-slate-400 to-slate-500"} ${active ? "shadow-lg scale-105" : "opacity-80"} transition-all duration-300 hover:scale-110`}
    >
      {code}
    </span>
  );
}
