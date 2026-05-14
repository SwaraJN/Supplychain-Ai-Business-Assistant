import { useState, Fragment, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getInventory, createInventory } from "../services/api";
import type { Inventory, CreateInventoryPayload } from "../services/api";

interface InventoryItem {
  item: string;
  sku: string;
  stock: string;
  unit: string;
  reorderLevel: string;
  status: "Low" | "OK";
  aiStatus?: string;
  aiVendors?: number;
}

const MOCK_INVENTORY: InventoryItem[] = [
  {
    item: "Raw Steel",
    sku: "RS-001",
    stock: "2,200 kg",
    unit: "kg",
    reorderLevel: "3,000 kg",
    status: "Low",
    aiStatus: "AI Sourcing: In Progress",
    aiVendors: 2,
  },
  {
    item: "Aluminium Sheet",
    sku: "AL-012",
    stock: "5,800 kg",
    unit: "kg",
    reorderLevel: "2,000 kg",
    status: "OK",
  },
  {
    item: "Copper Wire",
    sku: "CW-045",
    stock: "320 rolls",
    unit: "rolls",
    reorderLevel: "100 rolls",
    status: "OK",
  },
  {
    item: "Plastic Pellets",
    sku: "PP-089",
    stock: "180 bags",
    unit: "bags",
    reorderLevel: "200 bags",
    status: "Low",
    aiStatus: "AI Sourcing: In Progress",
    aiVendors: 1,
  },
  {
    item: "Rubber Seals",
    sku: "RB-034",
    stock: "4,500 pcs",
    unit: "pcs",
    reorderLevel: "1,000 pcs",
    status: "OK",
  },
  {
    item: "Carbon Fiber",
    sku: "CF-007",
    stock: "60 sheets",
    unit: "sheets",
    reorderLevel: "50 sheets",
    status: "OK",
  },
];

const transformApiDataToInventoryItem = (item: Inventory): InventoryItem => {
  const needsReorder = item.needs_reorder;
  return {
    item: item.name,
    sku: `SKU-${item.id}`,
    stock: item.current_stock,
    unit: "unit",
    reorderLevel: item.max_capacity,
    status: needsReorder ? "Low" : "OK",
    aiStatus: needsReorder ? "AI Sourcing: In Progress" : undefined,
    aiVendors: needsReorder ? 1 : undefined,
  };
};

interface EmailThread {
  time: string;
  type: "sent" | "received" | "waiting";
  message: string;
}

const EMAIL_THREADS: Record<string, EmailThread[]> = {
  "RS-001": [
    {
      time: "9:41 AM",
      type: "sent",
      message: "RFQ dispatched → SteelCo Ltd. (steelco@vendor.in)",
    },
    {
      time: "9:43 AM",
      type: "sent",
      message: "RFQ dispatched → MetalHub Pvt. (hub@metalhub.in)",
    },
    {
      time: "9:45 AM",
      type: "sent",
      message: "RFQ dispatched → Alum Partners (alum@vendor.in)",
    },
    {
      time: "10:12 AM",
      type: "received",
      message:
        "Quote received from SteelCo Ltd. — ₹45/kg · 4-day delivery · AI Score: 87.9 ✓",
    },
    {
      time: "10:31 AM",
      type: "waiting",
      message: "Awaiting reply from MetalHub Pvt. (ETA: ~2 hrs)",
    },
    {
      time: "10:31 AM",
      type: "waiting",
      message: "Awaiting reply from Alum Partners (ETA: ~3 hrs)",
    },
  ],
  "PP-089": [
    {
      time: "9:50 AM",
      type: "sent",
      message: "RFQ dispatched → PlastiSource (plasti@vendor.in)",
    },
    {
      time: "10:05 AM",
      type: "sent",
      message: "RFQ dispatched → PolyTrade Pvt. (poly@polytrade.in)",
    },
    {
      time: "11:02 AM",
      type: "waiting",
      message: "Awaiting reply from PlastiSource (flagged: previous delays)",
    },
    {
      time: "11:02 AM",
      type: "waiting",
      message: "Awaiting reply from PolyTrade Pvt. (first-time vendor)",
    },
  ],
};

function EmailThreadPanel({
  sku,
  darkMode,
}: {
  sku: string;
  darkMode: boolean;
}) {
  const threads = EMAIL_THREADS[sku] || [];
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  const dotColor = (type: string) =>
    type === "sent"
      ? "bg-blue-500"
      : type === "received"
        ? "bg-emerald-500"
        : "bg-amber-400";

  const msgColor = (type: string) =>
    type === "sent"
      ? darkMode
        ? "text-blue-300"
        : "text-blue-700"
      : type === "received"
        ? darkMode
          ? "text-emerald-300"
          : "text-emerald-700"
        : darkMode
          ? "text-amber-300"
          : "text-amber-700";

  const label = (type: string) =>
    type === "sent"
      ? "📤 Sent"
      : type === "received"
        ? "📥 Received"
        : "⏳ Waiting";

  return (
    <div
      className={`px-5 py-4 border-t ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-slate-50"} slide-in-right`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="relative inline-flex w-2.5 h-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-violet-500" />
        </span>
        <p
          className={`text-xs font-bold ${darkMode ? "text-violet-300" : "text-violet-700"} uppercase tracking-wider`}
        >
          Vendor Communication Agent · Live Thread
        </p>
      </div>
      <div className="relative space-y-3 pl-10">
        <div
          className={`absolute left-3 top-0 bottom-0 w-px ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}
        />
        {threads.map((t, i) => (
          <div key={i} className="relative">
            <div
              className={`absolute -left-7 top-0.5 w-2.5 h-2.5 rounded-full ${dotColor(t.type)} shrink-0 shadow-sm`}
            />
            <p className={`text-[10px] font-medium ${textSecondary} mb-0.5`}>
              {t.time}
            </p>
            <p className={`text-xs font-semibold ${msgColor(t.type)}`}>
              {label(t.type)}: {t.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CreateInventoryModalProps {
  darkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateInventoryModal({
  darkMode,
  onClose,
  onSuccess,
}: CreateInventoryModalProps) {
  const [formData, setFormData] = useState<CreateInventoryPayload>({
    name: "",
    current_stock: 0,
    max_capacity: 0,
    reorder_threshold_percentage: 25,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardBg = darkMode
    ? "bg-slate-800/95 border-slate-700"
    : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const inputBg = darkMode
    ? "bg-slate-900/50 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-900";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createInventory(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create inventory item",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateStockPercentage = () => {
    if (formData.max_capacity > 0) {
      return ((formData.current_stock / formData.max_capacity) * 100).toFixed(
        1,
      );
    }
    return "0";
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${cardBg} backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Add New Raw Material
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="overflow-y-auto max-h-[calc(90vh-8rem)] scrollbar-thin"
          >
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* Material Name */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Material Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="e.g., Steel Coils"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Stock */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Current Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.current_stock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_stock: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="500"
                  />
                </div>

                {/* Max Capacity */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Max Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.max_capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_capacity: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Reorder Threshold */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Reorder Threshold (%) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.reorder_threshold_percentage || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorder_threshold_percentage:
                        parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  placeholder="25"
                />
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Alert when stock falls below this percentage
                </p>
              </div>

              {/* Stock Info Preview */}
              {formData.max_capacity > 0 && (
                <div
                  className={`p-4 rounded-lg border ${darkMode ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${textSecondary} mb-2`}
                  >
                    Preview
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${textPrimary}`}>
                      Stock Percentage:
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        parseFloat(calculateStockPercentage()) > 50
                          ? darkMode
                            ? "text-emerald-400"
                            : "text-emerald-600"
                          : parseFloat(calculateStockPercentage()) >
                              formData.reorder_threshold_percentage
                            ? darkMode
                              ? "text-amber-400"
                              : "text-amber-600"
                            : darkMode
                              ? "text-rose-400"
                              : "text-rose-600"
                      }`}
                    >
                      {calculateStockPercentage()}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-sm ${textPrimary}`}>Status:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        parseFloat(calculateStockPercentage()) >
                        formData.reorder_threshold_percentage
                          ? darkMode
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-100 text-emerald-700"
                          : darkMode
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {parseFloat(calculateStockPercentage()) >
                      formData.reorder_threshold_percentage
                        ? "OK"
                        : "LOW"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-4 border-t ${darkMode ? "border-slate-700" : "border-slate-200"} flex gap-3 justify-end`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  darkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Adding..." : "Add Material"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default function RawInventoryAI({ darkMode }: { darkMode: boolean }) {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchInventoryData();
    }
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      // Use API data if available, otherwise use mock data for demo
      if (Array.isArray(data) && data.length > 0) {
        const transformedData = data.map(transformApiDataToInventoryItem);
        setInventoryData(transformedData);
      } else {
        // Use mock data when API returns empty array
        setInventoryData(MOCK_INVENTORY);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      // Fallback to mock data on error
      setInventoryData(MOCK_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (sku: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) next.delete(sku);
      else next.add(sku);
      return next;
    });
  };

  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const theadBg = darkMode ? "bg-slate-900/60" : "bg-slate-50";
  const rowHover = darkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50/80";

  const lowCount = inventoryData.filter((i) => i.status === "Low").length;

  if (loading) {
    return (
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className={`mt-4 ${textPrimary}`}>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg">
            ▣
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>
              Raw Inventory
            </h1>
            <p className={`text-sm ${textSecondary}`}>
              {inventoryData.length} items · {lowCount} requiring AI action
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          + Add Item
        </button>
      </div>

      {/* AI Sourcing Alert */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl mb-6 border ${darkMode ? "bg-violet-500/10 border-violet-500/30" : "bg-violet-50 border-violet-200"}`}
      >
        <span className="relative inline-flex w-3 h-3 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full w-3 h-3 bg-violet-500" />
        </span>
        <p
          className={`text-sm ${darkMode ? "text-violet-300" : "text-violet-700"}`}
        >
          <span className="font-bold">AI Sourcing Agent active</span> —{" "}
          {lowCount} low-stock items detected. Click any{" "}
          <span className="font-semibold">AI Sourcing</span> badge to view the
          live email thread.
        </p>
      </div>

      {/* Table */}
      <div
        className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className={`${theadBg} border-b ${border}`}>
                {[
                  "Item",
                  "SKU",
                  "Stock",
                  "Unit",
                  "Reorder Level",
                  "AI Status",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-left text-xs font-bold uppercase tracking-wider ${textSecondary} whitespace-nowrap`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((row) => {
                const isExpanded = expandedRows.has(row.sku);
                const isLow = row.status === "Low";
                return (
                  <Fragment key={row.sku}>
                    <tr
                      className={`border-b ${border} last:border-b-0 transition-colors duration-150 ${
                        isLow ? `cursor-pointer ${rowHover}` : rowHover
                      } ${isExpanded ? (darkMode ? "bg-violet-900/20" : "bg-violet-50/60") : ""}`}
                      onClick={() => isLow && toggleRow(row.sku)}
                    >
                      <td
                        className={`px-5 py-4 text-sm font-semibold ${textPrimary} whitespace-nowrap`}
                      >
                        <div className="flex items-center gap-2">
                          {row.item}
                          {isLow && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-rose-500/20 text-rose-400" : "bg-rose-100 text-rose-600"}`}
                            >
                              LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap font-mono`}
                      >
                        {row.sku}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        {row.stock}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        {row.unit}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        {row.reorderLevel}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isLow ? (
                          <button
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 hover:scale-105 active:scale-95 ${
                              darkMode
                                ? "bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/30"
                                : "bg-violet-100 text-violet-700 border-violet-300 hover:bg-violet-200"
                            }`}
                          >
                            <span className="relative inline-flex w-2 h-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                              <span className="relative inline-flex rounded-full w-2 h-2 bg-violet-500" />
                            </span>
                            {row.aiStatus}
                            <span
                              className={`ml-0.5 ${darkMode ? "text-violet-400" : "text-violet-600"}`}
                            >
                              (Waiting on {row.aiVendors})
                            </span>
                            <span className="ml-1">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                              darkMode
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            OK
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Email Thread Row */}
                    {isLow && isExpanded && (
                      <tr className={`border-b ${border}`}>
                        <td colSpan={6} className="p-0">
                          <EmailThreadPanel sku={row.sku} darkMode={darkMode} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateInventoryModal
          darkMode={darkMode}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchInventoryData}
        />
      )}
    </div>
  );
}
