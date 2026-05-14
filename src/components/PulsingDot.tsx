import React from "react";

interface PulsingDotProps {
  color?: string;
}

export default function PulsingDot({
  color = "bg-emerald-400",
}: PulsingDotProps): React.JSX.Element {
  return (
    <span className="relative inline-flex w-3 h-3">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}
      ></span>
      <span
        className={`relative inline-flex rounded-full w-3 h-3 ${color} shadow-lg`}
      ></span>
    </span>
  );
}
