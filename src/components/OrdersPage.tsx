import { useState } from "react";
import EmailExtractionModal from "./EmailExtractionModal";

const ORDERS = [
  { id: "#ORD-4821", customer: "TechBuild Co.", items: "Widget Pro X1 × 50", value: "₹1,24,000", date: "18 Feb 2025", status: "Dispatched", hasEmail: true },
  { id: "#ORD-4822", customer: "InfraCorp", items: "Steel Frame B2 × 100", value: "₹2,10,000", date: "19 Feb 2025", status: "Processing", hasEmail: true },
  { id: "#ORD-4823", customer: "Nova Systems", items: "Connector Unit A × 200", value: "₹87,000", date: "20 Feb 2025", status: "Pending", hasEmail: true },
  { id: "#ORD-4824", customer: "DeltaMfg", items: "Flex Module V3 × 75", value: "₹1,56,000", date: "21 Feb 2025", status: "Confirmed", hasEmail: false },
  { id: "#ORD-4825", customer: "Alpha Ltd.", items: "Base Plate D9 × 300", value: "₹63,000", date: "21 Feb 2025", status: "Pending", hasEmail: false },
];

export default function OrdersPage({ darkMode }: { darkMode: boolean }) {
  const [emailModalOrder, setEmailModalOrder] = useState<string | null>(null);

  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const theadBg = darkMode ? "bg-slate-900/60" : "bg-slate-50";
  const rowHover = darkMode ? "hover:bg-slate-700/40" : "hover:bg-slate-50";

  const statusColor = (status: string) => {
    const s = status.toLowerCase();
    if (["dispatched", "confirmed"].some((k) => s.includes(k)))
      return darkMode ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["pending"].some((k) => s.includes(k)))
      return darkMode ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200";
    if (["processing"].some((k) => s.includes(k)))
      return darkMode ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200";
    return darkMode ? "bg-slate-700/50 text-slate-400 border-slate-600" : "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <>
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg">
              ◎
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>Orders</h1>
              <p className={`text-sm ${textSecondary}`}>{ORDERS.length} records · {ORDERS.filter(o => o.hasEmail).length} with AI email extraction</p>
            </div>
          </div>
          <button className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
            + Add Order
          </button>
        </div>

        {/* Email Extraction hint */}
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl mb-6 border ${darkMode ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50 border-blue-200"}`}>
          <span className="text-blue-500 text-base shrink-0">📧</span>
          <p className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
            <span className="font-bold">Email Analyzer Agent active</span> — Click{" "}
            <span className="font-semibold">View Email</span> on any AI-processed order to inspect the raw email vs extracted JSON.
          </p>
        </div>

        {/* Table */}
        <div className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className={`${theadBg} border-b ${border}`}>
                  {["Order ID", "Customer", "Items", "Value", "Date", "Status", "Email Analysis"].map((h) => (
                    <th key={h} className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider ${textSecondary} whitespace-nowrap`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((row) => (
                  <tr key={row.id} className={`border-b ${border} last:border-b-0 ${rowHover} transition-colors duration-150`}>
                    <td className={`px-5 py-4 text-sm font-semibold ${textPrimary} whitespace-nowrap font-mono`}>{row.id}</td>
                    <td className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}>{row.customer}</td>
                    <td className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}>{row.items}</td>
                    <td className={`px-5 py-4 text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"} whitespace-nowrap`}>{row.value}</td>
                    <td className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}>{row.date}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {row.hasEmail ? (
                        <button
                          onClick={() => setEmailModalOrder(row.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                            darkMode
                              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30"
                              : "bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200"
                          }`}
                        >
                          <span className="text-sm">📧</span>
                          View Email
                        </button>
                      ) : (
                        <span className={`text-xs ${textSecondary}`}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModalOrder && (
        <EmailExtractionModal
          orderId={emailModalOrder}
          darkMode={darkMode}
          onClose={() => setEmailModalOrder(null)}
        />
      )}
    </>
  );
}
