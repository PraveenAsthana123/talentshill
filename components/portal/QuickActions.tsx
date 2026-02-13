"use client";

import { motion } from "framer-motion";

const quickActions = [
  {
    label: "Robotics Solutions",
    query: "Tell me about your Robotics solutions",
    icon: "🤖",
  },
  {
    label: "IoT Services",
    query: "What IoT services do you offer?",
    icon: "📡",
  },
  {
    label: "GenAI Capabilities",
    query: "What are your GenAI capabilities?",
    icon: "🧠",
  },
  {
    label: "Banking Solutions",
    query: "How do you serve the Banking domain?",
    icon: "🏦",
  },
  {
    label: "Healthcare AI",
    query: "Tell me about Healthcare AI solutions",
    icon: "🏥",
  },
  {
    label: "AgriTech",
    query: "What AgriTech solutions do you provide?",
    icon: "🌾",
  },
];

interface QuickActionsProps {
  onSelect: (query: string) => void;
}

export default function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {quickActions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          onClick={() => onSelect(action.query)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-accent hover:bg-accent/5 transition-colors text-left"
        >
          <span className="text-xl">{action.icon}</span>
          <span className="font-medium">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
