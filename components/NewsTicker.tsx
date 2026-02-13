"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const newsItems = [
  {
    id: 1,
    date: "Jan 30, 2025",
    category: "Partnership",
    title: "Talents Hill Inc Partners with Leading Cloud Provider for AI Solutions",
    description:
      "We are excited to announce a strategic partnership to deliver scalable AI and analytics solutions on cloud infrastructure, enabling faster deployment for enterprise clients.",
  },
  {
    id: 2,
    date: "Jan 22, 2025",
    category: "Product Launch",
    title: "Introducing Our New GenAI Chatbot Platform 2.0",
    description:
      "The latest version of our chatbot platform features multi-modal understanding, improved context retention, and support for 50+ languages out of the box.",
  },
  {
    id: 3,
    date: "Jan 15, 2025",
    category: "Award",
    title: "Talents Hill Inc Named Top AI Analytics Firm for 2025",
    description:
      "We are honored to be recognized as a leading AI analytics firm by Industry Research Group, reflecting our commitment to delivering exceptional value to clients.",
  },
  {
    id: 4,
    date: "Jan 8, 2025",
    category: "Event",
    title: "Join Us at AI World Summit 2025 in San Francisco",
    description:
      "Our team will be presenting on the future of autonomous mobile robots in warehouse logistics. Visit our booth to see live demos of our robotics platform.",
  },
  {
    id: 5,
    date: "Dec 30, 2024",
    category: "Case Study",
    title: "Healthcare Client Reduces Readmissions by 35% with Our AI Platform",
    description:
      "A major hospital network leveraged our clinical analytics and predictive models to identify high-risk patients and intervene proactively, significantly reducing readmission rates.",
  },
  {
    id: 6,
    date: "Dec 20, 2024",
    category: "Innovation",
    title: "Smart Building Pilot Achieves 40% Energy Savings",
    description:
      "Our IoT-powered smart building platform deployed at a commercial complex demonstrated 40% reduction in energy costs through AI-driven HVAC optimization and occupancy-based controls.",
  },
];

const categoryColors: Record<string, string> = {
  Partnership: "bg-blue-100 text-blue-700",
  "Product Launch": "bg-violet-100 text-violet-700",
  Award: "bg-amber-100 text-amber-700",
  Event: "bg-green-100 text-green-700",
  "Case Study": "bg-pink-100 text-pink-700",
  Innovation: "bg-teal-100 text-teal-700",
};

export default function NewsTicker() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const tabs = ["All News", "Product", "Industry", "Events"];
  const filteredNews =
    activeTab === 0
      ? newsItems
      : activeTab === 1
        ? newsItems.filter((n) => ["Product Launch", "Innovation"].includes(n.category))
        : activeTab === 2
          ? newsItems.filter((n) => ["Partnership", "Case Study", "Award"].includes(n.category))
          : newsItems.filter((n) => n.category === "Event");

  return (
    <section id="news" className="py-24 bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Stay Updated
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Latest News
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Company updates, product launches, industry recognition, and
            upcoming events.
          </p>
        </motion.div>

        {/* Scrolling ticker bar */}
        <div className="mb-12 bg-primary rounded-xl overflow-hidden">
          <div className="flex items-center">
            <div className="bg-accent px-4 py-3 text-white text-sm font-bold flex-shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LATEST
            </div>
            <div className="overflow-hidden flex-1 py-3">
              <div className="animate-ticker whitespace-nowrap flex">
                {[...newsItems, ...newsItems].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-3 mx-8 text-white/90 text-sm">
                    <span className="text-accent font-semibold">{item.date}</span>
                    <span>{item.title}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/10 rounded-xl p-1.5 gap-1">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === i
                    ? "bg-white/10 text-white shadow"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* News list */}
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === item.id ? null : item.id)
                  }
                  className="w-full p-6 flex items-start gap-4 text-left"
                >
                  {/* Date badge */}
                  <div className="hidden sm:flex flex-col items-center bg-white/10 rounded-lg px-3 py-2 flex-shrink-0 min-w-[60px]">
                    <span className="text-xs text-white/40">
                      {item.date.split(" ")[0]}
                    </span>
                    <span className="text-lg font-bold text-white">
                      {item.date.split(" ")[1]?.replace(",", "")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          categoryColors[item.category] || "bg-white/10 text-white/80"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs text-white/40 sm:hidden">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg">
                      {item.title}
                    </h3>
                  </div>

                  <svg
                    className={`w-5 h-5 text-white/40 flex-shrink-0 mt-1 transition-transform ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 sm:pl-[92px]">
                        <p className="text-white/60 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
