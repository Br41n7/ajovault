/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, HelpCircle, HeartHandshake, Bot, User, BrainCircuit } from "lucide-react";
import { Message } from "../types";

const SUGGESTIONS = [
  "How should we handle late members in a monthly, 6-member circle?",
  "Explain the traditional Yoruba Ajo & Esusu traditions.",
  "How does the bidding payout order model distribute dividends?",
  "Tips to design penalty rules for a weekly rotational circle."
];

// Self-contained simple Markdown renderer to avoid library imports and packaging errors
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2.5 text-xs text-brand-forest leading-relaxed">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-sm font-semibold text-brand-clay font-display pt-2 border-b border-brand-cream pb-1">
              {line.substring(4)}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-brand-forest font-display pt-3">
              {line.substring(3)}
            </h3>
          );
        }
        // Bold helper lines
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={idx} className="font-bold text-brand-forest">
              {line.substring(2, line.length - 2)}
            </p>
          );
        }
        // Bullet points
        if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const content = line.trim().substring(2);
          return (
            <div key={idx} className="flex gap-2 items-start pl-3">
              <span className="text-brand-clay font-bold">•</span>
              <p>{content}</p>
            </div>
          );
        }
        // Numeric points
        if (/^\d+\.\s/.test(line.trim())) {
          const match = line.trim().match(/^(\d+)\.\s(.*)/);
          if (match) {
            return (
              <div key={idx} className="flex gap-2 items-start pl-3 font-sans">
                <span className="text-brand-clay font-bold font-mono">{match[1]}.</span>
                <p>{match[2]}</p>
              </div>
            );
          }
        }
        // Blank lines
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }
        // Normal text
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}

export default function GuruCoach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "advisor",
      text: "### Welcome to AjoVault Guru Advisory Coach! 🌟\n\nI am your authority on rotational savings (Ajo, Adashe, Stokvel, and Tontines).\n\nAsk me about penalty designs, managing default members, or configuring circular bidding yields!",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          chatHistory: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Advisory query connection error.");
      }

      const data = await response.json();

      const advisorMsg: Message = {
        id: `msg-advisor-${Date.now()}`,
        sender: "advisor",
        text: data.text || "I was unable to consult the archives. Please try again!",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, advisorMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        sender: "advisor",
        text: "### Connection Disturbance ⚠️\n\nI had a minor connection lag. Let's retry! " + e.message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[600px] flex flex-col justify-between bg-white rounded-2xl border border-brand-border shadow-md overflow-hidden relative z-10 select-none">
      {/* Visual Accent */}
      <div className="absolute inset-0 adire-accent opacity-5 pointer-events-none" />

      {/* Header bar */}
      <div className="bg-brand-forest p-4 text-brand-cream flex items-center justify-between border-b border-white/5 relative z-10 shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-clay rounded-xl text-white transform rotate-3">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-medium text-brand-gold text-sm sm:text-base leading-tight">
              AjoVault Guru AI Advisor
            </h3>
            <span className="text-[10px] text-brand-cream/60 block mt-0.5 uppercase tracking-widest font-mono">
              Cultural & Cooperative Intelligence
            </span>
          </div>
        </div>

        <span className="text-[10px] bg-brand-clay text-white font-bold px-2.5 py-1 rounded-full border border-brand-clay/10 animate-pulse-slow font-mono uppercase tracking-wider">
          gemini model
        </span>
      </div>

      {/* Suggestion overlay bar at top if conversation is tiny */}
      {messages.length <= 1 && (
        <div className="p-4 bg-brand-cream/60 border-b border-brand-border relative z-10 space-y-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-brand-muted pl-1">
            Tap Suggested Inquiries
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSendPrompt(s)}
                className="text-[11px] bg-white text-brand-forest border border-brand-border hover:border-brand-clay px-3 py-1.5 rounded-lg font-medium shadow-sm transition-all text-left cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Ledger Box */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 relative z-10">
        
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-[83%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Sender avatar indicator */}
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                m.sender === "user"
                  ? "bg-brand-clay text-white border-brand-clay/10"
                  : "bg-brand-forest text-brand-cream border-brand-forest/10"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble detail */}
            <div
              className={`p-4 rounded-2xl shadow-sm border ${
                m.sender === "user"
                  ? "bg-brand-cream text-brand-forest border-brand-border"
                  : "bg-[#FFFFFF] border-brand-border"
              }`}
            >
              <SimpleMarkdown text={m.text} />
              
              <span className="text-[8px] font-mono tracking-wider text-brand-muted/70 block mt-2 text-right">
                {new Date(m.createdAt).toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Bubble */}
        {isTyping && (
          <div className="flex gap-3 max-w-[60%]">
            <div className="w-8 h-8 rounded-full bg-brand-forest text-brand-cream border border-brand-forest/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-sm flex items-center gap-1.5 py-3">
              <div className="w-2 h-2 bg-brand-clay rounded-full animate-bounce [animation-delay:-0.32s]" />
              <div className="w-2 h-2 bg-brand-clay rounded-full animate-bounce [animation-delay:-0.16s]" />
              <div className="w-2 h-2 bg-brand-clay rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer Inputs form */}
      <div className="p-4 bg-brand-cream/80 border-t border-brand-border relative z-10 flex gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendPrompt(inputPrompt);
            }
          }}
          placeholder="Consult Guru Coach on disputes, trust, or savings rules ..."
          className="flex-1 px-4 py-2.5 text-xs border border-brand-border rounded-xl bg-white text-brand-forest placeholder:text-brand-muted/65 outline-none focus:border-brand-clay"
        />
        <button
          onClick={() => handleSendPrompt(inputPrompt)}
          className="bg-brand-clay hover:bg-brand-clay/95 text-white p-2.5 rounded-xl cursor-pointer"
        >
          <Send className="w-4 h-4 shrink-0" />
        </button>
      </div>

    </div>
  );
}
