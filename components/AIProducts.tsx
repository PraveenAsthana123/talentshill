"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "genai",
    label: "GenAI",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-9.25-11.396c.251.023.501.05.75.082M19 14.5l-3.091-3.091M19 14.5v.375a3.375 3.375 0 01-3.375 3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 009.625 12H9.25m0 0L5 14.5m4.25-2.5H5" />
      </svg>
    ),
    product: "AI Chatbot Platform",
    tagline: "Intelligent Conversational Experiences",
    description:
      "Our GenAI-powered chatbot platform enables businesses to deploy intelligent virtual assistants that understand natural language, learn from interactions, and deliver human-like conversations across channels.",
    features: [
      "Multi-language natural language understanding",
      "Context-aware conversation management",
      "Seamless handoff to human agents",
      "Custom knowledge base integration",
      "Analytics dashboard with conversation insights",
      "Omnichannel deployment — web, mobile, messaging apps",
    ],
    useCases: [
      "Customer Support Automation",
      "Lead Generation & Qualification",
      "Employee Help Desk",
      "Product Recommendations",
    ],
    services: [
      "GenAI & RAG",
      "Voice AI",
      "Cloud (AWS/Azure/GCP)",
      "Automation",
      "Data Analytics",
    ],
    color: "from-violet-600 to-indigo-700",
    accentColor: "text-violet-600",
    bgAccent: "bg-white/10",
    borderAccent: "border-white/10",
  },
  {
    id: "robotics",
    label: "Robotics",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
      </svg>
    ),
    product: "Mobile Robot Solution",
    tagline: "Autonomous Navigation & Task Execution",
    description:
      "Our mobile robot platform combines advanced navigation, computer vision, and AI planning to deliver autonomous robots for logistics, inspection, and service applications across industries.",
    features: [
      "SLAM-based autonomous navigation",
      "Obstacle detection & path planning",
      "Fleet management & orchestration",
      "Real-time telemetry & monitoring dashboard",
      "Integration with warehouse & ERP systems",
      "Cloud-connected OTA updates & analytics",
    ],
    useCases: [
      "Warehouse & Logistics Automation",
      "Facility Inspection & Security",
      "Last-Mile Delivery",
      "Healthcare Material Transport",
    ],
    services: [
      "Computer Vision",
      "IoT & Edge AI",
      "SLAM & Navigation",
      "Cloud (AWS/Azure/GCP)",
      "Automation",
      "Data Analytics",
    ],
    color: "from-orange-500 to-red-600",
    accentColor: "text-orange-600",
    bgAccent: "bg-white/10",
    borderAccent: "border-white/10",
  },
  {
    id: "iot",
    label: "IoT",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
      </svg>
    ),
    product: "Smart Building Platform",
    tagline: "Connected Intelligence for Modern Buildings",
    description:
      "Our IoT-powered smart building platform connects sensors, HVAC, lighting, and security systems into a unified intelligent platform that optimizes energy, comfort, and operational efficiency.",
    features: [
      "Real-time environmental monitoring (temp, humidity, air quality)",
      "AI-driven energy optimization & HVAC control",
      "Occupancy analytics & space utilization",
      "Predictive maintenance for building systems",
      "Integrated access control & security",
      "Centralized management dashboard with alerts",
    ],
    useCases: [
      "Commercial Office Buildings",
      "Smart Hospitals & Clinics",
      "Retail Stores & Malls",
      "Industrial Facilities",
    ],
    services: [
      "IoT & Edge AI",
      "Computer Vision",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Data Analytics",
      "Energy AI",
    ],
    color: "from-teal-500 to-cyan-600",
    accentColor: "text-teal-600",
    bgAccent: "bg-white/10",
    borderAccent: "border-white/10",
  },
  {
    id: "embedded",
    label: "Embedded",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    product: "Wearable Intelligence Platform",
    tagline: "AI at the Edge, On Your Body",
    description:
      "Our embedded wearable platform combines ultra-low-power hardware design with on-device AI to deliver smart wearable devices for health monitoring, industrial safety, and fitness applications.",
    features: [
      "On-device ML for real-time health metric analysis",
      "Multi-sensor fusion (heart rate, SpO2, accelerometer, gyro)",
      "Bluetooth & cellular connectivity",
      "Cloud sync with analytics dashboard",
      "Battery optimization for extended wear",
      "FDA-ready health data pipeline",
    ],
    useCases: [
      "Remote Patient Monitoring",
      "Worker Safety & Fatigue Detection",
      "Fitness & Wellness Tracking",
      "Elderly Care & Fall Detection",
    ],
    services: [
      "Embedded & Edge AI",
      "IoT & Wearables",
      "Computer Vision",
      "Cloud (AWS/Azure/GCP)",
      "Data Analytics",
    ],
    color: "from-pink-500 to-rose-600",
    accentColor: "text-pink-600",
    bgAccent: "bg-white/10",
    borderAccent: "border-white/10",
  },
];

export default function AIProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const tab = tabs[activeTab];

  return (
    <section id="ai-products" className="py-20 bg-primary mesh-gradient-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AI Product Offerings
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Explore our suite of AI-powered products designed to transform
            industries with cutting-edge technology.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 rounded-xl p-1.5 gap-1 flex-wrap justify-center">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
                  i === activeTab
                    ? "bg-white/10 backdrop-blur-sm text-white shadow-md"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Left: Product hero card */}
              <div
                className={`bg-gradient-to-br ${tab.color} rounded-2xl p-10 text-white relative overflow-hidden`}
              >
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-3">{tab.product}</h3>
                  <p className="text-lg text-white/80 mb-6">{tab.tagline}</p>
                  <p className="text-white/90 leading-relaxed mb-8">
                    {tab.description}
                  </p>
                  {"services" in tab && tab.services && (
                    <div className="mb-8">
                      <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">
                        Services We Offer
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tab.services.map((svc: string) => (
                          <span
                            key={svc}
                            className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <a
                    href="/portal"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Learn More
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right: Features & use cases */}
              <div className="space-y-8">
                {/* Features */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    {tab.features.map((feature, i) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className="flex items-start gap-3"
                      >
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-accent`} />
                        <span className="text-white/60 text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Use cases */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Use Cases
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {tab.useCases.map((uc, i) => (
                      <motion.div
                        key={uc}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                        className={`${tab.bgAccent} ${tab.borderAccent} border rounded-lg px-4 py-3`}
                      >
                        <p className={`text-sm font-medium ${tab.accentColor}`}>
                          {uc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
