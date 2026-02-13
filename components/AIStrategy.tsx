"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const strategies = [
  {
    id: "ai-strategy",
    title: "AI Strategy",
    icon: "🎯",
    color: "from-blue-500 to-indigo-600",
    tagColor: "bg-blue-100 text-blue-700",
    description:
      "Define a clear AI vision, identify high-impact opportunities, and build a roadmap to AI-driven competitive advantage.",
    phases: [
      {
        name: "AI Readiness Assessment",
        items: [
          "Current AI maturity evaluation across business units",
          "Data infrastructure & quality assessment",
          "Technology stack & tooling gap analysis",
          "Talent & skills inventory for AI capabilities",
          "AI governance & ethics readiness check",
        ],
      },
      {
        name: "Opportunity Identification",
        items: [
          "AI use case discovery workshops with stakeholders",
          "Business value vs. feasibility prioritization matrix",
          "Quick-win vs. strategic AI initiative classification",
          "Competitive landscape & industry AI benchmarking",
          "Build vs. buy vs. partner decision framework",
        ],
      },
      {
        name: "Roadmap & Execution Plan",
        items: [
          "Phased AI implementation roadmap (6-24 months)",
          "Technology architecture & platform selection",
          "Data strategy & governance framework",
          "Talent acquisition & upskilling plan",
          "KPI definition & success metrics",
        ],
      },
      {
        name: "AI Operating Model",
        items: [
          "Center of Excellence (CoE) design & setup",
          "AI governance board & decision-making framework",
          "MLOps & model lifecycle management processes",
          "Responsible AI policies & compliance framework",
          "Continuous improvement & innovation pipeline",
        ],
      },
    ],
  },
  {
    id: "digital-transformation",
    title: "Digital Transformation Strategy",
    icon: "🚀",
    color: "from-violet-500 to-purple-600",
    tagColor: "bg-violet-100 text-violet-700",
    description:
      "End-to-end digital transformation powered by AI, cloud, automation, and data — reimagining business processes, customer experiences, and operating models.",
    phases: [
      {
        name: "Vision & Current State Analysis",
        items: [
          "Digital maturity assessment across all functions",
          "Customer journey mapping & pain point analysis",
          "Process mining for automation opportunities",
          "Legacy system evaluation & modernization plan",
          "Digital culture & change readiness assessment",
        ],
      },
      {
        name: "Digital Architecture & Platform",
        items: [
          "Cloud migration strategy (AWS, Azure, GCP)",
          "API-first & microservices architecture design",
          "Data platform & analytics stack selection",
          "Integration & middleware strategy",
          "Cybersecurity & zero-trust framework",
        ],
      },
      {
        name: "AI & Automation Integration",
        items: [
          "AI-powered process automation roadmap",
          "GenAI & chatbot strategy for customer & employee experience",
          "Intelligent document processing & data extraction",
          "Predictive analytics for decision-making",
          "IoT & edge computing for connected operations",
        ],
      },
      {
        name: "Change Management & Adoption",
        items: [
          "Stakeholder engagement & communication plan",
          "Digital skills training & upskilling programs",
          "Agile & DevOps transformation for delivery teams",
          "KPI dashboard & transformation progress tracking",
          "Continuous improvement & innovation governance",
        ],
      },
    ],
  },
  {
    id: "data-strategy",
    title: "Data & Analytics Strategy",
    icon: "📊",
    color: "from-teal-500 to-cyan-600",
    tagColor: "bg-teal-100 text-teal-700",
    description:
      "Build a data-driven culture with a robust data strategy — from governance and architecture to analytics and AI-ready data infrastructure.",
    phases: [
      {
        name: "Data Assessment & Vision",
        items: [
          "Enterprise data landscape mapping",
          "Data quality & completeness audit",
          "Data governance maturity assessment",
          "Business intelligence & analytics current state",
          "Data monetization opportunity analysis",
        ],
      },
      {
        name: "Data Architecture & Governance",
        items: [
          "Data lakehouse / mesh architecture design",
          "Master data management (MDM) strategy",
          "Data governance framework & stewardship model",
          "Data catalog & metadata management",
          "Data privacy & compliance (GDPR, CCPA, HIPAA)",
        ],
      },
      {
        name: "Analytics & AI Enablement",
        items: [
          "Self-service analytics & BI platform strategy",
          "Advanced analytics & ML use case roadmap",
          "Feature store & ML data pipeline design",
          "Real-time analytics & streaming architecture",
          "Data democratization & literacy programs",
        ],
      },
      {
        name: "Data Operations & Scale",
        items: [
          "DataOps automation & CI/CD for data pipelines",
          "Data quality monitoring & alerting",
          "Cost optimization for data infrastructure",
          "Multi-cloud data strategy & portability",
          "Data team structure & operating model",
        ],
      },
    ],
  },
  {
    id: "genai-strategy",
    title: "GenAI Adoption Strategy",
    icon: "🧠",
    color: "from-pink-500 to-rose-600",
    tagColor: "bg-pink-100 text-pink-700",
    description:
      "Accelerate GenAI adoption with a structured approach — from pilot selection and LLM evaluation to enterprise-scale RAG deployments and AI governance.",
    phases: [
      {
        name: "GenAI Assessment & Pilots",
        items: [
          "GenAI readiness & opportunity assessment",
          "Use case prioritization (chatbots, content, code, search)",
          "LLM selection & evaluation (GPT, Claude, Gemini, Llama)",
          "Proof of concept (PoC) development & validation",
          "Cost-benefit analysis & ROI projection",
        ],
      },
      {
        name: "RAG & Knowledge Architecture",
        items: [
          "Enterprise knowledge graph & taxonomy design",
          "RAG pipeline architecture (chunking, embedding, retrieval)",
          "Vector database selection & deployment",
          "Multi-source data ingestion & indexing strategy",
          "Evaluation framework (RAGAS, human feedback)",
        ],
      },
      {
        name: "Enterprise Scale-Up",
        items: [
          "Production-grade LLM deployment & API gateway",
          "Prompt management & template library",
          "Fine-tuning strategy for domain-specific models",
          "Multi-tenant & multi-use-case platform design",
          "Cost optimization (caching, model routing, quantization)",
        ],
      },
      {
        name: "Governance & Responsible GenAI",
        items: [
          "GenAI usage policies & acceptable use guidelines",
          "Hallucination detection & factual grounding",
          "Content safety guardrails & moderation",
          "IP & copyright compliance for generated content",
          "Continuous monitoring & model drift management",
        ],
      },
    ],
  },
];

export default function AIStrategy() {
  const [activeStrategy, setActiveStrategy] = useState(0);
  const strategy = strategies[activeStrategy];

  return (
    <section id="ai-strategy" className="py-24 bg-primary mesh-gradient-3 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Strategic Advisory
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI & Digital Transformation Strategy
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            From AI strategy and GenAI adoption to enterprise-wide digital
            transformation — we help you plan, execute, and scale.
          </p>
        </motion.div>

        {/* Strategy tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 rounded-2xl p-2 gap-1 flex-wrap justify-center">
            {strategies.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStrategy(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  i === activeStrategy
                    ? "bg-white/10 text-white shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Strategy header */}
            <div className={`bg-gradient-to-r ${strategy.color} rounded-2xl p-8 mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex items-center gap-4">
                <span className="text-5xl">{strategy.icon}</span>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    {strategy.title}
                  </h3>
                  <p className="text-white/80 mt-2 max-w-2xl">
                    {strategy.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Phases */}
            <div className="grid md:grid-cols-2 gap-6">
              {strategy.phases.map((phase, i) => (
                <motion.div
                  key={phase.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden card-hover"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${strategy.tagColor}`}>
                        {phase.name}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {phase.items.map((item, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: i * 0.08 + j * 0.03,
                            duration: 0.2,
                          }}
                          className="flex items-start gap-2.5"
                        >
                          <svg
                            className="w-4 h-4 text-accent flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4"
                            />
                          </svg>
                          <span className="text-sm text-white/60">{item}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/30"
              >
                Discuss Your {strategy.title}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
