import React, { useState, useEffect, useRef } from "react";
import { MODULE_CONTENT } from "../constants/navigation";
import type { ModuleContent, ModuleField } from "../types";
import { getCompanies, getInventory } from "../services/api";
import type { Company, Inventory } from "../services/api";

interface ModulePageProps {
  tabName: string;
  darkMode: boolean;
}

export default function ModulePage({
  tabName,
  darkMode,
}: ModulePageProps): React.JSX.Element {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if ((tabName === "Company Info" || tabName === "Raw Inventory") && !hasFetched.current) {
      hasFetched.current = true;
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          if (tabName === "Company Info") {
            const data = await getCompanies();
            setCompanies(data);
          } else if (tabName === "Raw Inventory") {
            const data = await getInventory();
            setInventory(data);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : `Failed to load ${tabName.toLowerCase()}`);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else if (tabName !== "Company Info" && tabName !== "Raw Inventory") {
      hasFetched.current = false;
    }
  }, [tabName]);

  const mod = MODULE_CONTENT[tabName] as ModuleContent | undefined;
  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const theadBg = darkMode ? "bg-slate-900/60" : "bg-slate-50";
  const rowHover = darkMode ? "hover:bg-slate-700/40" : "hover:bg-slate-50";

  if (!mod) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center fade-slide-up">
          <div
            className={`w-20 h-20 ${darkMode ? "bg-slate-800" : "bg-slate-100"} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl hover:scale-110 transition-transform duration-300`}
          >
            🛠
          </div>
          <h2 className={`text-2xl font-bold ${textPrimary} mb-3`}>
            {tabName}
          </h2>
          <p className={`${textSecondary} text-base`}>
            This module is under construction. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  const statusColor = (status: string): string => {
    const s = (status || "").toLowerCase();
    if (
      ["ok", "active", "delivered", "preferred", "done", "confirmed"].some(
        (k) => s.includes(k),
      )
    )
      return darkMode
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (["low", "behind", "pending", "review"].some((k) => s.includes(k)))
      return darkMode
        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
        : "bg-amber-50 text-amber-700 border-amber-200";
    if (
      [
        "processing",
        "in transit",
        "loaded",
        "on track",
        "dispatched",
        "scheduled",
      ].some((k) => s.includes(k))
    )
      return darkMode
        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
        : "bg-blue-50 text-blue-700 border-blue-200";
    return darkMode
      ? "bg-slate-700/50 text-slate-400 border-slate-600"
      : "bg-slate-100 text-slate-600 border-slate-200";
  };

  // Company Info — card layout
  if (tabName === "Company Info") {
    if (loading) {
      return (
        <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className={`mt-4 ${textPrimary}`}>Loading company information...</p>
          </div>
        </div>
      );
    }

    if (error) {
      const handleRetry = () => {
        hasFetched.current = false;
        setError(null);
        setLoading(true);
        const fetchCompanies = async () => {
          try {
            const data = await getCompanies();
            setCompanies(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load company info");
          } finally {
            setLoading(false);
          }
        };
        fetchCompanies();
      };

      return (
        <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
          <div className={`p-6 rounded-2xl ${darkMode ? "bg-red-900/30 border border-red-700" : "bg-red-50 border border-red-200"}`}>
            <p className={`${darkMode ? "text-red-400" : "text-red-600"} font-semibold`}>Error: {error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!companies || companies.length === 0) {
      return (
        <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up flex items-center justify-center">
          <div className="text-center">
            <p className={`${textSecondary} text-lg`}>No companies found</p>
          </div>
        </div>
      );
    }

    // Display first company from API
    const company = companies[0];
    const fields: ModuleField[] = [
      { label: "Company Name", value: company.name },
      { label: "Location", value: company.location },
      { label: "Business Type", value: company.business_type },
      { label: "Address", value: company.address },
      { label: "Status", value: company.is_active ? "Active" : "Inactive" },
      { label: "Description", value: company.business_description },
    ];

    return (
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod?.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
          >
            {mod?.icon}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{tabName}</h1>
            <p className={`text-sm ${textSecondary}`}>
              Organization details & registration info
            </p>
          </div>
        </div>
        <div
          className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}
        >
          <div
            className={`px-6 py-4 border-b ${border} bg-gradient-to-r ${mod?.gradient}`}
          >
            <p className="text-white font-semibold text-sm uppercase tracking-wider">
              Company Profile
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {fields.map((f: ModuleField, i: number) => (
              <div
                key={f.label}
                className={`px-6 py-5 border-b ${border} ${i % 2 === 0 ? `sm:border-r ${border}` : ""} ${rowHover} transition-colors`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-1.5`}
                >
                  {f.label}
                </p>
                <p className={`text-base font-semibold ${textPrimary}`}>
                  {f.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Raw Inventory — table layout
  if (tabName === "Raw Inventory") {
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

    if (error) {
      const handleRetry = () => {
        hasFetched.current = false;
        setError(null);
        setLoading(true);
        const fetchData = async () => {
          try {
            const data = await getInventory();
            setInventory(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load inventory");
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      };

      return (
        <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
          <div className={`p-6 rounded-2xl ${darkMode ? "bg-red-900/30 border border-red-700" : "bg-red-50 border border-red-200"}`}>
            <p className={`${darkMode ? "text-red-400" : "text-red-600"} font-semibold`}>Error: {error}</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!inventory || inventory.length === 0) {
      return (
        <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up flex items-center justify-center">
          <div className="text-center">
            <p className={`${textSecondary} text-lg`}>No inventory items found</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full p-4 lg:p-6 xl:p-8 fade-slide-up">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod?.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
            >
              {mod?.icon}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>{tabName}</h1>
              <p className={`text-sm ${textSecondary}`}>
                {inventory.length} items
              </p>
            </div>
          </div>
          <button
            className={`bg-gradient-to-r ${mod?.gradient} text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}
          >
            + Add New
          </button>
        </div>
        <div
          className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theadBg}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Item Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Current Stock
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Max Capacity
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Stock %
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Threshold %
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className={`border-b ${border} ${rowHover} transition-colors`}>
                    <td className={`px-6 py-4 text-sm font-semibold ${textPrimary}`}>
                      {item.name}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>
                      {item.current_stock}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>
                      {item.max_capacity}
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                            style={{ width: `${item.stock_percentage}%` }}
                          />
                        </div>
                        <span>{item.stock_percentage}%</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-medium ${textPrimary}`}>
                      {item.reorder_threshold_percentage}%
                    </td>
                    <td className={`px-6 py-4 text-sm`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(item.needs_reorder ? "Needs Reorder" : "OK")}`}>
                        {item.needs_reorder ? "Needs Reorder" : "OK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}
          >
            {mod.icon}
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{tabName}</h1>
            <p className={`text-sm ${textSecondary}`}>
              {mod.tableRows?.length} records
            </p>
          </div>
        </div>
        <button
          className={`bg-gradient-to-r ${mod.gradient} text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95`}
        >
          + Add New
        </button>
      </div>
      <div
        className={`w-full ${cardBg} border rounded-2xl shadow-xl overflow-hidden`}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-max border-collapse">
            <thead>
              <tr className={`${theadBg} border-b ${border}`}>
                {mod.tableHeaders?.map((h: string) => (
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
              {mod.tableRows?.map((row: string[], ri: number) => (
                <tr
                  key={ri}
                  className={`border-b ${border} last:border-b-0 ${rowHover} transition-colors duration-150`}
                >
                  {row.map((cell: string, ci: number) => {
                    const isStatus = ci === row.length - 1;
                    return (
                      <td
                        key={ci}
                        className={`px-5 py-4 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"} whitespace-nowrap ${ci === 0 ? `font-semibold ${textPrimary}` : ""}`}
                      >
                        {isStatus ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusColor(cell)}`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
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
