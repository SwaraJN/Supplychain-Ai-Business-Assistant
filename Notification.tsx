import { useState, useEffect, useRef } from "react";

// ── NOTIFICATION DATA ──
const INITIAL_NOTIFICATIONS = [
	{
		id: 1, read: false, pinned: true,
		type: "critical",
		icon: "🚨",
		title: "Critical Stock Alert",
		body: "Raw Steel inventory has dropped to 18% — below the 25% reorder threshold. Immediate procurement action recommended.",
		module: "Raw Inventory",
		ts: "Just now",
		tsRaw: 0,
		actions: ["View Inventory", "Create PO"],
	},
	{
		id: 2, read: false, pinned: false,
		type: "ai",
		icon: "✦",
		title: "AI Agent Completed Task",
		body: "Procurement Crew has successfully drafted RFQs for Vendors A, B & C. 3 documents are ready for your review and dispatch.",
		module: "AI Assistance",
		ts: "2 min ago",
		tsRaw: 2,
		actions: ["Review Drafts"],
	},
	{
		id: 3, read: false, pinned: false,
		type: "order",
		icon: "📦",
		title: "New Order Confirmed",
		body: "Order #ORD-4824 from DeltaMfg for Flex Module V3 × 75 units (₹1,56,000) has been confirmed and queued for processing.",
		module: "Orders",
		ts: "15 min ago",
		tsRaw: 15,
		actions: ["View Order"],
	},
	{
		id: 4, read: false, pinned: false,
		type: "logistics",
		icon: "🚚",
		title: "Shipment Delayed",
		body: "SHP-9902 from Pune Plant to Chennai DC via Delhivery is delayed by 1 day. New ETA: 25 Feb 2025. Carrier citing traffic disruptions.",
		module: "Logistics",
		ts: "42 min ago",
		tsRaw: 42,
		actions: ["Track Shipment", "Notify Customer"],
	},
	{
		id: 5, read: true, pinned: false,
		type: "vendor",
		icon: "🤝",
		title: "Vendor Quote Received",
		body: "SteelCo Ltd. has responded to your RFQ with a quote of ₹84/kg for Raw Steel — 6% lower than last order. Valid until 28 Feb 2025.",
		module: "Inventory Vendor",
		ts: "1 hr ago",
		tsRaw: 60,
		actions: ["View Quote", "Accept"],
	},
	{
		id: 6, read: true, pinned: false,
		type: "finance",
		icon: "💰",
		title: "PO Budget Threshold Warning",
		body: "Monthly procurement budget is at 78% utilization (₹3.9L / ₹5L). Finance Agent suggests deferring non-critical orders.",
		module: "Company Info",
		ts: "2 hr ago",
		tsRaw: 120,
		actions: ["View Budget"],
	},
	{
		id: 7, read: true, pinned: false,
		type: "system",
		icon: "⚙️",
		title: "System Sync Complete",
		body: "All ERP modules have been successfully synchronized. Inventory, Orders, and Logistics data are up to date as of 08:00 AM today.",
		module: "System",
		ts: "3 hr ago",
		tsRaw: 180,
		actions: [],
	},
	{
		id: 8, read: true, pinned: false,
		type: "order",
		icon: "✅",
		title: "Order Dispatched",
		body: "Order #ORD-4821 for TechBuild Co. (Widget Pro X1 × 50) has been dispatched via BlueDart. Expected delivery: 23 Feb 2025.",
		module: "Orders",
		ts: "5 hr ago",
		tsRaw: 300,
		actions: ["View Tracking"],
	},
];

const NOTIF_TYPE_CONFIG = {
	critical: { bg: "from-rose-500/20 to-red-500/10",   border: "border-rose-500/40",   badge: "bg-rose-500",     label: "Critical",  labelColor: "text-rose-400" },
	ai:       { bg: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/40", badge: "bg-violet-500",   label: "AI Agent",  labelColor: "text-violet-400" },
	order:    { bg: "from-indigo-500/20 to-blue-500/10",  border: "border-indigo-500/40", badge: "bg-indigo-500",   label: "Order",     labelColor: "text-indigo-400" },
	logistics:{ bg: "from-amber-500/20 to-yellow-500/10",border: "border-amber-500/40",  badge: "bg-amber-500",    label: "Logistics", labelColor: "text-amber-400" },
	vendor:   { bg: "from-orange-500/20 to-red-400/10",  border: "border-orange-500/40", badge: "bg-orange-500",   label: "Vendor",    labelColor: "text-orange-400" },
	finance:  { bg: "from-emerald-500/20 to-teal-500/10",border: "border-emerald-500/40",badge: "bg-emerald-500",  label: "Finance",   labelColor: "text-emerald-400" },
	system:   { bg: "from-slate-500/20 to-gray-500/10",  border: "border-slate-500/40",  badge: "bg-slate-500",    label: "System",    labelColor: "text-slate-400" },
};

// ── NOTIFICATION CENTER COMPONENT ──
function NotificationCenter({ open, onClose, darkMode }) {
	const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
	const [activeFilter, setActiveFilter] = useState("All");
	const [hoveredId, setHoveredId] = useState(null);
	const panelRef = useRef(null);

	const filters = ["All", "Unread", "Critical", "AI", "Orders", "Logistics"];

	const unreadCount = notifications.filter(n => !n.read).length;

	const filtered = notifications.filter(n => {
		if (activeFilter === "All") return true;
		if (activeFilter === "Unread") return !n.read;
		if (activeFilter === "Critical") return n.type === "critical";
		if (activeFilter === "AI") return n.type === "ai";
		if (activeFilter === "Orders") return n.type === "order";
		if (activeFilter === "Logistics") return n.type === "logistics";
		return true;
	}).sort((a, b) => {
		if (a.pinned && !b.pinned) return -1;
		if (!a.pinned && b.pinned) return 1;
		return a.tsRaw - b.tsRaw;
	});

	const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
	const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
	const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
	const clearAll = () => setNotifications([]);

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const handler = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-[90]"
				style={{ backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.25)" }}
				onClick={onClose}
			/>

			{/* Panel */}
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
					border: darkMode ? "1px solid rgba(148,163,184,0.15)" : "1px solid rgba(255,255,255,0.6)",
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
				{/* Glass sheen overlay */}
				<div style={{
					position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
					background: darkMode
						? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)"
						: "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 50%)",
					borderRadius: "1.25rem",
				}} />

				{/* ── HEADER ── */}
				<div style={{
					position: "relative", zIndex: 2, flexShrink: 0,
					padding: "1.25rem 1.25rem 0",
					borderBottom: darkMode ? "1px solid rgba(148,163,184,0.12)" : "1px solid rgba(15,23,42,0.08)",
					paddingBottom: "1rem",
				}}>
					<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
						<div>
							<div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
								<h3 style={{
									fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em",
									color: darkMode ? "#f1f5f9" : "#0f172a",
									fontFamily: "'DM Sans', sans-serif",
								}}>
									Notifications
								</h3>
								{unreadCount > 0 && (
									<span style={{
										display: "inline-flex", alignItems: "center", justifyContent: "center",
										minWidth: "1.375rem", height: "1.375rem", borderRadius: "9999px",
										background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
										color: "#fff", fontSize: "0.7rem", fontWeight: 700,
										boxShadow: "0 2px 8px rgba(124,58,237,0.5)",
										padding: "0 0.35rem",
									}}>
										{unreadCount}
									</span>
								)}
							</div>
							<p style={{ fontSize: "0.75rem", color: darkMode ? "#64748b" : "#94a3b8", fontFamily: "sans-serif" }}>
								{unreadCount > 0 ? `${unreadCount} unread · ` : "All caught up · "}{notifications.length} total
							</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
							{unreadCount > 0 && (
								<button
									onClick={markAllRead}
									style={{
										fontSize: "0.7rem", fontWeight: 600, padding: "0.375rem 0.75rem",
										borderRadius: "0.5rem", cursor: "pointer", border: "none",
										background: darkMode ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)",
										color: darkMode ? "#a78bfa" : "#7c3aed",
										fontFamily: "sans-serif", transition: "all 0.2s",
										whiteSpace: "nowrap",
									}}
									onMouseEnter={e => e.target.style.background = darkMode ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.2)"}
									onMouseLeave={e => e.target.style.background = darkMode ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)"}
								>
									Mark all read
								</button>
							)}
							<button
								onClick={onClose}
								style={{
									width: "2rem", height: "2rem", borderRadius: "0.625rem",
									display: "flex", alignItems: "center", justifyContent: "center",
									cursor: "pointer", border: "none",
									background: darkMode ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.06)",
									color: darkMode ? "#94a3b8" : "#64748b",
									transition: "all 0.2s", fontSize: "1rem",
								}}
								onMouseEnter={e => { e.currentTarget.style.background = darkMode ? "rgba(148,163,184,0.2)" : "rgba(15,23,42,0.12)"; e.currentTarget.style.color = darkMode ? "#f1f5f9" : "#0f172a"; }}
								onMouseLeave={e => { e.currentTarget.style.background = darkMode ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.06)"; e.currentTarget.style.color = darkMode ? "#94a3b8" : "#64748b"; }}
							>
								✕
							</button>
						</div>
					</div>

					{/* Filter pills */}
					<div style={{ display: "flex", gap: "0.375rem", overflowX: "auto", paddingBottom: "0.125rem" }}>
						{filters.map(f => {
							const active = activeFilter === f;
							return (
								<button
									key={f}
									onClick={() => setActiveFilter(f)}
									style={{
										padding: "0.3rem 0.75rem", borderRadius: "9999px",
										fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap",
										cursor: "pointer", border: "none", transition: "all 0.2s",
										fontFamily: "sans-serif",
										background: active
											? "linear-gradient(135deg, #7c3aed, #4f46e5)"
											: darkMode ? "rgba(148,163,184,0.1)" : "rgba(15,23,42,0.06)",
										color: active ? "#fff" : darkMode ? "#94a3b8" : "#64748b",
										boxShadow: active ? "0 4px 12px rgba(124,58,237,0.4)" : "none",
									}}
								>
									{f}
									{f === "Unread" && unreadCount > 0 && (
										<span style={{ marginLeft: "0.35rem", opacity: 0.8 }}>({unreadCount})</span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* ── NOTIFICATION LIST ── */}
				<div style={{
					flex: 1, overflowY: "auto", position: "relative", zIndex: 2,
					padding: "0.625rem 0.75rem",
				}}
					className="notif-scroll"
				>
					{filtered.length === 0 ? (
						<div style={{
							display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
							padding: "3rem 1rem", gap: "0.75rem",
						}}>
							<div style={{ fontSize: "2.5rem", opacity: 0.4 }}>🎉</div>
							<p style={{ fontSize: "0.875rem", fontWeight: 600, color: darkMode ? "#64748b" : "#94a3b8", fontFamily: "sans-serif" }}>
								{activeFilter === "All" ? "No notifications yet" : `No ${activeFilter.toLowerCase()} notifications`}
							</p>
						</div>
					) : (
						filtered.map((notif, i) => {
							const cfg = NOTIF_TYPE_CONFIG[notif.type] || NOTIF_TYPE_CONFIG.system;
							const isHovered = hoveredId === notif.id;
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
											? darkMode ? "1px solid rgba(148,163,184,0.08)" : "1px solid rgba(15,23,42,0.06)"
											: `1px solid ${darkMode ? cfg.border.replace("border-","").replace("/40","") + "66" : cfg.border.replace("border-","").replace("/40","") + "44"}`,
										background: notif.read
											? darkMode
												? isHovered ? "rgba(148,163,184,0.07)" : "rgba(148,163,184,0.03)"
												: isHovered ? "rgba(15,23,42,0.04)" : "rgba(15,23,42,0.02)"
											: darkMode
												? `linear-gradient(135deg, ${isHovered ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)"}, rgba(0,0,0,0))`
												: `linear-gradient(135deg, ${isHovered ? "rgba(124,58,237,0.09)" : "rgba(124,58,237,0.04)"}, rgba(255,255,255,0))`,
										transform: isHovered ? "translateX(2px)" : "none",
										animation: `notifSlideIn 0.35s ease-out ${i * 0.05}s both`,
									}}
								>
									{/* Unread indicator bar */}
									{!notif.read && (
										<div style={{
											position: "absolute", left: 0, top: "0.75rem", bottom: "0.75rem",
											width: "3px", borderRadius: "0 2px 2px 0",
											background: "linear-gradient(180deg, #7c3aed, #4f46e5)",
											boxShadow: "0 0 8px rgba(124,58,237,0.6)",
										}} />
									)}

									{/* Pinned indicator */}
									{notif.pinned && (
										<div style={{
											position: "absolute", top: "0.625rem", right: "0.625rem",
											fontSize: "0.6rem", opacity: 0.5,
											color: darkMode ? "#94a3b8" : "#64748b",
											transform: "rotate(30deg)",
										}}>📌</div>
									)}

									<div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
										{/* Icon bubble */}
										<div style={{
											width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem",
											display: "flex", alignItems: "center", justifyContent: "center",
											fontSize: "1.1rem", flexShrink: 0,
											background: darkMode
												? "rgba(255,255,255,0.06)"
												: "rgba(255,255,255,0.8)",
											border: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.08)",
											boxShadow: darkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.08)",
											backdropFilter: "blur(8px)",
										}}>
											{notif.icon}
										</div>

										{/* Content */}
										<div style={{ flex: 1, minWidth: 0 }}>
											<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
												{/* Type badge */}
												<span style={{
													fontSize: "0.62rem", fontWeight: 700, padding: "0.15rem 0.5rem",
													borderRadius: "9999px", textTransform: "uppercase", letterSpacing: "0.05em",
													background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
													color: darkMode
														? cfg.labelColor.replace("text-", "").replace("-400", "")
														: cfg.labelColor.replace("text-", "").replace("-400", ""),
													// Inline color since Tailwind won't know these at runtime
													color: notif.type === "critical" ? "#f87171"
														: notif.type === "ai" ? "#a78bfa"
														: notif.type === "order" ? "#818cf8"
														: notif.type === "logistics" ? "#fbbf24"
														: notif.type === "vendor" ? "#fb923c"
														: notif.type === "finance" ? "#34d399"
														: "#94a3b8",
													fontFamily: "sans-serif",
												}}>
													{cfg.label}
												</span>
												{!notif.read && (
													<span style={{
														width: "0.45rem", height: "0.45rem", borderRadius: "9999px",
														background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
														boxShadow: "0 0 6px rgba(124,58,237,0.7)",
														display: "inline-block", flexShrink: 0,
													}} />
												)}
											</div>

											<p style={{
												fontSize: "0.8rem", fontWeight: notif.read ? 500 : 700,
												color: darkMode ? "#e2e8f0" : "#0f172a",
												marginBottom: "0.3rem", fontFamily: "sans-serif",
												lineHeight: 1.3,
											}}>
												{notif.title}
											</p>
											<p style={{
												fontSize: "0.72rem", lineHeight: 1.5,
												color: darkMode ? "#64748b" : "#94a3b8",
												marginBottom: "0.5rem", fontFamily: "sans-serif",
											}}>
												{notif.body}
											</p>

											{/* Footer: module tag + time + actions */}
											<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
												<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
													<span style={{
														fontSize: "0.65rem", fontWeight: 600,
														color: darkMode ? "#475569" : "#94a3b8",
														fontFamily: "sans-serif",
													}}>
														{notif.module} · {notif.ts}
													</span>
												</div>

												<div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
													{notif.actions.slice(0, 2).map(action => (
														<button
															key={action}
															onClick={e => { e.stopPropagation(); markRead(notif.id); }}
															style={{
																fontSize: "0.65rem", fontWeight: 600, padding: "0.25rem 0.6rem",
																borderRadius: "0.4rem", cursor: "pointer",
																border: darkMode ? "1px solid rgba(148,163,184,0.15)" : "1px solid rgba(15,23,42,0.12)",
																background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
																color: darkMode ? "#c4b5fd" : "#7c3aed",
																fontFamily: "sans-serif", transition: "all 0.15s",
																whiteSpace: "nowrap",
																backdropFilter: "blur(8px)",
															}}
															onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg,#7c3aed,#4f46e5)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.border = "1px solid transparent"; }}
															onMouseLeave={e => { e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)"; e.currentTarget.style.color = darkMode ? "#c4b5fd" : "#7c3aed"; e.currentTarget.style.border = darkMode ? "1px solid rgba(148,163,184,0.15)" : "1px solid rgba(15,23,42,0.12)"; }}
														>
															{action}
														</button>
													))}
													{/* Dismiss */}
													<button
														onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
														style={{
															width: "1.4rem", height: "1.4rem",
															borderRadius: "0.375rem",
															display: "flex", alignItems: "center", justifyContent: "center",
															cursor: "pointer", border: "none",
															background: "transparent",
															color: darkMode ? "#475569" : "#cbd5e1",
															fontSize: "0.65rem", transition: "all 0.15s",
														}}
														onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
														onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = darkMode ? "#475569" : "#cbd5e1"; }}
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

				{/* ── FOOTER ── */}
				{notifications.length > 0 && (
					<div style={{
						flexShrink: 0, position: "relative", zIndex: 2,
						padding: "0.875rem 1.25rem",
						borderTop: darkMode ? "1px solid rgba(148,163,184,0.1)" : "1px solid rgba(15,23,42,0.06)",
						display: "flex", alignItems: "center", justifyContent: "space-between",
						background: darkMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.4)",
					}}>
						<p style={{ fontSize: "0.7rem", color: darkMode ? "#475569" : "#94a3b8", fontFamily: "sans-serif" }}>
							{filtered.length} of {notifications.length} shown
						</p>
						<button
							onClick={clearAll}
							style={{
								fontSize: "0.7rem", fontWeight: 600,
								color: darkMode ? "#64748b" : "#94a3b8",
								background: "none", border: "none", cursor: "pointer",
								fontFamily: "sans-serif", transition: "color 0.15s",
								padding: "0.25rem 0.5rem", borderRadius: "0.375rem",
							}}
							onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
							onMouseLeave={e => { e.currentTarget.style.color = darkMode ? "#64748b" : "#94a3b8"; e.currentTarget.style.background = "none"; }}
						>
							Clear all
						</button>
					</div>
				)}
			</div>
		</>
	);
}

const NAV_ITEMS = [
	{ name: "AI Assistance", icon: "✦", gradient: "from-violet-500 to-purple-600" },
	{ name: "Company Info", icon: "◈", gradient: "from-blue-500 to-cyan-600" },
	{ name: "Raw Inventory", icon: "▣", gradient: "from-emerald-500 to-teal-600" },
	{ name: "Inventory Vendor", icon: "◉", gradient: "from-orange-500 to-red-600" },
	{ name: "Finish Product", icon: "◆", gradient: "from-pink-500 to-rose-600" },
	{ name: "Orders", icon: "◎", gradient: "from-indigo-500 to-blue-600" },
	{ name: "Logistics", icon: "⟁", gradient: "from-amber-500 to-yellow-600" },
	{ name: "Logistics Vendor", icon: "⊞", gradient: "from-slate-500 to-gray-600" },
];

const INITIAL_MESSAGES = [
	{
		id: 1,
		type: "user",
		content: "Check inventory for Raw Steel and draft inquiries for the top 3 vendors if we are below 25%.",
		ts: "9:41 AM",
	},
	{
		id: 2,
		type: "ai",
		content: "Inventory scan complete. **Raw Steel is currently at 22%** — below your 25% threshold.\n\nThe Procurement Crew has drafted RFQs for your top 3 vendors based on past delivery performance and current pricing. Ready to dispatch.",
		ts: "9:41 AM",
		action: {
			label: "Drafts Ready",
			description: "3 RFQs · Vendors A, B & C",
			buttonText: "Send All",
			meta: "Avg. lead time: 4 days",
		},
	},
];

const AGENT_FEED = [
	{ id: 1, time: "Just now", msg: "Inventory Agent scanning Raw Steel stock levels.", status: "active", agent: "INV" },
	{ id: 2, time: "2 min ago", msg: "Procurement Crew drafted 3 vendor RFQs.", status: "done", agent: "PRO" },
	{ id: 3, time: "10 min ago", msg: "Email Analyzer processed Vendor A quote response.", status: "done", agent: "EML" },
	{ id: 4, time: "25 min ago", msg: "Logistics Agent verified optimal shipment routes.", status: "done", agent: "LOG" },
	{ id: 5, time: "1 hr ago", msg: "Finance Agent updated PO budget forecast.", status: "done", agent: "FIN" },
];

const STATS = [
	{ label: "Open POs", value: "14", delta: "+2", up: true },
	{ label: "Vendors Active", value: "38", delta: "stable", up: null },
	{ label: "Alerts", value: "3", delta: "critical", up: false },
];

// ── Module data for the non-AI tabs ──
const MODULE_CONTENT = {
	"Company Info": {
		icon: "◈",
		gradient: "from-blue-500 to-cyan-600",
		fields: [
			{ label: "Company Name", value: "AcmeCorp Industries Ltd." },
			{ label: "Registration No.", value: "REG-2024-00412" },
			{ label: "Industry", value: "Manufacturing & Distribution" },
			{ label: "Headquarters", value: "Mumbai, Maharashtra, India" },
			{ label: "Founded", value: "2008" },
			{ label: "GST Number", value: "27AABCU9603R1ZX" },
			{ label: "Contact Email", value: "ops@acmecorp.in" },
			{ label: "Phone", value: "+91 22 4567 8900" },
		],
	},
	"Raw Inventory": {
		icon: "▣",
		gradient: "from-emerald-500 to-teal-600",
		tableHeaders: ["Item", "SKU", "Stock", "Unit", "Reorder Level", "Status"],
		tableRows: [
			["Raw Steel", "RS-001", "2,200 kg", "kg", "3,000 kg", "Low"],
			["Aluminium Sheet", "AL-012", "5,800 kg", "kg", "2,000 kg", "OK"],
			["Copper Wire", "CW-045", "320 rolls", "rolls", "100 rolls", "OK"],
			["Plastic Pellets", "PP-089", "180 bags", "bags", "200 bags", "Low"],
			["Rubber Seals", "RB-034", "4,500 pcs", "pcs", "1,000 pcs", "OK"],
			["Carbon Fiber", "CF-007", "60 sheets", "sheets", "50 sheets", "OK"],
		],
	},
	"Inventory Vendor": {
		icon: "◉",
		gradient: "from-orange-500 to-red-600",
		tableHeaders: ["Vendor", "Contact", "Material", "Lead Time", "Rating", "Status"],
		tableRows: [
			["SteelCo Ltd.", "steelco@vendor.in", "Raw Steel", "4 days", "4.8/5", "Active"],
			["Alum Partners", "alum@vendor.in", "Aluminium", "6 days", "4.5/5", "Active"],
			["CopperTrade", "copper@vendor.in", "Copper Wire", "3 days", "4.9/5", "Active"],
			["PlastiSource", "plasti@vendor.in", "Plastic Pellets", "7 days", "4.1/5", "Review"],
			["RubberWorld", "rubber@vendor.in", "Rubber Seals", "5 days", "4.6/5", "Active"],
		],
	},
	"Finish Product": {
		icon: "◆",
		gradient: "from-pink-500 to-rose-600",
		tableHeaders: ["Product", "SKU", "Units Ready", "Units Sold", "Target", "Status"],
		tableRows: [
			["Widget Pro X1", "FP-001", "1,200", "980", "1,500", "On Track"],
			["Connector Unit A", "FP-012", "340", "340", "500", "Behind"],
			["Steel Frame B2", "FP-033", "2,100", "1,800", "2,000", "Done"],
			["Flex Module V3", "FP-047", "620", "410", "600", "On Track"],
			["Base Plate D9", "FP-061", "90", "30", "200", "Behind"],
		],
	},
	"Orders": {
		icon: "◎",
		gradient: "from-indigo-500 to-blue-600",
		tableHeaders: ["Order ID", "Customer", "Items", "Value", "Date", "Status"],
		tableRows: [
			["#ORD-4821", "TechBuild Co.", "Widget Pro X1 × 50", "₹1,24,000", "18 Feb 2025", "Dispatched"],
			["#ORD-4822", "InfraCorp", "Steel Frame B2 × 100", "₹2,10,000", "19 Feb 2025", "Processing"],
			["#ORD-4823", "Nova Systems", "Connector Unit A × 200", "₹87,000", "20 Feb 2025", "Pending"],
			["#ORD-4824", "DeltaMfg", "Flex Module V3 × 75", "₹1,56,000", "21 Feb 2025", "Confirmed"],
			["#ORD-4825", "Alpha Ltd.", "Base Plate D9 × 300", "₹63,000", "21 Feb 2025", "Pending"],
		],
	},
	"Logistics": {
		icon: "⟁",
		gradient: "from-amber-500 to-yellow-600",
		tableHeaders: ["Shipment ID", "Origin", "Destination", "Carrier", "ETA", "Status"],
		tableRows: [
			["SHP-9901", "Mumbai Warehouse", "Delhi Hub", "BlueDart", "23 Feb 2025", "In Transit"],
			["SHP-9902", "Pune Plant", "Chennai DC", "Delhivery", "24 Feb 2025", "Loaded"],
			["SHP-9903", "Mumbai Warehouse", "Hyderabad DC", "DTDC", "25 Feb 2025", "Pending"],
			["SHP-9904", "Nagpur Depot", "Kolkata Hub", "FedEx", "26 Feb 2025", "Scheduled"],
			["SHP-9905", "Delhi Hub", "Bangalore DC", "BlueDart", "22 Feb 2025", "Delivered"],
		],
	},
	"Logistics Vendor": {
		icon: "⊞",
		gradient: "from-slate-500 to-gray-600",
		tableHeaders: ["Vendor", "Coverage", "Avg. Delivery", "Rate/kg", "Rating", "Status"],
		tableRows: [
			["BlueDart Express", "Pan India", "2.1 days", "₹18/kg", "4.9/5", "Preferred"],
			["Delhivery", "Pan India", "2.8 days", "₹14/kg", "4.5/5", "Active"],
			["DTDC Courier", "Pan India", "3.2 days", "₹11/kg", "4.2/5", "Active"],
			["FedEx India", "Metro + Tier 1", "1.8 days", "₹24/kg", "4.7/5", "Active"],
			["Ecom Express", "Pan India", "3.5 days", "₹10/kg", "3.9/5", "Review"],
		],
	},
};

function AgentBadge({ code, active, darkMode }) {
	const colors = {
		INV: "from-emerald-500 to-emerald-600",
		PRO: "from-blue-500 to-blue-600",
		EML: "from-violet-500 to-violet-600",
		LOG: "from-amber-500 to-amber-600",
		FIN: "from-rose-500 to-rose-600",
	};
	return (
		<span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-white text-xs font-bold shrink-0 bg-gradient-to-br ${colors[code] || "from-slate-400 to-slate-500"} ${active ? "shadow-lg scale-105" : "opacity-80"} transition-all duration-300 hover:scale-110`}>
			{code}
		</span>
	);
}

function PulsingDot({ color = "bg-emerald-400" }) {
	return (
		<span className="relative inline-flex w-3 h-3">
			<span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}></span>
			<span className={`relative inline-flex rounded-full w-3 h-3 ${color} shadow-lg`}></span>
		</span>
	);
}

function ChatMessage({ msg, visible, darkMode }) {
	const isUser = msg.type === "user";
	const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
	return (
		<div className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
			{!isUser && (
				<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold mr-3 mt-1 shrink-0 shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">✦</div>
			)}
			<div className={`${isUser ? "max-w-[75%]" : "max-w-[85%]"}`}>
				{isUser ? (
					<div className={`${darkMode ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white" : "bg-gradient-to-br from-slate-800 to-slate-900 text-white"} px-5 py-3.5 rounded-2xl rounded-tr-md text-base leading-relaxed shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5`}>
						{msg.content}
					</div>
				) : (
					<div className={`${darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"} border backdrop-blur-xl rounded-2xl rounded-tl-md overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5`}>
						<div className="px-6 py-4">
							<p
								className={`text-base ${darkMode ? "text-slate-200" : "text-slate-700"} leading-relaxed`}
								dangerouslySetInnerHTML={{
									__html: msg.content
										.replace(/\*\*(.*?)\*\*/g, `<strong class="${darkMode ? "text-white" : "text-slate-900"} font-semibold">$1</strong>`)
										.replace(/\n/g, "<br/>")
								}}
							/>
						</div>
						{msg.action && (
							<div className={`border-t ${darkMode ? "border-slate-700 bg-gradient-to-r from-slate-800/80 to-violet-900/20" : "border-slate-200 bg-gradient-to-r from-slate-50 to-violet-50/40"} px-6 py-4 flex items-center justify-between gap-4`}>
								<div className="flex items-center gap-3 min-w-0">
									<span className={`inline-flex items-center gap-2 ${darkMode ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-violet-100 text-violet-700"} text-sm font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg backdrop-blur-sm`}>
										<span className={`w-2 h-2 rounded-full ${darkMode ? "bg-violet-400" : "bg-violet-500"} animate-pulse`}></span>
										{msg.action.label}
									</span>
									<div className="min-w-0">
										<p className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"} truncate`}>{msg.action.description}</p>
										<p className={`text-xs ${textSecondary}`}>{msg.action.meta}</p>
									</div>
								</div>
								<button className="shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 active:scale-95">
									{msg.action.buttonText}
								</button>
							</div>
						)}
					</div>
				)}
				<p className={`text-xs ${textSecondary} mt-2 ${isUser ? "text-right pr-1" : "pl-1"}`}>{msg.ts}</p>
			</div>
		</div>
	);
}

// ── Full-width module page (table / card layout) ──
function ModulePage({ tabName, darkMode }) {
	const mod = MODULE_CONTENT[tabName];
	const border = darkMode ? "border-slate-700" : "border-slate-200";
	const cardBg = darkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200";
	const textPrimary = darkMode ? "text-white" : "text-slate-900";
	const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
	const theadBg = darkMode ? "bg-slate-900/60" : "bg-slate-50";
	const rowHover = darkMode ? "hover:bg-slate-700/40" : "hover:bg-slate-50";

	if (!mod) {
		return (
			<div className="flex items-center justify-center h-full p-8">
				<div className="text-center fade-slide-up">
					<div className={`w-20 h-20 ${darkMode ? "bg-slate-800" : "bg-slate-100"} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl hover:scale-110 transition-transform duration-300`}>🛠</div>
					<h2 className={`text-2xl font-bold ${textPrimary} mb-3`}>{tabName}</h2>
					<p className={`${textSecondary} text-base`}>This module is under construction. Check back soon.</p>
				</div>
			</div>
		);
	}

	const statusColor = (status) => {
		const s = (status || "").toLowerCase();
		if (["ok", "active", "delivered", "preferred", "done", "confirmed"].some(k => s.includes(k)))
			return darkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200";
		if (["low", "behind", "pending", "review"].some(k => s.includes(k)))
			return darkMode ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200";
		if (["processing", "in transit", "loaded", "on track", "dispatched", "scheduled"].some(k => s.includes(k)))
			return darkMode ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200";
		return darkMode ? "bg-slate-700/50 text-slate-400 border-slate-600" : "bg-slate-100 text-slate-600 border-slate-200";
	};

	// Company Info — card layout
	if (tabName === "Company Info" && mod.fields) {
		return (
			<div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
				<div className="flex items-center gap-4 mb-6">
					<div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>{mod.icon}</div>
					<div>
						<h1 className={`text-2xl font-bold ${textPrimary}`}>{tabName}</h1>
						<p className={`text-sm ${textSecondary}`}>Organization details & registration info</p>
					</div>
				</div>
				<div className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
					<div className={`px-6 py-4 border-b ${border} bg-gradient-to-r ${mod.gradient}`}>
						<p className="text-white font-semibold text-sm uppercase tracking-wider">Company Profile</p>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{mod.fields.map((f, i) => (
							<div key={f.label} className={`px-6 py-5 border-b ${border} ${i % 2 === 0 ? `sm:border-r ${border}` : ""} ${rowHover} transition-colors`}>
								<p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1.5`}>{f.label}</p>
								<p className={`text-base font-semibold ${textPrimary}`}>{f.value}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// Table-based modules
	return (
		<div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
			<div className="flex items-center justify-between mb-6 flex-wrap gap-4">
				<div className="flex items-center gap-4">
					<div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>{mod.icon}</div>
					<div>
						<h1 className={`text-2xl font-bold ${textPrimary}`}>{tabName}</h1>
						<p className={`text-sm ${textSecondary}`}>{mod.tableRows?.length} records</p>
					</div>
				</div>
				<button className={`bg-gradient-to-r ${mod.gradient} text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}>
					+ Add New
				</button>
			</div>
			<div className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
				<div className="w-full overflow-x-auto">
					<table className="w-full min-w-max border-collapse">
						<thead>
							<tr className={`${theadBg} border-b ${border}`}>
								{mod.tableHeaders.map((h) => (
									<th key={h} className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider ${textSecondary} whitespace-nowrap`}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{mod.tableRows.map((row, ri) => (
								<tr key={ri} className={`border-b ${border} last:border-b-0 ${rowHover} transition-colors duration-150`}>
									{row.map((cell, ci) => {
										const isStatus = ci === row.length - 1;
										return (
											<td key={ci} className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"} whitespace-nowrap ${ci === 0 ? `font-semibold ${textPrimary}` : ""}`}>
												{isStatus ? (
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor(cell)}`}>{cell}</span>
												) : cell}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

// ── Main Dashboard ──
export default function SCMDashboard() {
	const [activeTab, setActiveTab] = useState("AI Assistance");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [notifOpen, setNotifOpen] = useState(false);
	const [darkMode, setDarkMode] = useState(false);
	const [messages, setMessages] = useState(INITIAL_MESSAGES);
	const [visibleMessages, setVisibleMessages] = useState(new Set());
	const [inputVal, setInputVal] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const chatEndRef = useRef(null);
	const profileRef = useRef(null);

	useEffect(() => {
		messages.forEach((msg, i) => {
			setTimeout(() => setVisibleMessages(prev => new Set([...prev, msg.id])), i * 300);
		});
	}, []);

	useEffect(() => {
		chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		const handler = (e) => {
			if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const sendMessage = () => {
		if (!inputVal.trim()) return;
		const userMsg = {
			id: Date.now(), type: "user", content: inputVal,
			ts: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
		};
		setMessages(prev => [...prev, userMsg]);
		setVisibleMessages(prev => new Set([...prev, userMsg.id]));
		setInputVal("");
		setIsTyping(true);
		setTimeout(() => {
			const aiResponse = {
				id: Date.now() + 1, type: "ai",
				content: "I'm analyzing your request across all autonomous crews. This might take a moment...",
				ts: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
			};
			setMessages(prev => [...prev, aiResponse]);
			setVisibleMessages(prev => new Set([...prev, aiResponse.id]));
			setIsTyping(false);
		}, 2000);
	};

	// Theme shortcuts
	const border = darkMode ? "border-slate-800" : "border-slate-200";
	const cardBg = darkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200";
	const textPrimary = darkMode ? "text-white" : "text-slate-900";
	const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
	const iconBtn = darkMode ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

	return (
		<div
			className={`transition-colors duration-500 ${darkMode ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"}`}
			style={{ height: "100vh", overflow: "hidden" }}
		>
			<style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .fade-slide-up { animation: fadeSlideUp 0.6s ease-out forwards; }
        .typing-dot { animation: typingBounce 1.4s infinite; }
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-8px);} }
        .scrollbar-thin::-webkit-scrollbar { width:6px; height:6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background:transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background:${darkMode?"rgba(148,163,184,0.3)":"rgba(203,213,225,0.5)"}; border-radius:3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background:${darkMode?"rgba(148,163,184,0.5)":"rgba(148,163,184,0.7)"}; }
        @media(max-width:768px){
          .mobile-menu-enter { animation:slideInLeft 0.3s ease-out; }
          @keyframes slideInLeft{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        }
        @keyframes notifPanelIn {
          from { opacity:0; transform:translateY(-12px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .notif-panel { animation: notifPanelIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes notifSlideIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        .notif-scroll::-webkit-scrollbar { width:4px; }
        .notif-scroll::-webkit-scrollbar-track { background:transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background:${darkMode?"rgba(148,163,184,0.2)":"rgba(15,23,42,0.1)"}; border-radius:2px; }
      `}</style>

			{/* ── NOTIFICATION CENTER ── */}
			<NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} darkMode={darkMode} />

			{/* ── ROOT: full viewport, no page scroll ── */}
			<div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>

				{/* Mobile overlay */}
				{sidebarOpen && (
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
				)}

				{/* ── SIDEBAR ── */}
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
					style={{ height:"100vh", flexShrink:0 }}
				>
					{/* Logo (theme toggle moved to header) */}
					<div className={`px-5 lg:px-6 py-5 lg:py-6 border-b ${border} flex items-center gap-3`}>
						<div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-xl lg:text-2xl font-bold shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">
							✦
						</div>
						<div>
							<h2 className={`text-base lg:text-lg font-bold ${textPrimary}`}>SupplyChain AI</h2>
							<p className={`text-xs lg:text-sm ${textSecondary}`}>Autonomous</p>
						</div>
					</div>

					{/* Nav — independently scrollable */}
					<nav className="flex-1 overflow-y-auto scrollbar-thin px-4 lg:px-5 py-5 space-y-2">
						{NAV_ITEMS.map((item) => {
							const active = activeTab === item.name;
							return (
								<button
									key={item.name}
									onClick={() => { setActiveTab(item.name); setSidebarOpen(false); }}
									className={`
                    w-full flex items-center gap-3 lg:gap-4
                    px-4 lg:px-5 py-3.5 lg:py-4
                    rounded-xl lg:rounded-2xl
                    text-sm lg:text-base font-semibold
                    transition-all duration-300 group relative overflow-hidden
                    ${active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl scale-[1.02]`
                      : `${darkMode ? "text-slate-300 hover:bg-slate-800/50 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} hover:scale-[1.01]`
                    }
                  `}
								>
									{active && <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
									<span className={`text-xl lg:text-2xl w-6 lg:w-7 text-center transition-transform duration-300 ${!active ? "group-hover:scale-125" : ""}`}>{item.icon}</span>
									<span className="relative z-10">{item.name}</span>
									{active && <span className="ml-auto w-2 h-2 rounded-full bg-white/70 animate-pulse" />}
								</button>
							);
						})}
					</nav>

					{/* Pro Tip */}
					<div className={`px-4 lg:px-5 py-4 border-t ${border}`}>
						<div className={`${darkMode ? "bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-700/50" : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"} border rounded-xl p-4 backdrop-blur-xl hover:scale-[1.02] transition-transform duration-300`}>
							<div className="flex items-center gap-2 mb-2">
								<span>✦</span>
								<p className={`text-xs font-bold ${darkMode ? "text-violet-300" : "text-violet-900"}`}>Pro Tip</p>
							</div>
							<p className={`text-xs ${darkMode ? "text-violet-200" : "text-violet-700"} leading-relaxed`}>
								Use natural language to trigger multi-agent workflows across your supply chain.
							</p>
						</div>
					</div>
				</aside>

				{/* ── MAIN AREA: header + content ── */}
				<div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden", height:"100vh" }}>

					{/* ── HEADER (fixed, full width of main area) ── */}
					<header
						className={`${darkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-xl border-b shadow-lg z-30`}
						style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0.875rem 1.5rem", gap:"1rem" }}
					>
						{/* Left: hamburger + page title */}
						<div style={{ display:"flex", alignItems:"center", gap:"0.75rem", minWidth:0 }}>
							<button
								onClick={() => setSidebarOpen(true)}
								className={`md:hidden p-2.5 rounded-xl ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95 shrink-0`}
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							</button>
							<div className="min-w-0">
								<h2 className={`text-xl lg:text-2xl font-bold ${textPrimary} truncate`}>{activeTab}</h2>
								<p className={`text-xs ${textSecondary} mt-0.5`}>Autonomous operations dashboard</p>
							</div>
						</div>

						{/* Right: notifications + theme toggle + profile */}
						<div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexShrink:0 }}>

							{/* Notifications */}
							<button
								onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
								className={`p-2.5 rounded-xl relative ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95`}
							>
								<svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
								</svg>
								<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
							</button>

							{/* Theme Toggle — moved to header */}
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

							{/* Profile dropdown — moved to header */}
							<div className="relative" ref={profileRef}>
								<button
									onClick={() => setProfileOpen(!profileOpen)}
									className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border ${darkMode ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700" : "bg-slate-50 hover:bg-slate-100 border-slate-200"} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
								>
									<div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
										JD
									</div>
									<div className="hidden sm:block text-left">
										<p className={`text-sm font-bold ${textPrimary} leading-none`}>Swaraj</p>
										<p className={`text-xs ${textSecondary} mt-0.5`}>SCM Manager</p>
									</div>
									<svg className={`w-4 h-4 ${textSecondary} transition-transform duration-300 ${profileOpen ? "rotate-180" : ""} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>

								{profileOpen && (
									<div className={`absolute top-full right-0 mt-2 w-48 ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border rounded-xl shadow-2xl overflow-hidden z-50 fade-slide-up`}>
										{["Profile Settings", "Preferences", "Logout"].map((item, idx) => (
											<button
												key={item}
												className={`w-full px-4 py-3 text-left text-sm ${darkMode ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-50"} ${idx !== 2 ? `border-b ${border}` : ""} transition-colors duration-200`}
											>
												{item}
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					</header>

					{/* ── CONTENT AREA (fills remaining height) ── */}
					<div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column", minHeight:0 }}>
						{activeTab === "AI Assistance" ? (
							// AI Assistance: side-by-side chat + right panel, NO page scroll
							<div style={{ flex:1, display:"flex", gap:"1.25rem", padding:"1.25rem", overflow:"hidden", minHeight:0 }}>

								{/* Chat panel — flex column, independently scrollable messages */}
								<div
									className={`${cardBg} backdrop-blur-xl border rounded-2xl xl:rounded-3xl shadow-2xl`}
									style={{ flex:"1 1 0", display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}
								>
									{/* Chat header */}
									<div className={`px-5 lg:px-6 py-4 border-b ${border} flex items-center justify-between`} style={{ flexShrink:0 }}>
										<div className="flex items-center gap-3">
											<div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">✦</div>
											<div>
												<p className={`text-base lg:text-lg font-bold ${textPrimary}`}>Autonomous Business Assistant</p>
												<div className="flex items-center gap-2 mt-1">
													<PulsingDot color={darkMode ? "bg-emerald-400" : "bg-emerald-500"} />
													<span className={`text-xs font-medium ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>Connected · 3 CrewAI Agents</span>
												</div>
											</div>
										</div>
										<button className={`p-2.5 rounded-xl ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95`}>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
											</svg>
										</button>
									</div>

									{/* Messages — independently scrollable, NEVER causes page scroll */}
									<div
										className={`scrollbar-thin ${darkMode ? "bg-slate-900/30" : "bg-slate-50/50"}`}
										style={{ flex:1, overflowY:"auto", padding:"1.25rem 1.5rem", display:"flex", flexDirection:"column", gap:"1.25rem", minHeight:0 }}
									>
										{messages.map((msg) => (
											<ChatMessage key={msg.id} msg={msg} visible={visibleMessages.has(msg.id)} darkMode={darkMode} />
										))}
										{isTyping && (
											<div className="flex items-center gap-3 fade-slide-up">
												<div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xl shadow-purple-500/30">✦</div>
												<div className={`${darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"} border backdrop-blur-xl rounded-2xl rounded-tl-md px-5 py-3.5 flex items-center gap-2 shadow-xl`}>
													{[0,1,2].map(i => (
														<span key={i} className={`typing-dot w-2.5 h-2.5 rounded-full ${darkMode ? "bg-violet-400" : "bg-violet-500"}`} style={{animationDelay:`${i*0.2}s`}} />
													))}
												</div>
											</div>
										)}
										<div ref={chatEndRef} />
									</div>

									{/* Input — always visible, never pushed off screen */}
									<div
										className={`border-t ${border} ${darkMode ? "bg-slate-800/50" : "bg-white"}`}
										style={{ flexShrink:0, padding:"0.875rem 1.25rem 1rem" }}
									>
										<div className={`flex items-center gap-3 ${darkMode ? "bg-slate-900/50 border-slate-700 focus-within:border-violet-500" : "bg-slate-50 border-slate-300 focus-within:border-violet-400"} border rounded-xl px-4 py-3 focus-within:ring-4 focus-within:ring-violet-500/20 transition-all duration-300 shadow-lg`}>
											<span className={`text-xl ${darkMode ? "text-slate-500" : "text-slate-400"} shrink-0`}>✦</span>
											<input
												type="text"
												value={inputVal}
												onChange={e => setInputVal(e.target.value)}
												onKeyDown={e => e.key === "Enter" && sendMessage()}
												placeholder="Ask agents to check stock, draft POs, analyze vendors..."
												className={`flex-1 bg-transparent text-base ${darkMode ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"} outline-none`}
											/>
											<button
												onClick={sendMessage}
												disabled={!inputVal.trim()}
												className="shrink-0 w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
											>
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
												</svg>
											</button>
										</div>
										<p className={`text-center text-xs ${textSecondary} mt-2`}>
											AI agents may make errors. Always verify critical supply chain decisions.
										</p>
									</div>
								</div>

								{/* Right panel — independently scrollable, never affects page or chat */}
								<div
									className="scrollbar-thin"
									style={{ width:"22rem", flexShrink:0, overflowY:"auto", display:"flex", flexDirection:"column", gap:"1rem", minHeight:0 }}
								>
									{/* Stats cards */}
									{STATS.map((s, idx) => (
										<div
											key={s.label}
											className={`${cardBg} backdrop-blur-xl border rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer fade-slide-up`}
											style={{ animationDelay:`${idx*0.1}s`, flexShrink:0 }}
										>
											<p className={`text-xs font-bold ${textSecondary} uppercase tracking-wider mb-2`}>{s.label}</p>
											<div className="flex items-end justify-between">
												<p className={`text-3xl font-bold ${textPrimary}`}>{s.value}</p>
												<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.up === true ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : s.up === false ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-slate-500/20 text-slate-500 border border-slate-400/30"}`}>
													{s.delta}
												</span>
											</div>
										</div>
									))}

									{/* Agent Pulse */}
									<div className={`${cardBg} backdrop-blur-xl border rounded-xl p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300`} style={{ flexShrink:0 }}>
										<div className="flex items-center justify-between mb-5">
											<p className={`text-sm font-bold ${textPrimary} uppercase tracking-wider`}>Live Agent Pulse</p>
											<PulsingDot color={darkMode ? "bg-emerald-400" : "bg-emerald-500"} />
										</div>
										<div className="relative space-y-5">
											<div className={`absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b ${darkMode ? "from-emerald-500/30 via-slate-700 to-transparent" : "from-emerald-300 via-slate-200 to-transparent"}`} />
											{AGENT_FEED.map((item, i) => (
												<div key={item.id} className="relative pl-12 fade-slide-up" style={{animationDelay:`${i*0.1}s`}}>
													<div className="absolute left-0 top-0.5">
														<AgentBadge code={item.agent} active={item.status === "active"} darkMode={darkMode} />
													</div>
													<p className={`text-xs ${textSecondary} font-medium mb-1`}>{item.time}</p>
													<p className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"} leading-relaxed`}>{item.msg}</p>
												</div>
											))}
										</div>
									</div>

									{/* Pending Approvals */}
									<div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl p-5 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow duration-300" style={{ flexShrink:0 }}>
										<p className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-2">Pending Approvals</p>
										<p className="text-5xl font-bold text-white mb-5">2</p>
										<div className="space-y-3 mb-5">
											{["PO #4821 · Vendor A · $12,400", "PO #4822 · Vendor B · $8,700"].map(item => (
												<div key={item} className="flex items-center gap-2.5 text-sm text-violet-100">
													<span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-lg shadow-amber-400/50 animate-pulse" />
													{item}
												</div>
											))}
										</div>
										<button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold py-3 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95">
											Review Actions →
										</button>
									</div>
								</div>
							</div>
						) : (
							// Module pages — full width, scrollable
							<div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }} className="scrollbar-thin">
								<ModulePage tabName={activeTab} darkMode={darkMode} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}