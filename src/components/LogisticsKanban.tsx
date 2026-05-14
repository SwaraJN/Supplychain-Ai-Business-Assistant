import { useState } from "react";

interface Shipment {
  id: string;
  from: string;
  to: string;
  carrier: string;
  eta: string;
  weight: string;
  status: string;
  aiFlag: "optimal" | "review" | "completed";
}

interface RouteOption {
  route: string;
  reason: string;
  cost: string;
  timeLoss: string;
}

interface RouteData {
  recommended: { route: string; carrier: string; cost: string; time: string };
  rejected: RouteOption[];
  savings: { cost: string; time: string };
}

interface Column {
  id: string;
  label: string;
  icon: string;
  gradient: string;
  tagColor: string;
  shipments: Shipment[];
}

const COLUMNS: Column[] = [
  {
    id: "factory",
    label: "Factory / Loading",
    icon: "🏭",
    gradient: "from-amber-500 to-yellow-600",
    tagColor: "amber",
    shipments: [
      { id: "SHP-9903", from: "Mumbai Warehouse", to: "Hyderabad DC", carrier: "DTDC", eta: "25 Feb", weight: "1,200 kg", status: "Pending", aiFlag: "optimal" },
      { id: "SHP-9904", from: "Nagpur Depot", to: "Kolkata Hub", carrier: "FedEx", eta: "26 Feb", weight: "3,500 kg", status: "Scheduled", aiFlag: "review" },
    ],
  },
  {
    id: "transit",
    label: "In Transit",
    icon: "🚚",
    gradient: "from-blue-500 to-cyan-600",
    tagColor: "blue",
    shipments: [
      { id: "SHP-9901", from: "Mumbai Warehouse", to: "Delhi Hub", carrier: "BlueDart", eta: "23 Feb", weight: "2,800 kg", status: "In Transit", aiFlag: "optimal" },
      { id: "SHP-9902", from: "Pune Plant", to: "Chennai DC", carrier: "Delhivery", eta: "24 Feb", weight: "1,600 kg", status: "Loaded", aiFlag: "optimal" },
    ],
  },
  {
    id: "delivered",
    label: "Delivered",
    icon: "✅",
    gradient: "from-emerald-500 to-teal-600",
    tagColor: "emerald",
    shipments: [
      { id: "SHP-9905", from: "Delhi Hub", to: "Bangalore DC", carrier: "BlueDart", eta: "22 Feb", weight: "950 kg", status: "Delivered", aiFlag: "completed" },
    ],
  },
];

const AI_ROUTE_DATA: Record<string, RouteData> = {
  "SHP-9903": {
    recommended: { route: "Mumbai → Pune → Hyderabad (NH-65)", carrier: "DTDC", cost: "₹14,400", time: "2 days" },
    rejected: [
      { route: "Mumbai → Nagpur → Hyderabad (NH-44)", reason: "30% longer distance", cost: "₹18,500", timeLoss: "+8 hrs" },
      { route: "Mumbai → Hyderabad (Air Cargo)", reason: "3× higher cost", cost: "₹42,000", timeLoss: "-1 day" },
    ],
    savings: { cost: "₹4,100", time: "8 hrs" },
  },
  "SHP-9904": {
    recommended: { route: "Nagpur → Raipur → Kolkata (NH-53)", carrier: "FedEx", cost: "₹28,000", time: "2.5 days" },
    rejected: [
      { route: "Nagpur → Varanasi → Kolkata (NH-30)", reason: "Road closure: monsoon damage", cost: "₹31,500", timeLoss: "+12 hrs" },
    ],
    savings: { cost: "₹3,500", time: "12 hrs" },
  },
  "SHP-9901": {
    recommended: { route: "Mumbai → Vadodara → Jaipur → Delhi (NH-48)", carrier: "BlueDart", cost: "₹33,600", time: "1.5 days" },
    rejected: [
      { route: "Mumbai → Nagpur → Agra → Delhi (NH-44)", reason: "Higher toll + congestion", cost: "₹38,200", timeLoss: "+6 hrs" },
    ],
    savings: { cost: "₹4,600", time: "6 hrs" },
  },
  "SHP-9902": {
    recommended: { route: "Pune → Solapur → Hyderabad → Chennai (NH-65/44)", carrier: "Delhivery", cost: "₹19,200", time: "1.8 days" },
    rejected: [
      { route: "Pune → Mumbai → Chennai (Coastal NH-66)", reason: "Coastal check-posts add delay", cost: "₹22,800", timeLoss: "+10 hrs" },
    ],
    savings: { cost: "₹3,600", time: "10 hrs" },
  },
};

const STATUS_COLORS: Record<string, string> = {
  optimal: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function RouteOverlay({ shipId, darkMode, onClose }: { shipId: string; darkMode: boolean; onClose: () => void }) {
  const data = AI_ROUTE_DATA[shipId];
  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const panelBg = darkMode ? "bg-slate-900/95 border-slate-700" : "bg-white border-slate-200";

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`${panelBg} border rounded-2xl shadow-2xl w-full max-w-lg fade-slide-up`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-lg shadow-lg">
              🗺
            </div>
            <div>
              <p className={`text-sm font-bold ${textPrimary}`}>AI Route Analysis · {shipId}</p>
              <p className={`text-xs ${textSecondary}`}>Route Optimization Agent · Live</p>
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

        <div className="p-5 space-y-4">
          {/* Savings summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${darkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-emerald-400" : "text-emerald-600"} mb-1`}>Cost Saved</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>{data.savings.cost}</p>
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-blue-400" : "text-blue-600"} mb-1`}>Time Saved</p>
              <p className={`text-2xl font-bold ${darkMode ? "text-blue-300" : "text-blue-700"}`}>{data.savings.time}</p>
            </div>
          </div>

          {/* Recommended route */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-2`}>✦ AI-Recommended Route</p>
            <div className={`p-4 rounded-xl border ${darkMode ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-sm font-bold ${darkMode ? "text-emerald-300" : "text-emerald-700"} mb-1`}>{data.recommended.route}</p>
              <div className="flex gap-4 mt-2">
                <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Carrier: <span className="font-semibold">{data.recommended.carrier}</span></span>
                <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Cost: <span className="font-semibold">{data.recommended.cost}</span></span>
                <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>ETA: <span className="font-semibold">{data.recommended.time}</span></span>
              </div>
            </div>
          </div>

          {/* Rejected routes */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-2`}>⊘ Rejected Alternatives</p>
            <div className="space-y-2">
              {data.rejected.map((r, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${darkMode ? "bg-rose-500/8 border-rose-500/25" : "bg-rose-50 border-rose-200"}`}>
                  <p className={`text-xs font-semibold ${darkMode ? "text-rose-300" : "text-rose-700"} mb-1`}>{r.route}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-700"}`}>{r.reason}</span>
                    <span className={`text-[10px] ${textSecondary}`}>{r.cost} · {r.timeLoss}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentCard({ ship, darkMode, onRouteClick }: { ship: Shipment; darkMode: boolean; onRouteClick: (id: string) => void }) {
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-slate-800 border-slate-700 hover:border-slate-600" : "bg-white border-slate-200 hover:border-slate-300";
  const hasRoute = !!AI_ROUTE_DATA[ship.id];

  const flagLabel = ship.aiFlag === "optimal" ? "✦ AI Optimal" : ship.aiFlag === "review" ? "⚠ AI Review" : "✓ Completed";

  return (
    <div className={`${cardBg} border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}>
      {/* Shipment ID + badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold font-mono ${darkMode ? "text-slate-300" : "text-slate-700"}`}>{ship.id}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[ship.aiFlag]}`}>
          {flagLabel}
        </span>
      </div>

      {/* Route */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold ${textPrimary}`}>{ship.from}</span>
          <span className={`text-xs ${textSecondary}`}>→</span>
          <span className={`text-xs font-semibold ${textPrimary}`}>{ship.to}</span>
        </div>
      </div>

      {/* Meta */}
      <div className={`grid grid-cols-3 gap-2 mb-3 pb-3 border-b ${darkMode ? "border-slate-700" : "border-slate-100"}`}>
        {[
          { label: "Carrier", val: ship.carrier },
          { label: "ETA", val: ship.eta },
          { label: "Weight", val: ship.weight },
        ].map(({ label, val }) => (
          <div key={label}>
            <p className={`text-[9px] uppercase font-bold tracking-wider ${textSecondary} mb-0.5`}>{label}</p>
            <p className={`text-xs font-semibold ${textPrimary} truncate`}>{val}</p>
          </div>
        ))}
      </div>

      {/* AI Route button */}
      {hasRoute && (
        <button
          onClick={() => onRouteClick(ship.id)}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
            darkMode
              ? "bg-amber-500/15 text-amber-300 border-amber-500/35 hover:bg-amber-500/25"
              : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
          }`}
        >
          <span className="relative inline-flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-amber-500" />
          </span>
          View AI Route Analysis
        </button>
      )}
    </div>
  );
}

export default function LogisticsKanban({ darkMode }: { darkMode: boolean }) {
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const colBg = darkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200";
  const totalSavings = "₹16,300";
  const totalTimeSaved = "36 hrs";

  return (
    <>
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-2xl shadow-lg">
              ⟁
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>Logistics Kanban</h1>
              <p className={`text-sm ${textSecondary}`}>5 shipments · AI Route Optimization active</p>
            </div>
          </div>
        </div>

        {/* AI Savings Banner */}
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl mb-6 border ${darkMode ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}>
          <span className="relative inline-flex w-3 h-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full w-3 h-3 bg-amber-500" />
          </span>
          <p className={`text-sm ${darkMode ? "text-amber-300" : "text-amber-800"} flex-1 min-w-0`}>
            <span className="font-bold">AI Route Agent active</span> — Analysed 4 shipments.
            Total projected savings:{" "}
            <span className="font-bold text-emerald-500">{totalSavings}</span> ·{" "}
            <span className="font-bold text-blue-500">{totalTimeSaved}</span> time.
            Click any card to inspect the route analysis.
          </p>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map((col) => (
            <div key={col.id} className={`${colBg} border rounded-2xl overflow-hidden flex flex-col`}>
              {/* Column header */}
              <div className={`bg-gradient-to-r ${col.gradient} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <p className="text-white text-sm font-bold">{col.label}</p>
                </div>
                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold">
                  {col.shipments.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 flex flex-col gap-3 flex-1">
                {col.shipments.map((ship) => (
                  <ShipmentCard
                    key={ship.id}
                    ship={ship}
                    darkMode={darkMode}
                    onRouteClick={(id) => setActiveRoute(id)}
                  />
                ))}
                {col.shipments.length === 0 && (
                  <div className={`flex items-center justify-center py-8 text-xs ${textSecondary}`}>
                    No shipments
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Overlay Modal */}
      {activeRoute && (
        <RouteOverlay
          shipId={activeRoute}
          darkMode={darkMode}
          onClose={() => setActiveRoute(null)}
        />
      )}
    </>
  );
}
