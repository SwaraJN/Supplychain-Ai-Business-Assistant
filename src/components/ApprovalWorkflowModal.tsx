import { useState } from "react";

interface POItem {
  id: string;
  vendor: string;
  vendorEmail: string;
  material: string;
  quantity: string;
  unitPrice: string;
  total: string;
  leadTime: string;
  aiScore: number;
  aiRecommendation: "Approve" | "Override" | "Review";
  confidence: number;
  reason: string;
  urgency: string;
  urgencyColor: "rose" | "amber" | "emerald";
}

const PO_QUEUE: POItem[] = [
  {
    id: "PO-4821",
    vendor: "SteelCo Ltd.",
    vendorEmail: "steelco@vendor.in",
    material: "Raw Steel",
    quantity: "500 kg",
    unitPrice: "₹45/kg",
    total: "₹22,500",
    leadTime: "4 days",
    aiScore: 87.9,
    aiRecommendation: "Approve",
    confidence: 0.96,
    reason: "Best price-to-quality ratio. On-time rate 97%. Fastest lead time among competing quotes.",
    urgency: "Critical",
    urgencyColor: "rose",
  },
  {
    id: "PO-4822",
    vendor: "PlastiSource",
    vendorEmail: "plasti@vendor.in",
    material: "Plastic Pellets",
    quantity: "200 bags",
    unitPrice: "₹850/bag",
    total: "₹1,70,000",
    leadTime: "7 days",
    aiScore: 71.2,
    aiRecommendation: "Override",
    confidence: 0.81,
    reason: "Vendor flagged for 2 previous delays. Consider PolyTrade as backup. Proceed with caution.",
    urgency: "Medium",
    urgencyColor: "amber",
  },
  {
    id: "PO-4823",
    vendor: "BlueDart Express",
    vendorEmail: "ops@bluedart.in",
    material: "Logistics — SHP-9903",
    quantity: "1,200 kg (Hyderabad run)",
    unitPrice: "₹18/kg",
    total: "₹21,600",
    leadTime: "2 days",
    aiScore: 94.1,
    aiRecommendation: "Approve",
    confidence: 0.99,
    reason: "Preferred carrier. Optimal NH-65 route selected. ₹4,100 cost saving vs alternatives.",
    urgency: "Normal",
    urgencyColor: "emerald",
  },
];

const URGENCY_COLORS: Record<string, string> = {
  rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  Approve: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Override: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Review: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const RECOMMENDATION_ICON: Record<string, string> = {
  Approve: "✓",
  Override: "⚠",
  Review: "◎",
};

interface DecisionLog {
  id: string;
  vendor: string;
  decision: "approved" | "rejected" | "skipped";
  ts: string;
}

interface Props {
  darkMode: boolean;
  onClose: () => void;
}

export default function ApprovalWorkflowModal({ darkMode, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const [log, setLog] = useState<DecisionLog[]>([]);
  const [done, setDone] = useState(false);

  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode ? "bg-slate-900" : "bg-white";
  const innerCard = darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  const remaining = PO_QUEUE.length - currentIndex;
  const current = PO_QUEUE[currentIndex];

  const decide = (decision: "approved" | "rejected" | "skipped") => {
    if (!current || exiting) return;
    const dir = decision === "approved" ? "right" : "left";
    setExiting(dir);
    setTimeout(() => {
      setLog((prev) => [
        ...prev,
        {
          id: current.id,
          vendor: current.vendor,
          decision,
          ts: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);
      setExiting(null);
      if (currentIndex + 1 >= PO_QUEUE.length) {
        setDone(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 400);
  };

  // Stacked cards to render (current + next 2, behind it)
  const stackCards = PO_QUEUE.slice(currentIndex, currentIndex + 3);

  const exitStyle = (idx: number): React.CSSProperties => {
    if (idx === 0 && exiting === "right") {
      return { transform: "translateX(120%) rotate(15deg)", opacity: 0, transition: "all 0.4s ease-out" };
    }
    if (idx === 0 && exiting === "left") {
      return { transform: "translateX(-120%) rotate(-15deg)", opacity: 0, transition: "all 0.4s ease-out" };
    }
    return {};
  };

  const stackStyle = (idx: number): React.CSSProperties => {
    // idx 0 = front card
    const scales = [1, 0.94, 0.88];
    const translates = [0, 14, 26];
    const opacities = [1, 0.72, 0.45];
    return {
      position: idx === 0 ? "relative" : "absolute",
      top: idx === 0 ? undefined : `${translates[idx]}px`,
      left: idx === 0 ? undefined : 0,
      right: idx === 0 ? undefined : 0,
      transform: `scale(${scales[idx]})`,
      opacity: opacities[idx],
      zIndex: 10 - idx,
      transition: "all 0.3s ease-out",
      pointerEvents: idx === 0 ? "auto" : "none",
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${cardBg} border ${border} rounded-2xl shadow-2xl w-full flex flex-col fade-slide-up`}
        style={{ maxWidth: "520px", maxHeight: "90vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg">
              ⚡
            </div>
            <div>
              <p className={`text-base font-bold ${textPrimary}`}>One-Click Approve Command</p>
              <p className={`text-xs ${textSecondary}`}>
                Procurement AI · {done ? "All reviewed" : `${remaining} of ${PO_QUEUE.length} remaining`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${darkMode ? "text-slate-400 hover:bg-slate-700 hover:text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress dots */}
        <div className={`flex items-center gap-2 px-6 py-3 border-b ${border} shrink-0`}>
          {PO_QUEUE.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentIndex || done
                  ? "bg-emerald-500"
                  : i === currentIndex && !done
                    ? "bg-violet-500"
                    : darkMode ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
          ))}
          <span className={`text-xs font-semibold ${textSecondary} shrink-0 ml-1`}>
            {done ? PO_QUEUE.length : currentIndex}/{PO_QUEUE.length}
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {done ? (
            /* Completion screen */
            <div className="flex flex-col items-center justify-center py-8 text-center fade-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-3xl mb-4 shadow-lg">
                ✓
              </div>
              <p className={`text-xl font-bold ${textPrimary} mb-1`}>All Reviews Complete</p>
              <p className={`text-sm ${textSecondary} mb-6`}>Procurement AI has logged all decisions.</p>
              <div className="w-full space-y-2">
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${innerCard}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        entry.decision === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : entry.decision === "rejected"
                            ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }`}>
                        {entry.decision === "approved" ? "✓ Approved" : entry.decision === "rejected" ? "✕ Rejected" : "→ Skipped"}
                      </span>
                      <span className={`text-xs ${textSecondary}`}>{entry.id}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${textPrimary}`}>{entry.vendor}</p>
                      <p className={`text-[10px] ${textSecondary}`}>{entry.ts}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Stacked cards */
            <div style={{ position: "relative", paddingBottom: `${stackCards.length > 1 ? 28 : 0}px` }}>
              {[...stackCards].reverse().map((po, reversedIdx) => {
                const idx = stackCards.length - 1 - reversedIdx;
                const isFront = idx === 0;
                return (
                  <div
                    key={po.id}
                    style={{ ...stackStyle(idx), ...(isFront ? exitStyle(idx) : {}) }}
                  >
                    <div className={`border ${border} rounded-xl overflow-hidden shadow-xl ${darkMode ? "bg-slate-800" : "bg-white"}`}>
                      {/* PO Card Header */}
                      <div className={`px-5 py-4 border-b ${border} flex items-start justify-between gap-3`}>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className={`text-xs font-bold font-mono ${textSecondary}`}>{po.id}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${URGENCY_COLORS[po.urgencyColor]}`}>
                              {po.urgency}
                            </span>
                          </div>
                          <p className={`text-base font-bold ${textPrimary}`}>{po.vendor}</p>
                          <p className={`text-xs ${textSecondary} truncate`}>{po.vendorEmail}</p>
                        </div>
                        {/* AI Score circle */}
                        <div className={`shrink-0 flex flex-col items-center justify-center w-[3.5rem] h-[3.5rem] rounded-full border-2 ${
                          po.aiScore >= 85
                            ? darkMode ? "border-emerald-500/40 bg-emerald-500/10" : "border-emerald-300 bg-emerald-50"
                            : darkMode ? "border-amber-500/40 bg-amber-500/10" : "border-amber-300 bg-amber-50"
                        }`}>
                          <span className={`text-lg font-bold leading-none ${po.aiScore >= 85 ? "text-emerald-500" : "text-amber-500"}`}>
                            {po.aiScore}
                          </span>
                          <span className={`text-[9px] font-semibold leading-none mt-0.5 ${po.aiScore >= 85 ? "text-emerald-500" : "text-amber-500"}`}>
                            AI Score
                          </span>
                        </div>
                      </div>

                      {/* PO Details grid */}
                      <div className={`grid grid-cols-2 gap-0 border-b ${border}`}>
                        {[
                          { label: "Material", val: po.material },
                          { label: "Quantity", val: po.quantity },
                          { label: "Unit Price", val: po.unitPrice },
                          { label: "Total Value", val: po.total },
                        ].map(({ label, val }, i) => (
                          <div key={label} className={`px-4 py-3 ${i % 2 === 0 ? `border-r ${border}` : ""} ${i < 2 ? `border-b ${border}` : ""}`}>
                            <p className={`text-[10px] uppercase font-bold tracking-wider ${textSecondary} mb-0.5`}>{label}</p>
                            <p className={`text-sm font-semibold ${textPrimary} truncate`}>{val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Lead time */}
                      <div className={`px-4 py-3 border-b ${border} flex items-center justify-between`}>
                        <span className={`text-xs ${textSecondary}`}>Lead Time</span>
                        <span className={`text-xs font-bold ${textPrimary}`}>{po.leadTime}</span>
                      </div>

                      {/* AI recommendation */}
                      <div className={`px-4 py-3.5 border-b ${border} ${darkMode ? "bg-slate-900/50" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${RECOMMENDATION_COLORS[po.aiRecommendation]}`}>
                            {RECOMMENDATION_ICON[po.aiRecommendation]} AI: {po.aiRecommendation}
                          </span>
                          <span className={`text-[10px] ${textSecondary}`}>
                            Confidence: <span className="font-semibold">{(po.confidence * 100).toFixed(0)}%</span>
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{po.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!done && (
          <div className={`px-6 py-4 border-t ${border} shrink-0 flex items-center gap-3`}>
            {/* Reject */}
            <button
              onClick={() => decide("rejected")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                darkMode
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>

            {/* Skip */}
            <button
              onClick={() => decide("skipped")}
              className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                darkMode
                  ? "bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
            >
              Skip →
            </button>

            {/* Approve */}
            <button
              onClick={() => decide("approved")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
          </div>
        )}

        {done && (
          <div className={`px-6 py-4 border-t ${border} shrink-0`}>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-violet-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              Done · Close Command Center
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
