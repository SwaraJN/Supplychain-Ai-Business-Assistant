import React, { useState, useEffect, useRef } from "react";
import {
  INITIAL_NOTIFICATIONS,
  NOTIF_TYPE_CONFIG,
} from "../constants/notifications";
import type { Notification } from "../types";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export default function NotificationCenter({
  open,
  onClose,
  darkMode,
}: NotificationCenterProps): React.JSX.Element | null {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filters = ["All", "Unread", "Critical", "AI", "Orders", "Logistics"];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return !n.read;
      if (activeFilter === "Critical") return n.type === "critical";
      if (activeFilter === "AI") return n.type === "ai";
      if (activeFilter === "Orders") return n.type === "order";
      if (activeFilter === "Logistics") return n.type === "logistics";
      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.tsRaw - b.tsRaw;
    });

  const markAllRead = (): void =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number): void =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const dismiss = (id: number): void =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAll = (): void => setNotifications([]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90]"
        style={{ backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.25)" }}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className="fixed z-[100] notif-panel"
        style={{
          top: "4.5rem",
          right: "1.25rem",
          width: "min(440px, calc(100vw - 2rem))",
          maxHeight: "calc(100vh - 6rem)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "1.25rem",
          overflow: "hidden",
          border: darkMode
            ? "1px solid rgba(148,163,184,0.15)"
            : "1px solid rgba(255,255,255,0.6)",
          boxShadow: darkMode
            ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 32px 80px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.9)",
          background: darkMode
            ? "rgba(15, 20, 35, 0.82)"
            : "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
            background: darkMode
              ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%)",
            borderRadius: "1.25rem",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            flexShrink: 0,
            padding: "1.25rem 1.25rem 0",
            borderBottom: darkMode
              ? "1px solid rgba(148,163,184,0.12)"
              : "1px solid rgba(15,23,42,0.08)",
            paddingBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "0.25rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: darkMode ? "#f1f5f9" : "#0f172a",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "1.375rem",
                      height: "1.375rem",
                      borderRadius: "9999px",
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(124,58,237,0.5)",
                      padding: "0 0.35rem",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: darkMode ? "#64748b" : "#94a3b8",
                  fontFamily: "sans-serif",
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} unread · `
                  : "All caught up · "}
                {notifications.length} total
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    border: "none",
                    background: darkMode
                      ? "rgba(124,58,237,0.2)"
                      : "rgba(124,58,237,0.1)",
                    color: darkMode ? "#a78bfa" : "#7c3aed",
                    fontFamily: "sans-serif",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = darkMode
                      ? "rgba(124,58,237,0.35)"
                      : "rgba(124,58,237,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = darkMode
                      ? "rgba(124,58,237,0.2)"
                      : "rgba(124,58,237,0.1)")
                  }
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "0.625rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  background: darkMode
                    ? "rgba(148,163,184,0.1)"
                    : "rgba(15,23,42,0.06)",
                  color: darkMode ? "#94a3b8" : "#64748b",
                  transition: "all 0.2s",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? "rgba(148,163,184,0.2)"
                    : "rgba(15,23,42,0.12)";
                  e.currentTarget.style.color = darkMode
                    ? "#f1f5f9"
                    : "#0f172a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode
                    ? "rgba(148,163,184,0.1)"
                    : "rgba(15,23,42,0.06)";
                  e.currentTarget.style.color = darkMode
                    ? "#94a3b8"
                    : "#64748b";
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.375rem",
              overflowX: "auto",
              paddingBottom: "0.125rem",
            }}
          >
            {filters.map((f) => {
              const active = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: "none",
                    transition: "all 0.2s",
                    fontFamily: "sans-serif",
                    background: active
                      ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                      : darkMode
                        ? "rgba(148,163,184,0.1)"
                        : "rgba(15,23,42,0.06)",
                    color: active ? "#fff" : darkMode ? "#94a3b8" : "#64748b",
                    boxShadow: active
                      ? "0 4px 12px rgba(124,58,237,0.4)"
                      : "none",
                  }}
                >
                  {f}
                  {f === "Unread" && unreadCount > 0 && (
                    <span style={{ marginLeft: "0.35rem", opacity: 0.8 }}>
                      ({unreadCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            zIndex: 2,
            padding: "0.625rem 0.75rem",
          }}
          className="notif-scroll"
        >
          {filtered.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem 1rem",
                gap: "0.75rem",
              }}
            >
              <div style={{ fontSize: "2.5rem", opacity: 0.4 }}>🎉</div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: darkMode ? "#64748b" : "#94a3b8",
                  fontFamily: "sans-serif",
                }}
              >
                {activeFilter === "All"
                  ? "No notifications yet"
                  : `No ${activeFilter.toLowerCase()} notifications`}
              </p>
            </div>
          ) : (
            filtered.map((notif, i) => {
              const cfg =
                NOTIF_TYPE_CONFIG[notif.type] || NOTIF_TYPE_CONFIG.system;
              const isHovered = hoveredId === notif.id;
              const notifColor =
                notif.type === "critical"
                  ? "#f87171"
                  : notif.type === "ai"
                    ? "#a78bfa"
                    : notif.type === "order"
                      ? "#818cf8"
                      : notif.type === "logistics"
                        ? "#fbbf24"
                        : notif.type === "vendor"
                          ? "#fb923c"
                          : notif.type === "finance"
                            ? "#34d399"
                            : "#94a3b8";

              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  onMouseEnter={() => setHoveredId(notif.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: "relative",
                    borderRadius: "0.875rem",
                    padding: "0.875rem 1rem",
                    marginBottom: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    border: notif.read
                      ? darkMode
                        ? "1px solid rgba(148,163,184,0.08)"
                        : "1px solid rgba(15,23,42,0.06)"
                      : `1px solid ${darkMode ? cfg.border.replace("border-", "").replace("/40", "") + "66" : cfg.border.replace("border-", "").replace("/40", "") + "44"}`,
                    background: notif.read
                      ? darkMode
                        ? isHovered
                          ? "rgba(148,163,184,0.07)"
                          : "rgba(148,163,184,0.03)"
                        : isHovered
                          ? "rgba(15,23,42,0.04)"
                          : "rgba(15,23,42,0.02)"
                      : darkMode
                        ? `linear-gradient(135deg, ${isHovered ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)"}, rgba(0,0,0,0))`
                        : `linear-gradient(135deg, ${isHovered ? "rgba(124,58,237,0.09)" : "rgba(124,58,237,0.04)"}, rgba(255,255,255,0))`,
                    transform: isHovered ? "translateX(2px)" : "none",
                    animation: `notifSlideIn 0.35s ease-out ${i * 0.05}s both`,
                  }}
                >
                  {!notif.read && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "0.75rem",
                        bottom: "0.75rem",
                        width: "3px",
                        borderRadius: "0 2px 2px 0",
                        background: "linear-gradient(180deg, #7c3aed, #4f46e5)",
                        boxShadow: "0 0 8px rgba(124,58,237,0.6)",
                      }}
                    />
                  )}

                  {notif.pinned && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.625rem",
                        right: "0.625rem",
                        fontSize: "0.6rem",
                        opacity: 0.5,
                        color: darkMode ? "#94a3b8" : "#64748b",
                        transform: "rotate(30deg)",
                      }}
                    >
                      📌
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "2.5rem",
                        height: "2.5rem",
                        borderRadius: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                        background: darkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.8)",
                        border: darkMode
                          ? "1px solid rgba(255,255,255,0.08)"
                          : "1px solid rgba(15,23,42,0.08)",
                        boxShadow: darkMode
                          ? "0 2px 8px rgba(0,0,0,0.3)"
                          : "0 2px 8px rgba(15,23,42,0.08)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {notif.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.25rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            background: darkMode
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(15,23,42,0.06)",
                            color: notifColor,
                            fontFamily: "sans-serif",
                          }}
                        >
                          {cfg.label}
                        </span>
                        {!notif.read && (
                          <span
                            style={{
                              width: "0.45rem",
                              height: "0.45rem",
                              borderRadius: "9999px",
                              background:
                                "linear-gradient(135deg,#7c3aed,#4f46e5)",
                              boxShadow: "0 0 6px rgba(124,58,237,0.7)",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: notif.read ? 500 : 700,
                          color: darkMode ? "#e2e8f0" : "#0f172a",
                          marginBottom: "0.3rem",
                          fontFamily: "sans-serif",
                          lineHeight: 1.3,
                        }}
                      >
                        {notif.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          lineHeight: 1.5,
                          color: darkMode ? "#64748b" : "#94a3b8",
                          marginBottom: "0.5rem",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {notif.body}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              color: darkMode ? "#475569" : "#94a3b8",
                              fontFamily: "sans-serif",
                            }}
                          >
                            {notif.module} · {notif.ts}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                          }}
                        >
                          {notif.actions.slice(0, 2).map((action) => (
                            <button
                              key={action}
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(notif.id);
                              }}
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                padding: "0.25rem 0.6rem",
                                borderRadius: "0.4rem",
                                cursor: "pointer",
                                border: darkMode
                                  ? "1px solid rgba(148,163,184,0.15)"
                                  : "1px solid rgba(15,23,42,0.12)",
                                background: darkMode
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(255,255,255,0.8)",
                                color: darkMode ? "#c4b5fd" : "#7c3aed",
                                fontFamily: "sans-serif",
                                transition: "all 0.15s",
                                whiteSpace: "nowrap",
                                backdropFilter: "blur(8px)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg,#7c3aed,#4f46e5)";
                                e.currentTarget.style.color = "#fff";
                                e.currentTarget.style.border =
                                  "1px solid transparent";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = darkMode
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(255,255,255,0.8)";
                                e.currentTarget.style.color = darkMode
                                  ? "#c4b5fd"
                                  : "#7c3aed";
                                e.currentTarget.style.border = darkMode
                                  ? "1px solid rgba(148,163,184,0.15)"
                                  : "1px solid rgba(15,23,42,0.12)";
                              }}
                            >
                              {action}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismiss(notif.id);
                            }}
                            style={{
                              width: "1.4rem",
                              height: "1.4rem",
                              borderRadius: "0.375rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "none",
                              background: "transparent",
                              color: darkMode ? "#475569" : "#cbd5e1",
                              fontSize: "0.65rem",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.15)";
                              e.currentTarget.style.color = "#f87171";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = darkMode
                                ? "#475569"
                                : "#cbd5e1";
                            }}
                            title="Dismiss"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {notifications.length > 0 && (
          <div
            style={{
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
              padding: "0.875rem 1.25rem",
              borderTop: darkMode
                ? "1px solid rgba(148,163,184,0.1)"
                : "1px solid rgba(15,23,42,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: darkMode
                ? "rgba(0,0,0,0.15)"
                : "rgba(255,255,255,0.4)",
            }}
          >
            <p
              style={{
                fontSize: "0.7rem",
                color: darkMode ? "#475569" : "#94a3b8",
                fontFamily: "sans-serif",
              }}
            >
              {filtered.length} of {notifications.length} shown
            </p>
            <button
              onClick={clearAll}
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: darkMode ? "#64748b" : "#94a3b8",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "sans-serif",
                transition: "color 0.15s",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.375rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f87171";
                e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = darkMode ? "#64748b" : "#94a3b8";
                e.currentTarget.style.background = "none";
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
