"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const quickReplies = [
  "What services do you offer?",
  "I need a chatbot for my business",
  "Tell me about IoT solutions",
  "I want to talk to someone",
];

function getBotReply(input: string): string {
  const lower = input.toLowerCase();

  if (/^(hi|hello|hey|good)/i.test(lower)) {
    return "Hello! Welcome to Talents Hill Inc. How can I help you today? You can ask about our AI products, services, or request a consultation.";
  }
  if (lower.includes("service") || lower.includes("offer") || lower.includes("what do you")) {
    return "We offer:\n\n• GenAI & Chatbot Solutions\n• Mobile Robotics\n• IoT & Smart Building\n• Embedded & Wearables\n• Marketing & Customer Analytics\n• Data Integration\n\nWould you like details on any of these?";
  }
  if (lower.includes("chatbot") || lower.includes("genai") || lower.includes("conversational")) {
    return "Our AI Chatbot Platform provides intelligent virtual assistants with natural language understanding, multi-language support, and omnichannel deployment.\n\nPerfect for customer support, lead generation, and employee help desks.\n\nWant to schedule a demo?";
  }
  if (lower.includes("robot") || lower.includes("mobile robot")) {
    return "Our Mobile Robot Solution features SLAM-based autonomous navigation, fleet management, and real-time monitoring.\n\nUsed in warehouses, logistics, healthcare, and facility inspection.\n\nShall I connect you with our robotics team?";
  }
  if (lower.includes("iot") || lower.includes("smart building") || lower.includes("sensor")) {
    return "Our Smart Building Platform connects sensors, HVAC, lighting, and security into one intelligent system.\n\nFeatures AI-driven energy optimization, occupancy analytics, and predictive maintenance.\n\nWould you like a consultation?";
  }
  if (lower.includes("embedded") || lower.includes("wearable")) {
    return "Our Wearable Intelligence Platform combines ultra-low-power hardware with on-device AI for health monitoring, worker safety, and fitness applications.\n\nInterested in learning more?";
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("pricing")) {
    return "Our pricing is tailored to each project's scope and requirements. I'd recommend speaking with our team for an accurate quote.\n\nYou can reach us at praveen.asthana@talentshill.com or I can have someone contact you.";
  }
  if (lower.includes("contact") || lower.includes("talk") || lower.includes("call") || lower.includes("email") || lower.includes("consult") || lower.includes("demo") || lower.includes("schedule")) {
    return "You can reach our team at:\n\n📧 praveen.asthana@talentshill.com\n🌐 www.talentshill.com\n\nOr scroll down to our Contact Us section to send a message directly. We typically respond within 24 hours!";
  }
  if (lower.includes("banking") || lower.includes("financial") || lower.includes("fintech")) {
    return "We serve Banking & Financial Services with fraud detection, credit risk analytics, customer 360, and regulatory compliance solutions.\n\nWant to discuss your specific needs?";
  }
  if (lower.includes("health") || lower.includes("pharma") || lower.includes("medical")) {
    return "Our Healthcare AI solutions include clinical analytics, medical imaging AI, drug discovery support, and remote patient monitoring.\n\nShall I arrange a consultation with our healthcare team?";
  }
  if (lower.includes("real estate") || lower.includes("property")) {
    return "We offer Real Estate AI solutions including property valuation models, market trend analysis, smart building management, and location intelligence.\n\nWould you like more details?";
  }
  if (lower.includes("agri") || lower.includes("farm")) {
    return "Our AgriTech solutions cover precision farming, crop disease detection, supply chain optimization, and IoT-enabled smart farming.\n\nInterested in a specific area?";
  }
  if (lower.includes("thank")) {
    return "You're welcome! Feel free to reach out anytime. Have a great day!";
  }
  if (lower.includes("bye") || lower.includes("goodbye")) {
    return "Goodbye! Thanks for chatting with us. Don't hesitate to come back if you have more questions!";
  }

  return "Thanks for your message! I can help you with information about our AI products (GenAI, Robotics, IoT, Embedded), industry solutions, or connect you with our team.\n\nWhat would you like to know?";
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi there! 👋 I'm the Talents Hill Inc assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: reply,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 600);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    sendMessage(trimmed);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent hover:bg-accent-dark text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            aria-label="Open chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-5 py-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm">Talents Hill Inc Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-xs text-white/70">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies (only show when few messages) */}
            {messages.length <= 2 && !isTyping && (
              <div className="px-4 py-2 border-t bg-white flex-shrink-0">
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr}
                      onClick={() => sendMessage(qr)}
                      className="text-xs px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full hover:bg-accent/20 transition-colors"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t bg-white flex gap-2 flex-shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="px-3 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
