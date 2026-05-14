import { useState, useEffect, useRef } from "react";
import { getProducts, createProduct, getInventory } from "../services/api";
import type { Product, CreateProductPayload, Inventory } from "../services/api";

// Mock data for demo purposes
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Steel Component",
    sku: "SC-001",
    description: "High-quality steel component for industrial use",
    quantity_available: "150.00",
    quantity_reserved: "0.00",
    total_quantity: "150.00",
    unit_price: "125.50",
    total_value: "18825.00",
    raw_materials_used: [
      { id: 1, name: "Steel Coils", unit: "kg", quantity: 200.0 },
    ],
    manufacturing_date: "2026-02-20",
    expiry_date: null,
    warehouse_location: "Warehouse A, Rack 5",
    status: "READY",
    quality_check_status: "PASSED",
    quality_check_notes: "",
    batch_number: "BATCH-2026-001",
    supplier_batch_number: "",
    notes: "",
    created_at: "2026-02-21T19:00:41.365430Z",
    updated_at: "2026-02-21T19:00:41.365430Z",
  },
  {
    id: 2,
    name: "Aluminium Component",
    sku: "SC-002",
    description: "Lightweight aluminium component",
    quantity_available: "200.00",
    quantity_reserved: "50.00",
    total_quantity: "250.00",
    unit_price: "95.75",
    total_value: "23937.50",
    raw_materials_used: [{ id: 2, name: "Aluminium Sheet", unit: "kg" }],
    manufacturing_date: "2026-02-20",
    expiry_date: null,
    warehouse_location: "Warehouse B, Rack 3",
    status: "READY",
    quality_check_status: "PASSED",
    quality_check_notes: "",
    batch_number: "BATCH-2026-002",
    supplier_batch_number: "",
    notes: "",
    created_at: "2026-02-21T19:32:17.235595Z",
    updated_at: "2026-02-21T19:32:17.235595Z",
  },
  {
    id: 3,
    name: "Copper Wire Assembly",
    sku: "CW-101",
    description: "Premium copper wire assembly",
    quantity_available: "85.00",
    quantity_reserved: "15.00",
    total_quantity: "100.00",
    unit_price: "245.00",
    total_value: "24500.00",
    raw_materials_used: [{ id: 3, name: "Copper Wire", unit: "rolls" }],
    manufacturing_date: "2026-02-19",
    expiry_date: null,
    warehouse_location: "Warehouse A, Rack 12",
    status: "READY",
    quality_check_status: "PENDING",
    quality_check_notes: "",
    batch_number: "BATCH-2026-003",
    supplier_batch_number: "",
    notes: "Priority item for Order #4822",
    created_at: "2026-02-19T14:20:30.123456Z",
    updated_at: "2026-02-21T10:15:22.654321Z",
  },
  {
    id: 4,
    name: "Plastic Pellet Assembly",
    sku: "PP-201",
    description: "Industrial grade plastic assembly",
    quantity_available: "0.00",
    quantity_reserved: "120.00",
    total_quantity: "120.00",
    unit_price: "65.25",
    total_value: "7830.00",
    raw_materials_used: [{ id: 4, name: "Plastic Pellets", unit: "bags" }],
    manufacturing_date: "2026-02-18",
    expiry_date: null,
    warehouse_location: "Warehouse C, Rack 8",
    status: "RESERVED",
    quality_check_status: "PASSED",
    quality_check_notes: "",
    batch_number: "BATCH-2026-004",
    supplier_batch_number: "",
    notes: "Reserved for Order #4823",
    created_at: "2026-02-18T09:45:12.789012Z",
    updated_at: "2026-02-20T16:30:45.234567Z",
  },
];

// Mock raw materials for demo purposes
const MOCK_RAW_MATERIALS: Inventory[] = [
  {
    id: 1,
    name: "Steel Coils",
    current_stock: "500.00",
    max_capacity: "1000.00",
    reorder_threshold_percentage: "25.00",
    stock_percentage: 50.0,
    needs_reorder: false,
    created_at: "2026-02-21T13:28:25.963710Z",
    updated_at: "2026-02-21T13:28:25.963710Z",
  },
  {
    id: 2,
    name: "Aluminium Sheet",
    current_stock: "800.00",
    max_capacity: "1000.00",
    reorder_threshold_percentage: "25.00",
    stock_percentage: 80.0,
    needs_reorder: false,
    created_at: "2026-02-21T13:28:25.963710Z",
    updated_at: "2026-02-21T13:28:25.963710Z",
  },
  {
    id: 3,
    name: "Copper Wire",
    current_stock: "150.00",
    max_capacity: "500.00",
    reorder_threshold_percentage: "25.00",
    stock_percentage: 30.0,
    needs_reorder: false,
    created_at: "2026-02-21T13:28:25.963710Z",
    updated_at: "2026-02-21T13:28:25.963710Z",
  },
  {
    id: 4,
    name: "Plastic Pellets",
    current_stock: "100.00",
    max_capacity: "500.00",
    reorder_threshold_percentage: "25.00",
    stock_percentage: 20.0,
    needs_reorder: true,
    created_at: "2026-02-21T13:28:25.963710Z",
    updated_at: "2026-02-21T13:28:25.963710Z",
  },
  {
    id: 5,
    name: "Rubber Seals",
    current_stock: "450.00",
    max_capacity: "1000.00",
    reorder_threshold_percentage: "25.00",
    stock_percentage: 45.0,
    needs_reorder: false,
    created_at: "2026-02-21T13:28:25.963710Z",
    updated_at: "2026-02-21T13:28:25.963710Z",
  },
];

interface CreateProductModalProps {
  darkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rawMaterials: Inventory[];
}

function CreateProductModal({
  darkMode,
  onClose,
  onSuccess,
  rawMaterials,
}: CreateProductModalProps) {
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: "",
    sku: "",
    quantity_available: 0,
    unit_price: 0,
    raw_materials_used: [],
    manufacturing_date: new Date().toISOString().split("T")[0],
    description: "",
    warehouse_location: "",
    batch_number: "",
    notes: "",
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
      await createProduct(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const toggleRawMaterial = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      raw_materials_used: prev.raw_materials_used.includes(id)
        ? prev.raw_materials_used.filter((rmId) => rmId !== id)
        : [...prev.raw_materials_used, id],
    }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${cardBg} backdrop-blur-xl border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${darkMode ? "border-slate-700" : "border-slate-200"}`}
          >
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Create New Finished Product
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="e.g., Steel Component"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    SKU <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="e.g., SC-001"
                  />
                </div>

                {/* Quantity Available */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Quantity Available <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.quantity_available || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_available: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="150"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Unit Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.unit_price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="125.50"
                  />
                </div>

                {/* Manufacturing Date */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Manufacturing Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.manufacturing_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturing_date: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                </div>

                {/* Batch Number */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                  >
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) =>
                      setFormData({ ...formData, batch_number: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="BATCH-2026-001"
                  />
                </div>
              </div>

              {/* Warehouse Location */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Warehouse Location
                </label>
                <input
                  type="text"
                  value={formData.warehouse_location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      warehouse_location: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  placeholder="e.g., Warehouse A, Rack 5"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none`}
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              {/* Raw Materials Used */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Raw Materials Used <span className="text-rose-500">*</span>
                </label>
                <div
                  className={`border ${darkMode ? "border-slate-700" : "border-slate-300"} rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto scrollbar-thin`}
                >
                  {rawMaterials.length === 0 ? (
                    <div
                      className={`text-sm ${textSecondary} text-center py-2`}
                    >
                      <p>No raw materials available from inventory.</p>
                      <p className="text-xs mt-1">
                        Loading from /api/inventory/...
                      </p>
                    </div>
                  ) : (
                    rawMaterials.map((material) => {
                      const stockPercentage = material.stock_percentage || 0;
                      const isLowStock = material.needs_reorder;

                      return (
                        <label
                          key={material.id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            formData.raw_materials_used.includes(material.id)
                              ? darkMode
                                ? "bg-pink-500/20 border border-pink-500/40"
                                : "bg-pink-50 border border-pink-300"
                              : darkMode
                                ? "hover:bg-slate-700/50 border border-transparent"
                                : "hover:bg-slate-100 border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.raw_materials_used.includes(
                              material.id,
                            )}
                            onChange={() => toggleRawMaterial(material.id)}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span
                                className={`text-sm font-semibold ${textPrimary} truncate`}
                              >
                                {material.name}
                              </span>
                              {isLowStock && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    darkMode
                                      ? "bg-rose-500/20 text-rose-400"
                                      : "bg-rose-100 text-rose-600"
                                  }`}
                                >
                                  LOW
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className={textSecondary}>
                                Stock:{" "}
                                <span className="font-semibold">
                                  {material.current_stock}
                                </span>{" "}
                                / {material.max_capacity}
                              </span>
                              <span
                                className={`font-semibold ${
                                  stockPercentage > 50
                                    ? darkMode
                                      ? "text-emerald-400"
                                      : "text-emerald-600"
                                    : stockPercentage > 25
                                      ? darkMode
                                        ? "text-amber-400"
                                        : "text-amber-600"
                                      : darkMode
                                        ? "text-rose-400"
                                        : "text-rose-600"
                                }`}
                              >
                                {stockPercentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
                {formData.raw_materials_used.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    Please select at least one raw material
                  </p>
                )}
                {formData.raw_materials_used.length > 0 && (
                  <p
                    className={`text-xs ${darkMode ? "text-emerald-400" : "text-emerald-600"} mt-1`}
                  >
                    ✓ {formData.raw_materials_used.length} raw material
                    {formData.raw_materials_used.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${textPrimary}`}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border ${inputBg} focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none`}
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
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
                disabled={loading || formData.raw_materials_used.length === 0}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function FinishedProducts({ darkMode }: { darkMode: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, inventoryData] = await Promise.all([
        getProducts(),
        getInventory(),
      ]);
      // Use API data if available, otherwise use mock data for demo
      const finalProducts =
        Array.isArray(productsData) && productsData.length > 0
          ? productsData
          : MOCK_PRODUCTS;

      const finalInventory =
        Array.isArray(inventoryData) && inventoryData.length > 0
          ? inventoryData
          : MOCK_RAW_MATERIALS;

      setProducts(finalProducts);
      setRawMaterials(finalInventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      // Use mock data on error for demo purposes
      setProducts(MOCK_PRODUCTS);
      setRawMaterials(MOCK_RAW_MATERIALS);
    } finally {
      setLoading(false);
    }
  };

  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const theadBg = darkMode ? "bg-slate-900/60" : "bg-slate-50";
  const rowHover = darkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50/80";

  const statusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "READY")
      return darkMode
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "IN_PRODUCTION")
      return darkMode
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "RESERVED")
      return darkMode
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    return darkMode
      ? "bg-slate-700/50 text-slate-400 border-slate-600"
      : "bg-slate-100 text-slate-600 border-slate-200";
  };

  const qualityColor = (status: string) => {
    const s = status.toUpperCase();
    if (s === "PASSED")
      return darkMode
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "PENDING")
      return darkMode
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "FAILED")
      return darkMode
        ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
        : "bg-rose-50 text-rose-700 border-rose-200";
    return darkMode
      ? "bg-slate-700/50 text-slate-400 border-slate-600"
      : "bg-slate-100 text-slate-600 border-slate-200";
  };

  if (loading) {
    return (
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
          </div>
          <p className={`mt-4 ${textPrimary}`}>Loading finished products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-2xl shadow-lg">
              ◆
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>
                Finished Products
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                {Array.isArray(products) ? products.length : 0} products · Total
                Value: ₹
                {(Array.isArray(products)
                  ? products.reduce(
                      (sum, p) => sum + parseFloat(p.total_value || "0"),
                      0,
                    )
                  : 0
                ).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            + Create Product
          </button>
        </div>

        {error && (
          <div className="mb-6 px-5 py-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div
          className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}
        >
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className={`${theadBg} border-b ${border}`}>
                  {[
                    "Product Name",
                    "SKU",
                    "Qty Available",
                    "Unit Price",
                    "Total Value",
                    "Raw Materials",
                    "Status",
                    "Quality Check",
                    "Mfg Date",
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
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className={`px-5 py-8 text-center ${textSecondary}`}
                    >
                      No finished products found. Create your first product to
                      get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b ${border} last:border-b-0 ${rowHover} transition-colors duration-150`}
                    >
                      <td
                        className={`px-5 py-4 text-sm font-semibold ${textPrimary} whitespace-nowrap`}
                      >
                        {product.name}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap font-mono`}
                      >
                        {product.sku}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        {parseFloat(
                          product.quantity_available,
                        ).toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"} whitespace-nowrap`}
                      >
                        ₹{parseFloat(product.unit_price).toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-bold ${darkMode ? "text-emerald-400" : "text-emerald-700"} whitespace-nowrap`}
                      >
                        ₹{parseFloat(product.total_value).toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        <div className="flex flex-wrap gap-1">
                          {product.raw_materials_used.map((rm) => (
                            <span
                              key={rm.id}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                darkMode
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {rm.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor(product.status)}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${qualityColor(product.quality_check_status)}`}
                        >
                          {product.quality_check_status}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"} whitespace-nowrap`}
                      >
                        {new Date(
                          product.manufacturing_date,
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateProductModal
          darkMode={darkMode}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
          rawMaterials={rawMaterials}
        />
      )}
    </>
  );
}
