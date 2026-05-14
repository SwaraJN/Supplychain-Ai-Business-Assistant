import { useRef, useState, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  darkMode?: boolean;
  style?: React.CSSProperties;
}

export function SpotlightCard({
  children,
  className = "",
  darkMode = false,
  style,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          opacity,
          background: darkMode
            ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(139,92,246,.15), transparent 40%)`
            : `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(124,58,237,.1), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}
