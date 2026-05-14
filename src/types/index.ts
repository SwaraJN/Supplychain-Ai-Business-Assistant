/**
 * Core TypeScript interfaces and types for the SCM Dashboard
 */

export interface Notification {
  id: number;
  read: boolean;
  pinned: boolean;
  type: NotificationType;
  icon: string;
  title: string;
  body: string;
  module: string;
  ts: string;
  tsRaw: number;
  actions: string[];
}

export type NotificationType =
  | "critical"
  | "ai"
  | "order"
  | "logistics"
  | "vendor"
  | "finance"
  | "system";

export interface NotificationTypeConfig {
  bg: string;
  border: string;
  badge: string;
  label: string;
  labelColor: string;
}

export interface NavItem {
  name: string;
  icon: string;
  gradient: string;
}

export interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  ts: string;
  action?: MessageAction;
}

export interface MessageAction {
  label: string;
  description: string;
  buttonText: string;
  meta: string;
}

export interface AgentFeedItem {
  id: number;
  time: string;
  msg: string;
  status: "active" | "done";
  agent: string;
}

export interface Stat {
  label: string;
  value: string;
  delta: string;
  up: boolean | null;
}

export interface ModuleContent {
  icon: string;
  gradient: string;
  fields?: ModuleField[];
  tableHeaders?: string[];
  tableRows?: string[][];
}

export interface ModuleField {
  label: string;
  value: string;
}

export interface ModuleContentMap {
  [key: string]: ModuleContent;
}
