"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const flows = [
  {
    id: "lifecycle",
    label: "AI Project Lifecycle",
    icon: "🔄",
    steps: [
      {
        id: "discovery",
        title: "Discovery & Strategy",
        icon: "🔍",
        color: "from-blue-500 to-indigo-600",
        borderColor: "border-blue-500",
        activities: [
          "Business problem identification",
          "AI feasibility assessment",
          "Data readiness evaluation",
          "ROI & impact analysis",
          "Use case prioritization",
        ],
        deliverables: ["AI Strategy Roadmap", "Business Case Document"],
      },
      {
        id: "data",
        title: "Data Engineering",
        icon: "🗄️",
        color: "from-teal-500 to-cyan-600",
        borderColor: "border-teal-500",
        activities: [
          "Data collection & integration",
          "Data cleansing & preprocessing",
          "Feature engineering",
          "Data pipeline development",
          "Data quality validation",
        ],
        deliverables: ["Clean Dataset", "Feature Store", "Data Pipeline"],
      },
      {
        id: "model",
        title: "Model Development",
        icon: "🧠",
        color: "from-violet-500 to-purple-600",
        borderColor: "border-violet-500",
        activities: [
          "Algorithm selection & experimentation",
          "Model training & tuning",
          "Hyperparameter optimization",
          "Cross-validation & evaluation",
          "Explainability analysis (XAI)",
        ],
        deliverables: ["Trained Model", "Evaluation Report", "XAI Dashboard"],
      },
      {
        id: "mlops",
        title: "MLOps & Deployment",
        icon: "🚀",
        color: "from-orange-500 to-red-600",
        borderColor: "border-orange-500",
        activities: [
          "CI/CD pipeline for ML models",
          "Containerization (Docker/K8s)",
          "API endpoint development",
          "A/B testing & canary deployment",
          "Infrastructure provisioning (AWS/Azure/GCP)",
        ],
        deliverables: ["Production API", "MLOps Pipeline", "Deployment Docs"],
      },
      {
        id: "monitor",
        title: "Monitoring & Governance",
        icon: "📊",
        color: "from-emerald-500 to-green-600",
        borderColor: "border-emerald-500",
        activities: [
          "Model performance monitoring",
          "Data & concept drift detection",
          "Bias & fairness auditing",
          "Automated retraining triggers",
          "Compliance & audit logging",
        ],
        deliverables: ["Monitoring Dashboard", "Governance Report", "Alert System"],
      },
      {
        id: "scale",
        title: "Scale & Optimize",
        icon: "📈",
        color: "from-pink-500 to-rose-600",
        borderColor: "border-pink-500",
        activities: [
          "Performance optimization",
          "Cost optimization (FinOps)",
          "Multi-region scaling",
          "New use case expansion",
          "Continuous improvement",
        ],
        deliverables: ["Optimization Report", "Scaling Plan", "ROI Report"],
      },
    ],
  },
  {
    id: "genai",
    label: "GenAI / RAG Pipeline",
    icon: "🧠",
    steps: [
      {
        id: "ingest",
        title: "Data Ingestion",
        icon: "📥",
        color: "from-blue-500 to-indigo-600",
        borderColor: "border-blue-500",
        activities: [
          "Document collection (PDF, DOC, HTML, DB)",
          "Web scraping & API data fetching",
          "Data format standardization",
          "Metadata extraction",
          "Content deduplication",
        ],
        deliverables: ["Raw Document Store", "Metadata Index"],
      },
      {
        id: "chunk",
        title: "Chunking & Embedding",
        icon: "🧩",
        color: "from-teal-500 to-cyan-600",
        borderColor: "border-teal-500",
        activities: [
          "Text chunking (semantic, recursive, sentence)",
          "Embedding model selection (OpenAI, Cohere, custom)",
          "Vector generation & normalization",
          "Chunk overlap & size optimization",
          "Multi-modal embedding (text + image)",
        ],
        deliverables: ["Chunk Store", "Embedding Vectors"],
      },
      {
        id: "vectordb",
        title: "Vector Database",
        icon: "🗃️",
        color: "from-violet-500 to-purple-600",
        borderColor: "border-violet-500",
        activities: [
          "Vector DB selection (Pinecone, Weaviate, Chroma, Qdrant)",
          "Index creation & optimization",
          "Namespace & collection design",
          "Similarity search tuning",
          "Hybrid search (vector + keyword)",
        ],
        deliverables: ["Vector Index", "Search API"],
      },
      {
        id: "retrieval",
        title: "Retrieval & Reranking",
        icon: "🔎",
        color: "from-orange-500 to-red-600",
        borderColor: "border-orange-500",
        activities: [
          "Query embedding & semantic search",
          "Top-K retrieval & filtering",
          "Cross-encoder reranking",
          "Context window optimization",
          "Multi-query retrieval strategies",
        ],
        deliverables: ["Retrieval Pipeline", "Reranker Model"],
      },
      {
        id: "llm",
        title: "LLM Generation",
        icon: "💬",
        color: "from-emerald-500 to-green-600",
        borderColor: "border-emerald-500",
        activities: [
          "Prompt template engineering",
          "Context injection & grounding",
          "LLM API integration (GPT, Claude, Gemini, Llama)",
          "Response formatting & citation",
          "Guardrails & safety filters",
        ],
        deliverables: ["LLM API", "Prompt Library", "Guardrails Config"],
      },
      {
        id: "eval",
        title: "Evaluation & Optimization",
        icon: "✅",
        color: "from-pink-500 to-rose-600",
        borderColor: "border-pink-500",
        activities: [
          "RAGAS evaluation (faithfulness, relevancy, recall)",
          "Human evaluation & feedback loops",
          "Hallucination detection & mitigation",
          "Latency & cost optimization",
          "Continuous retrieval quality improvement",
        ],
        deliverables: ["Eval Dashboard", "Quality Metrics", "Feedback System"],
      },
    ],
  },
  {
    id: "mlops",
    label: "MLOps Pipeline",
    icon: "⚙️",
    steps: [
      {
        id: "source",
        title: "Source Data",
        icon: "💾",
        color: "from-blue-500 to-indigo-600",
        borderColor: "border-blue-500",
        activities: [
          "Data lake / warehouse connection",
          "Streaming data integration",
          "Feature store management",
          "Data versioning (DVC)",
          "Schema validation",
        ],
        deliverables: ["Versioned Dataset", "Feature Store"],
      },
      {
        id: "train",
        title: "Training Pipeline",
        icon: "🏋️",
        color: "from-teal-500 to-cyan-600",
        borderColor: "border-teal-500",
        activities: [
          "Experiment tracking (MLflow, W&B)",
          "Distributed training orchestration",
          "Hyperparameter tuning (Optuna, Ray)",
          "Model validation & testing",
          "Model registry & versioning",
        ],
        deliverables: ["Trained Model", "Experiment Logs", "Model Registry Entry"],
      },
      {
        id: "cicd",
        title: "CI/CD for ML",
        icon: "🔁",
        color: "from-violet-500 to-purple-600",
        borderColor: "border-violet-500",
        activities: [
          "Automated model testing & validation",
          "Container image build & push",
          "Infrastructure as Code (Terraform, Pulumi)",
          "Blue/green & canary deployments",
          "Rollback & versioning strategy",
        ],
        deliverables: ["CI/CD Pipeline", "Deployment Manifests"],
      },
      {
        id: "serve",
        title: "Model Serving",
        icon: "🌐",
        color: "from-orange-500 to-red-600",
        borderColor: "border-orange-500",
        activities: [
          "REST / gRPC API endpoint",
          "Batch & real-time inference",
          "Auto-scaling (HPA, Karpenter)",
          "Model optimization (ONNX, TensorRT)",
          "Edge deployment options",
        ],
        deliverables: ["Production API", "Inference Service"],
      },
      {
        id: "observe",
        title: "Observability",
        icon: "👁️",
        color: "from-emerald-500 to-green-600",
        borderColor: "border-emerald-500",
        activities: [
          "Prediction logging & analysis",
          "Model drift monitoring (data + concept)",
          "Performance metrics dashboard",
          "Alerting & incident management",
          "Cost tracking & FinOps",
        ],
        deliverables: ["Monitoring Dashboard", "Alert Rules", "Cost Reports"],
      },
      {
        id: "retrain",
        title: "Retrain & Improve",
        icon: "🔄",
        color: "from-pink-500 to-rose-600",
        borderColor: "border-pink-500",
        activities: [
          "Automated retraining triggers",
          "Active learning & feedback integration",
          "Champion-challenger model comparison",
          "A/B testing in production",
          "Model governance & audit trail",
        ],
        deliverables: ["Retrained Model", "A/B Test Results", "Audit Log"],
      },
    ],
  },
  {
    id: "iot",
    label: "IoT + AI Architecture",
    icon: "📡",
    steps: [
      {
        id: "devices",
        title: "Devices & Sensors",
        icon: "📟",
        color: "from-blue-500 to-indigo-600",
        borderColor: "border-blue-500",
        activities: [
          "Sensor selection & provisioning",
          "Device firmware development",
          "Communication protocols (MQTT, CoAP, BLE)",
          "Device security & authentication",
          "OTA update infrastructure",
        ],
        deliverables: ["Device Fleet", "Firmware", "Security Certs"],
      },
      {
        id: "edge",
        title: "Edge Processing",
        icon: "⚡",
        color: "from-teal-500 to-cyan-600",
        borderColor: "border-teal-500",
        activities: [
          "Edge gateway deployment",
          "Real-time data filtering & aggregation",
          "On-device AI inference (TinyML)",
          "Local anomaly detection",
          "Edge-cloud synchronization",
        ],
        deliverables: ["Edge Gateway", "Local AI Models"],
      },
      {
        id: "ingest_iot",
        title: "Data Ingestion",
        icon: "📥",
        color: "from-violet-500 to-purple-600",
        borderColor: "border-violet-500",
        activities: [
          "Streaming ingestion (Kafka, Kinesis, Event Hub)",
          "Time-series database storage",
          "Data normalization & enrichment",
          "Schema registry management",
          "Batch data archival",
        ],
        deliverables: ["Streaming Pipeline", "Time-Series DB"],
      },
      {
        id: "analytics",
        title: "AI Analytics",
        icon: "🧠",
        color: "from-orange-500 to-red-600",
        borderColor: "border-orange-500",
        activities: [
          "Predictive maintenance models",
          "Anomaly detection on sensor streams",
          "Digital twin simulation",
          "Pattern recognition & forecasting",
          "RAG-powered IoT knowledge base",
        ],
        deliverables: ["AI Models", "Digital Twin", "Knowledge Base"],
      },
      {
        id: "dashboard",
        title: "Visualization & Action",
        icon: "📊",
        color: "from-emerald-500 to-green-600",
        borderColor: "border-emerald-500",
        activities: [
          "Real-time monitoring dashboard",
          "Alerting & notification engine",
          "Automated control actions",
          "Reporting & compliance",
          "Mobile app integration",
        ],
        deliverables: ["Dashboard", "Alert System", "Mobile App"],
      },
      {
        id: "optimize",
        title: "Optimize & Scale",
        icon: "📈",
        color: "from-pink-500 to-rose-600",
        borderColor: "border-pink-500",
        activities: [
          "Fleet management at scale",
          "Energy & cost optimization",
          "Model retraining with new data",
          "Multi-site deployment",
          "Continuous improvement cycle",
        ],
        deliverables: ["Optimization Report", "Scaling Playbook"],
      },
    ],
  },
];

export default function AIProjectFlow() {
  const [activeFlow, setActiveFlow] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const flow = flows[activeFlow];

  return (
    <section id="ai-flow" className="py-24 bg-primary mesh-gradient-1 section-glow-top relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            How We Deliver
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI Project Flow
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            End-to-end project workflows — from discovery to deployment,
            with built-in governance and continuous optimization.
          </p>
        </motion.div>

        {/* Flow selector tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 rounded-2xl p-2 shadow-sm gap-1 flex-wrap justify-center">
            {flows.map((f, i) => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFlow(i);
                  setExpandedStep(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  i === activeFlow
                    ? "bg-white/10 text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{f.icon}</span>
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Flow diagram */}
        <AnimatePresence mode="wait">
          <motion.div
            key={flow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Flow title */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-white">
                {flow.label}
              </h3>
            </div>

            {/* Horizontal flow - Desktop */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Connection line */}
                <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 z-0" />

                <div className="grid grid-cols-6 gap-4 relative z-10">
                  {flow.steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      {/* Step circle */}
                      <button
                        onClick={() =>
                          setExpandedStep(
                            expandedStep === step.id ? null : step.id
                          )
                        }
                        className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${step.color} flex flex-col items-center justify-center text-white shadow-lg hover:scale-105 transition-transform cursor-pointer relative`}
                      >
                        <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white/10 shadow text-white text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-2xl mb-1">{step.icon}</span>
                        <span className="text-[11px] font-semibold text-center leading-tight px-2">
                          {step.title}
                        </span>
                      </button>

                      {/* Arrow */}
                      {i < flow.steps.length - 1 && (
                        <div className="absolute" style={{ left: `${(i + 1) * (100 / 6)}%`, top: "60px", transform: "translateX(-50%)" }}>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical flow - Mobile/Tablet */}
            <div className="lg:hidden space-y-4">
              {flow.steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="flex gap-4"
                >
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}>
                      <span className="text-lg">{step.icon}</span>
                    </div>
                    {i < flow.steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-white/30 to-white/10 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <button
                    onClick={() =>
                      setExpandedStep(expandedStep === step.id ? null : step.id)
                    }
                    className="flex-1 text-left mb-2"
                  >
                    <div className={`bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-4 border-l-4 ${step.borderColor} hover:shadow-lg transition-shadow`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-white/40 font-semibold">Step {i + 1}</span>
                          <h4 className="font-bold text-white text-sm">{step.title}</h4>
                        </div>
                        <svg
                          className={`w-4 h-4 text-white/40 transition-transform ${expandedStep === step.id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Expanded step detail */}
            <AnimatePresence>
              {expandedStep && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {flow.steps
                    .filter((s) => s.id === expandedStep)
                    .map((step) => (
                      <div
                        key={step.id}
                        className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden"
                      >
                        <div className={`bg-gradient-to-r ${step.color} px-6 py-4`}>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{step.icon}</span>
                            <div>
                              <h4 className="text-lg font-bold text-white">
                                {step.title}
                              </h4>
                              <p className="text-white/70 text-xs">
                                Step{" "}
                                {flow.steps.findIndex((s) => s.id === step.id) + 1}{" "}
                                of {flow.steps.length}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                          {/* Activities */}
                          <div>
                            <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Key Activities
                            </h5>
                            <ul className="space-y-2">
                              {step.activities.map((a, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.05, duration: 0.2 }}
                                  className="flex items-start gap-2"
                                >
                                  <svg className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span className="text-sm text-white/60">{a}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>

                          {/* Deliverables */}
                          <div>
                            <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                              Deliverables
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {step.deliverables.map((d, j) => (
                                <motion.span
                                  key={j}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: j * 0.05, duration: 0.2 }}
                                  className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {d}
                                </motion.span>
                              ))}
                            </div>

                            {/* Next step indicator */}
                            {flow.steps.findIndex((s) => s.id === step.id) <
                              flow.steps.length - 1 && (
                              <div className="mt-6 pt-4 border-t border-white/10">
                                <button
                                  onClick={() => {
                                    const nextIdx =
                                      flow.steps.findIndex(
                                        (s) => s.id === step.id
                                      ) + 1;
                                    setExpandedStep(flow.steps[nextIdx].id);
                                  }}
                                  className="flex items-center gap-2 text-sm text-white font-semibold hover:text-accent transition-colors"
                                >
                                  Next:{" "}
                                  {
                                    flow.steps[
                                      flow.steps.findIndex(
                                        (s) => s.id === step.id
                                      ) + 1
                                    ].title
                                  }
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary stats */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: flow.steps.length, label: "Phases", icon: "📋" },
                {
                  value: flow.steps.reduce(
                    (acc, s) => acc + s.activities.length,
                    0
                  ),
                  label: "Activities",
                  icon: "⚡",
                },
                {
                  value: flow.steps.reduce(
                    (acc, s) => acc + s.deliverables.length,
                    0
                  ),
                  label: "Deliverables",
                  icon: "📦",
                },
                { value: "100%", label: "Governance Built-in", icon: "🛡️" },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl shadow-sm border border-white/10 p-4 text-center"
                >
                  <span className="text-lg">{stat.icon}</span>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
