import React from "react";
import type { Message } from "../types";

interface ChatMessageProps {
  msg: Message;
  visible: boolean;
  darkMode: boolean;
}

export default function ChatMessage({
  msg,
  visible,
  darkMode,
}: ChatMessageProps): React.JSX.Element {
  const isUser = msg.type === "user";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold mr-3 mt-1 shrink-0 shadow-xl shadow-purple-500/30 hover:scale-105 transition-transform duration-300">
          ✦
        </div>
      )}
      <div className={`${isUser ? "max-w-[75%]" : "max-w-[85%]"}`}>
        {isUser ? (
          <div
            className={`${darkMode ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white" : "bg-gradient-to-br from-slate-800 to-slate-900 text-white"} px-5 py-3.5 rounded-2xl rounded-tr-md text-base leading-relaxed shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5`}
          >
            {msg.content}
          </div>
        ) : (
          <div
            className={`${darkMode ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200"} border backdrop-blur-xl rounded-2xl rounded-tl-md overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="px-6 py-4">
              <p
                className={`text-base ${darkMode ? "text-slate-200" : "text-slate-700"} leading-relaxed`}
                dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      `<strong class="${darkMode ? "text-white" : "text-slate-900"} font-semibold">$1</strong>`,
                    )
                    .replace(/\n/g, "<br/>"),
                }}
              />
            </div>
            {msg.action && (
              <div
                className={`border-t ${darkMode ? "border-slate-700 bg-gradient-to-r from-slate-800/80 to-violet-900/20" : "border-slate-200 bg-gradient-to-r from-slate-50 to-violet-50/40"} px-6 py-4 flex items-center justify-between gap-4`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center gap-2 ${darkMode ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-violet-100 text-violet-700"} text-sm font-bold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg backdrop-blur-sm`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${darkMode ? "bg-violet-400" : "bg-violet-500"} animate-pulse`}
                    ></span>
                    {msg.action.label}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"} truncate`}
                    >
                      {msg.action.description}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>
                      {msg.action.meta}
                    </p>
                  </div>
                </div>
                <button className="shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-0.5 active:scale-95">
                  {msg.action.buttonText}
                </button>
              </div>
            )}
          </div>
        )}
        <p
          className={`text-xs ${textSecondary} mt-2 ${isUser ? "text-right pr-1" : "pl-1"}`}
        >
          {msg.ts}
        </p>
      </div>
    </div>
  );
}
