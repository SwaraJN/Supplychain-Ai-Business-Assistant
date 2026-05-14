import type { Message, AgentFeedItem, Stat } from "../types";

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    type: "user",
    content:
      "Check inventory for Raw Steel and draft inquiries for the top 3 vendors if we are below 25%.",
    ts: "9:41 AM",
  },
  {
    id: 2,
    type: "ai",
    content:
      "Inventory scan complete. **Raw Steel is currently at 22%** — below your 25% threshold.\n\nThe Procurement Crew has drafted RFQs for your top 3 vendors based on past delivery performance and current pricing. Ready to dispatch.",
    ts: "9:41 AM",
    action: {
      label: "Drafts Ready",
      description: "3 RFQs · Vendors A, B & C",
      buttonText: "Send All",
      meta: "Avg. lead time: 4 days",
    },
  },
];

export const AGENT_FEED: AgentFeedItem[] = [
  {
    id: 1,
    time: "Just now",
    msg: "Inventory Agent scanning Raw Steel stock levels.",
    status: "active",
    agent: "INV",
  },
  {
    id: 2,
    time: "2 min ago",
    msg: "Procurement Crew drafted 3 vendor RFQs.",
    status: "done",
    agent: "PRO",
  },
  {
    id: 3,
    time: "10 min ago",
    msg: "Email Analyzer processed Vendor A quote response.",
    status: "done",
    agent: "EML",
  },
  {
    id: 4,
    time: "25 min ago",
    msg: "Logistics Agent verified optimal shipment routes.",
    status: "done",
    agent: "LOG",
  },
  {
    id: 5,
    time: "1 hr ago",
    msg: "Finance Agent updated PO budget forecast.",
    status: "done",
    agent: "FIN",
  },
];

export const STATS: Stat[] = [
  { label: "Open POs", value: "14", delta: "+2", up: true },
  { label: "Vendors Active", value: "38", delta: "stable", up: null },
  { label: "Alerts", value: "3", delta: "critical", up: false },
];
