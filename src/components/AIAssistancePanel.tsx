import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import AgentBadge from "./AgentBadge";
import PulsingDot from "./PulsingDot";
import { INITIAL_MESSAGES, AGENT_FEED, STATS } from "../constants/aiAssistance";
import type { Message } from "../types";
import { executeGoal, getAgentPulse, type AgentActivity } from "../services/api";

interface AIAssistancePanelProps {
  darkMode: boolean;
  setApprovalModalOpen: (open: boolean) => void;
}

export default function AIAssistancePanel({
  darkMode,
  setApprovalModalOpen,
}: AIAssistancePanelProps): React.JSX.Element {
  // Load persisted messages from sessionStorage on mount
  const loadPersistedMessages = (): Message[] => {
    try {
      const stored = sessionStorage.getItem('ai-chat-messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MESSAGES;
      }
    } catch (error) {
      console.error('Failed to load persisted messages:', error);
    }
    return INITIAL_MESSAGES;
  };

  const [messages, setMessages] = useState<Message[]>(loadPersistedMessages());
  const [visibleMessages, setVisibleMessages] = useState(new Set<number>());
  const [inputVal, setInputVal] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<number>(0);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const thinkingMessages = [
    "🤔 Analyzing your request...",
    "🔍 Consulting autonomous agents...",
    "⚙️ Processing supply chain data...",
    "📊 Gathering insights from inventory...",
    "🤖 Coordinating with procurement crew...",
    "� Synchronizing agent workflows...",
    "🧠 Running strategic analysis...",
    "📈 Evaluating vendor metrics...",
    "🎯 Optimizing recommendations...",
    "🔎 Cross-referencing historical data...",
    "💼 Consulting business context...",
    "📋 Preparing actionable insights...",
    "🚀 Compiling crew decisions...",
    "💡 Generating strategic recommendations...",
    "✨ Finalizing response...",
    "⏳ Almost there...",
    "🎨 Polishing the details...",
    "📝 Drafting comprehensive solution...",
    "🔧 Fine-tuning recommendations...",
    "🌟 Wrapping up analysis...",
  ];

  const cardBg = darkMode
    ? "bg-slate-800/50 border-slate-700"
    : "bg-white border-slate-200";
  const border = darkMode ? "border-slate-700" : "border-slate-200";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const iconBtn = darkMode
    ? "text-slate-300 hover:bg-slate-800 hover:text-white"
    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

  useEffect(() => {
    INITIAL_MESSAGES.forEach((msg, i) => {
      setTimeout(
        () => setVisibleMessages((prev) => new Set([...prev, msg.id])),
        i * 300,
      );
    });
    // Make all loaded messages visible immediately
    messages.forEach((msg) => {
      setVisibleMessages((prev) => new Set([...prev, msg.id]));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('ai-chat-messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to persist messages:', error);
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cycle through thinking messages while AI is processing
  useEffect(() => {
    if (isTyping) {
      setLoadingStage(0);
      const interval = setInterval(() => {
        setLoadingStage((prev) => (prev + 1) % thinkingMessages.length);
      }, 3000); // Change message every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isTyping, thinkingMessages.length]);

  useEffect(() => {
    const fetchAgentPulse = async () => {
      try {
        const response = await getAgentPulse();
        if (response.success && Array.isArray(response.activities)) {
          setAgentActivities(response.activities.slice(0, 10)); // Show last 10 activities
        }
      } catch (error) {
        console.error("Failed to fetch agent pulse:", error);
        // Fallback to mock data on error
        setAgentActivities([]);
      }
    };

    fetchAgentPulse();
    // Refresh every second
    const interval = setInterval(fetchAgentPulse, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (): Promise<void> => {
    if (!inputVal.trim()) return;

    const userGoal = inputVal.trim();
    const userMsg: Message = {
      id: Date.now(),
      type: "user",
      content: userGoal,
      ts: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setVisibleMessages((prev) => new Set([...prev, userMsg.id]));
    setInputVal("");
    setIsTyping(true);
    setLoadingStage(0);

    try {
      // Call the AI execute goal API
      const response = await executeGoal({ goal: userGoal });

      const aiResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content:
          response.explanation ||
          response.message ||
          response.result ||
          "Goal executed successfully!",
        ts: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setVisibleMessages((prev) => new Set([...prev, aiResponse.id]));
    } catch (error) {
      let errorMessage = "I'm analyzing your request across all autonomous crews. This might take a moment...";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      const errorResponse: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: errorMessage,
        ts: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, errorResponse]);
      setVisibleMessages((prev) => new Set([...prev, errorResponse.id]));
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputVal(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        setInputVal(question);
        // Trigger send
        setTimeout(() => {
          const event = new KeyboardEvent('keydown', { key: 'Enter' });
          input.dispatchEvent(event);
        }, 100);
      }
    }, 100);
  };

  const quickQuestions = [
    "Check inventory levels for Raw Steel",
    "Analyze vendor performance",
    "Show pending purchase orders",
    "Review quality control issues",
  ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        gap: "1.25rem",
        padding: "1.25rem",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* Chat panel */}
      <div
        className={`${cardBg} backdrop-blur-xl border rounded-2xl xl:rounded-3xl shadow-2xl`}
        style={{
          flex: "1 1 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <div
          className={`px-5 lg:px-6 py-4 border-b ${border} flex items-center justify-between`}
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">
              ✦
            </div>
            <div>
              <p className={`text-base lg:text-lg font-bold ${textPrimary}`}>
                Autonomous Business Assistant
              </p>
              <div className="flex items-center gap-2 mt-1">
                <PulsingDot
                  color={darkMode ? "bg-emerald-400" : "bg-emerald-500"}
                />
                <span
                  className={`text-xs font-medium ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  Connected · 3 CrewAI Agents
                </span>
              </div>
            </div>
          </div>
          <button
            className={`p-2.5 rounded-xl ${iconBtn} transition-all duration-200 hover:scale-110 active:scale-95`}
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
                d="M12 5v.01M12 12v.01M12 19v.01"
              />
            </svg>
          </button>
        </div>

        <div
          className={`scrollbar-thin ${darkMode ? "bg-slate-900/30" : "bg-slate-50/50"}`}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            minHeight: 0,
          }}
        >
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              msg={msg}
              visible={visibleMessages.has(msg.id)}
              darkMode={darkMode}
            />
          ))}
          {isTyping && (
            <div className="flex items-center gap-3 fade-slide-up">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-xl shadow-purple-500/30 animate-pulse">
                ✦
              </div>
              <div
                className={`${darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"} border backdrop-blur-xl rounded-2xl rounded-tl-md px-5 py-3.5 shadow-xl`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`typing-dot w-2.5 h-2.5 rounded-full ${darkMode ? "bg-violet-400" : "bg-violet-500"}`}
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"} transition-all duration-500`}>
                    {thinkingMessages[loadingStage]}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div
          className={`border-t ${border} ${darkMode ? "bg-slate-800/50" : "bg-white"}`}
          style={{ flexShrink: 0, padding: "0.875rem 1.25rem 1rem" }}
        >
          {/* Quick Questions */}
          <div className="mb-3 overflow-x-auto scrollbar-thin">
            <div className="flex gap-2 pb-2">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isTyping}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "bg-violet-500/10 text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-500/50"
                      : "bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:border-violet-300"
                  }`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`flex items-center gap-3 ${darkMode ? "bg-slate-900/50 border-slate-700 focus-within:border-violet-500" : "bg-slate-50 border-slate-300 focus-within:border-violet-400"} border rounded-xl px-4 py-3 focus-within:ring-4 focus-within:ring-violet-500/20 transition-all duration-300 shadow-lg`}
          >
            <span
              className={`text-xl ${darkMode ? "text-slate-500" : "text-slate-400"} shrink-0`}
            >
              ✦
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
              placeholder="Ask agents to check stock, draft POs, analyze vendors..."
              className={`flex-1 bg-transparent text-base ${darkMode ? "text-white placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"} outline-none`}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputVal.trim() || isTyping}
              className="shrink-0 w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  strokeWidth={2.5}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <p className={`text-center text-xs ${textSecondary} mt-2`}>
            AI agents may make errors. Always verify critical supply chain
            decisions.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="scrollbar-thin"
        style={{
          width: "22rem",
          flexShrink: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minHeight: 0,
        }}
      >
        {STATS.map((s, idx) => (
          <div
            key={s.label}
            className={`${cardBg} backdrop-blur-xl border rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer fade-slide-up`}
            style={{ animationDelay: `${idx * 0.1}s`, flexShrink: 0 }}
          >
            <p
              className={`text-xs font-bold ${textSecondary} uppercase tracking-wider mb-2`}
            >
              {s.label}
            </p>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${textPrimary}`}>{s.value}</p>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.up === true ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : s.up === false ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-slate-500/20 text-slate-500 border border-slate-400/30"}`}
              >
                {s.delta}
              </span>
            </div>
          </div>
        ))}

        <div
          className={`${cardBg} backdrop-blur-xl border rounded-xl p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300`}
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center justify-between mb-5">
            <p
              className={`text-sm font-bold ${textPrimary} uppercase tracking-wider`}
            >
              Live Agent Pulse
            </p>
            <PulsingDot
              color={darkMode ? "bg-emerald-400" : "bg-emerald-500"}
            />
          </div>
          <div className="relative space-y-5">
            <div
              className={`absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b ${darkMode ? "from-emerald-500/30 via-slate-700 to-transparent" : "from-emerald-300 via-slate-200 to-transparent"}`}
            />
            {agentActivities.length > 0 ? (
              agentActivities.map((activity, i) => (
                <div
                  key={activity.id}
                  className="relative pl-12 fade-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="absolute left-0 top-0.5">
                    <AgentBadge
                      code={activity.agent_abbreviation}
                      active={activity.status === "COMPLETED"}
                      darkMode={darkMode}
                    />
                  </div>
                  <p className={`text-xs ${textSecondary} font-medium mb-1`}>
                    {activity.time_ago}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"} leading-relaxed`}
                  >
                    {activity.description}
                  </p>
                  {activity.duration && (
                    <p className={`text-xs ${textSecondary} mt-1`}>
                      Duration: {activity.duration.toFixed(1)}s
                    </p>
                  )}
                </div>
              ))
            ) : (
              AGENT_FEED.map((item, i) => (
                <div
                  key={item.id}
                  className="relative pl-12 fade-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="absolute left-0 top-0.5">
                    <AgentBadge
                      code={item.agent}
                      active={item.status === "active"}
                      darkMode={darkMode}
                    />
                  </div>
                  <p className={`text-xs ${textSecondary} font-medium mb-1`}>
                    {item.time}
                  </p>
                  <p
                    className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"} leading-relaxed`}
                  >
                    {item.msg}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-xl p-5 shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow duration-300"
          style={{ flexShrink: 0 }}
        >
          <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-2">
            Pending Approvals
          </p>
          <p className="text-5xl font-bold text-white mb-5">2</p>
          <div className="space-y-3 mb-5">
            {[
              "PO #4821 · Vendor A · $12,400",
              "PO #4822 · Vendor B · $8,700",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-sm text-violet-100"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-lg shadow-amber-400/50 animate-pulse" />
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={() => setApprovalModalOpen(true)}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold py-3 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
          >
            Review Actions →
          </button>
        </div>
      </div>
    </div>
  );
}
