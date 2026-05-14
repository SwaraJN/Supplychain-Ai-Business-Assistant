interface EmailSegment {
  text: string;
  highlight?: "blue" | "amber" | "emerald" | "purple";
}

interface JsonHighlight {
  [key: string]: "blue" | "amber" | "emerald" | "purple";
}

interface EmailRecord {
  orderId: string;
  customer: string;
  confidence: number;
  fieldsExtracted: number;
  emailMeta: { from: string; to: string; date: string; subject: string };
  emailSegments: EmailSegment[];
  parsedJson: Record<string, unknown>;
  jsonHighlights: JsonHighlight;
}

const EMAIL_DATA: Record<string, EmailRecord> = {
  "#ORD-4821": {
    orderId: "#ORD-4821",
    customer: "TechBuild Co.",
    confidence: 0.98,
    fieldsExtracted: 12,
    emailMeta: {
      from: "procurement@techbuild.co",
      to: "orders@acmecorp.in",
      date: "Tue, 18 Feb 2025  10:15:22 +0530",
      subject: "Purchase Order — Widget Pro X1 × 50",
    },
    emailSegments: [
      { text: "Dear AcmeCorp Team,\n\nPlease process the following purchase order:\n\nProduct: " },
      { text: "Widget Pro X1", highlight: "blue" },
      { text: "\nPart No.: FP-001\nQuantity: " },
      { text: "50 units", highlight: "amber" },
      { text: "\nUnit Price: ₹2,480 per unit\nTotal Order Value: " },
      { text: "₹1,24,000", highlight: "emerald" },
      { text: "\n\nDelivery: Please dispatch by " },
      { text: "22nd February 2025", highlight: "purple" },
      { text: "\nShip To: TechBuild Distribution Centre,\nPlot 14, Andheri East, Mumbai - 400069.\n\nKindly acknowledge receipt of this order.\n\nRegards,\nAmit Verma\nProcurement Lead, TechBuild Co.\nPh: +91-9876543210" },
    ],
    parsedJson: {
      order_id: "#ORD-4821",
      customer: "TechBuild Co.",
      contact_name: "Amit Verma",
      contact_email: "procurement@techbuild.co",
      product: "Widget Pro X1",
      part_number: "FP-001",
      quantity: 50,
      unit_price: 2480,
      currency: "INR",
      total_value: 124000,
      expected_dispatch: "2025-02-22",
      delivery_address: "Plot 14, Andheri East, Mumbai",
    },
    jsonHighlights: {
      product: "blue",
      quantity: "amber",
      total_value: "emerald",
      expected_dispatch: "purple",
    },
  },
  "#ORD-4822": {
    orderId: "#ORD-4822",
    customer: "InfraCorp",
    confidence: 0.96,
    fieldsExtracted: 11,
    emailMeta: {
      from: "vendor@infracorp.in",
      to: "orders@acmecorp.in",
      date: "Wed, 19 Feb 2025  14:23:07 +0530",
      subject: "Order Confirmation — Steel Frame B2 × 100",
    },
    emailSegments: [
      { text: "Dear AcmeCorp Team,\n\nThis confirms our purchase order as discussed:\n\nProduct: " },
      { text: "Steel Frame B2", highlight: "blue" },
      { text: "\nPart No.: FP-033\nQuantity: " },
      { text: "100 units", highlight: "amber" },
      { text: "\nUnit Price: ₹2,100 per unit\nTotal Value: " },
      { text: "₹2,10,000", highlight: "emerald" },
      { text: "\n\nExpected Delivery: By " },
      { text: "22nd February 2025", highlight: "purple" },
      { text: "\n\nDelivery Address:\nInfraCorp Logistics Hub\nSector 18, Noida, UP - 201301\n\nKindly acknowledge and share dispatch schedule.\n\nRegards,\nPriya Sharma\nProcurement Head, InfraCorp Ltd.\nPh: +91-9876543210" },
    ],
    parsedJson: {
      order_id: "#ORD-4822",
      customer: "InfraCorp",
      contact_name: "Priya Sharma",
      contact_email: "vendor@infracorp.in",
      product: "Steel Frame B2",
      part_number: "FP-033",
      quantity: 100,
      unit_price: 2100,
      currency: "INR",
      total_value: 210000,
      expected_delivery: "2025-02-22",
      delivery_address: "InfraCorp Logistics Hub, Sector 18, Noida",
    },
    jsonHighlights: {
      product: "blue",
      quantity: "amber",
      total_value: "emerald",
      expected_delivery: "purple",
    },
  },
  "#ORD-4823": {
    orderId: "#ORD-4823",
    customer: "Nova Systems",
    confidence: 0.94,
    fieldsExtracted: 10,
    emailMeta: {
      from: "ops@novasystems.in",
      to: "orders@acmecorp.in",
      date: "Thu, 20 Feb 2025  09:00:00 +0530",
      subject: "PO Request — Connector Unit A × 200",
    },
    emailSegments: [
      { text: "Hi Team,\n\nWe'd like to place an order for:\n\nItem: " },
      { text: "Connector Unit A", highlight: "blue" },
      { text: "\nQty Needed: " },
      { text: "200 pcs", highlight: "amber" },
      { text: "\nBudget Approved: " },
      { text: "₹87,000", highlight: "emerald" },
      { text: "\n\nDelivery Deadline: " },
      { text: "25th February 2025", highlight: "purple" },
      { text: "\n\nShipping: Nova Systems, T-Block, Whitefield, Bengaluru.\n\nPlease confirm availability.\n\nThanks,\nRohan Mehta\nOps Manager" },
    ],
    parsedJson: {
      order_id: "#ORD-4823",
      customer: "Nova Systems",
      contact_name: "Rohan Mehta",
      contact_email: "ops@novasystems.in",
      product: "Connector Unit A",
      part_number: "FP-012",
      quantity: 200,
      unit_price: 435,
      currency: "INR",
      total_value: 87000,
      delivery_deadline: "2025-02-25",
      delivery_address: "T-Block, Whitefield, Bengaluru",
    },
    jsonHighlights: {
      product: "blue",
      quantity: "amber",
      total_value: "emerald",
      delivery_deadline: "purple",
    },
  },
};

const HIGHLIGHT_ROW_BG: Record<string, string> = {
  blue: "bg-blue-400/12",
  amber: "bg-amber-400/12",
  emerald: "bg-emerald-400/12",
  purple: "bg-purple-400/12",
};
const HIGHLIGHT_TEXT_BG: Record<string, string> = {
  blue: "bg-blue-400/25",
  amber: "bg-amber-400/25",
  emerald: "bg-emerald-400/25",
  purple: "bg-purple-400/25",
};
const HIGHLIGHT_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
};
const HIGHLIGHT_LABEL: Record<string, string> = {
  blue: "Product",
  amber: "Quantity",
  emerald: "Value",
  purple: "Date",
};

function JsonRenderer({
  data, highlights, darkMode,
}: {
  data: Record<string, unknown>; highlights: JsonHighlight; darkMode: boolean;
}) {
  const textSecondary = darkMode ? "text-slate-500" : "text-slate-400";
  const keyColor = darkMode ? "text-rose-400" : "text-rose-600";
  const entries = Object.entries(data);

  const valueDisplay = (val: unknown) => {
    if (typeof val === "string") return `"${val}"`;
    return String(val);
  };
  const valueClass = (val: unknown) => {
    if (typeof val === "string") return darkMode ? "text-emerald-400" : "text-emerald-600";
    if (typeof val === "number") return darkMode ? "text-blue-400" : "text-blue-600";
    return darkMode ? "text-orange-400" : "text-orange-600";
  };

  return (
    <div className="font-mono text-xs leading-relaxed">
      <div className={`${textSecondary} mb-1`}>{"{"}</div>
      {entries.map(([key, val], i) => {
        const hl = highlights[key];
        const rowBg = hl ? HIGHLIGHT_ROW_BG[hl] : "";
        const valBg = hl ? `${HIGHLIGHT_TEXT_BG[hl]} rounded px-1` : "";
        const dot = hl ? (
          <span className={`inline-block w-2 h-2 rounded-full ${HIGHLIGHT_DOT[hl]} mr-1.5 shrink-0 align-middle`} />
        ) : null;
        return (
          <div key={key} className={`flex items-baseline gap-1 py-0.5 px-1.5 rounded ${rowBg}`}>
            {dot}
            <span className={keyColor}>"{key}"</span>
            <span className={textSecondary}>:</span>
            <span className={`${valueClass(val)} ${valBg}`}>{valueDisplay(val)}</span>
            {i < entries.length - 1 && <span className={textSecondary}>,</span>}
          </div>
        );
      })}
      <div className={`${textSecondary} mt-1`}>{"}"}</div>
    </div>
  );
}

interface Props {
  orderId: string;
  darkMode: boolean;
  onClose: () => void;
}

export default function EmailExtractionModal({ orderId, darkMode, onClose }: Props) {
  const data = EMAIL_DATA[orderId];
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const cardBg = darkMode ? "bg-slate-900" : "bg-white";
  const panelBg = darkMode ? "bg-slate-800/80" : "bg-slate-50";

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${cardBg} border ${border} rounded-2xl shadow-2xl w-full flex flex-col fade-slide-up`}
        style={{ maxWidth: "960px", maxHeight: "90vh" }}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${border} shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg shadow-lg">
              📧
            </div>
            <div>
              <p className={`text-base font-bold ${textPrimary}`}>Email Extraction Transparency</p>
              <p className={`text-xs ${textSecondary}`}>
                Order {orderId} · Email Analyzer Agent · Confidence:{" "}
                <span className="font-bold text-emerald-500">{(data.confidence * 100).toFixed(0)}%</span>
                {" "}· {data.fieldsExtracted} fields extracted
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
              darkMode ? "text-slate-400 hover:bg-slate-700 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap items-center gap-3 px-6 py-3 border-b ${border} shrink-0 ${darkMode ? "bg-slate-800/40" : "bg-slate-50/80"}`}>
          <span className={`text-xs font-bold ${textSecondary} uppercase tracking-wider mr-2`}>Highlights:</span>
          {(["blue", "amber", "emerald", "purple"] as const).map((color) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${HIGHLIGHT_DOT[color]} shrink-0`} />
              <span className={`text-xs font-medium ${textSecondary}`}>{HIGHLIGHT_LABEL[color]}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative inline-flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            <span className={`text-xs font-semibold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>
              AI Processed
            </span>
          </div>
        </div>

        {/* Body — two panels */}
        <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">
          {/* Left: Raw Email */}
          <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden" style={{ borderColor: darkMode ? "rgb(51,65,85)" : "rgb(226,232,240)" }}>
            <div className={`px-5 py-2.5 border-b ${border} shrink-0 ${panelBg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>📬 Raw Email</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {/* Email metadata */}
              <div className={`text-xs font-mono mb-4 space-y-1 pb-3 border-b ${border}`}>
                {Object.entries(data.emailMeta).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className={`font-bold capitalize w-16 shrink-0 ${textSecondary}`}>{k}:</span>
                    <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Email body with highlights */}
              <div className={`font-mono text-xs leading-relaxed whitespace-pre-wrap ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                {data.emailSegments.map((seg, i) =>
                  seg.highlight ? (
                    <span
                      key={i}
                      className={`font-bold rounded px-0.5 ${HIGHLIGHT_TEXT_BG[seg.highlight]} ${
                        seg.highlight === "blue" ? (darkMode ? "text-blue-300" : "text-blue-700")
                        : seg.highlight === "amber" ? (darkMode ? "text-amber-300" : "text-amber-700")
                        : seg.highlight === "emerald" ? (darkMode ? "text-emerald-300" : "text-emerald-700")
                        : (darkMode ? "text-purple-300" : "text-purple-700")
                      }`}
                    >
                      {seg.text}
                    </span>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right: Parsed JSON */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className={`px-5 py-2.5 border-b ${border} shrink-0 ${panelBg}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>🧠 Structured JSON Output</p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <JsonRenderer data={data.parsedJson} highlights={data.jsonHighlights} darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
