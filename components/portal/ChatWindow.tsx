"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import QuickActions from "./QuickActions";
import { getAIResponse } from "./aiResponses";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Welcome to the **Talents Hill Inc AI Portal**! 👋

I'm your AI assistant, here to help you explore our solutions in:

• **Robotics**, **IoT**, and **GenAI**
• Domains like **Banking**, **Healthcare**, **Real Estate**, and **AgriTech**
• **Marketing**, **Customer**, and **Data Integration** analytics

Ask me anything or pick a topic below to get started!`,
  timestamp: new Date(),
};

interface ChatWindowProps {
  externalQuery?: string | null;
  onQueryHandled?: () => void;
}

export default function ChatWindow({ externalQuery, onQueryHandled }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = useCallback(
    (text: string) => {
      setShowQuickActions(false);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Simulate AI thinking delay
      setTimeout(() => {
        const response = getAIResponse(text);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 800 + Math.random() * 700);
    },
    []
  );

  // Handle external queries from sidebar
  useEffect(() => {
    if (externalQuery) {
      handleSend(`Tell me about ${externalQuery}`);
      onQueryHandled?.();
    }
  }, [externalQuery, handleSend, onQueryHandled]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-primary">AI Assistant</h1>
          <p className="text-xs text-gray-500">
            Ask about our AI, Robotics, IoT, and GenAI solutions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gray-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {showQuickActions && (
        <div className="px-6 py-4 border-t bg-white">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
            Quick Topics
          </p>
          <QuickActions onSelect={handleSend} />
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t bg-white">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
