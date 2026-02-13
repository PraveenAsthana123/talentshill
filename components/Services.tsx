"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const serviceCategories = [
  {
    category: "Analytics & Data",
    items: [
      {
        title: "AI in Marketing Analytics",
        description:
          "Optimize campaigns, measure ROI, and uncover insights that drive customer acquisition and retention.",
        gradient: "from-blue-500 to-indigo-600",
        useCases: [
          "AI-powered campaign performance prediction & optimization",
          "Customer micro-segmentation with ML clustering",
          "Predictive lead scoring & conversion modeling",
          "GenAI content generation for personalized campaigns",
          "Marketing mix modeling with machine learning",
          "Sentiment analysis on brand mentions & social media",
          "Automated A/B test analysis & recommendations",
          "Attribution modeling with AI-driven insights",
        ],
      },
      {
        title: "AI in Customer Analytics",
        description:
          "Behavioral analysis, segmentation, and predictive modeling to maximize customer lifetime value.",
        gradient: "from-teal-500 to-cyan-600",
        useCases: [
          "Customer lifetime value prediction with ML models",
          "Churn prediction & proactive retention strategies",
          "AI-driven customer journey mapping & optimization",
          "Real-time personalization engines for recommendations",
          "Next-best-action prediction for cross-sell & upsell",
          "Customer sentiment & emotion analysis across channels",
          "Behavioral anomaly detection for fraud prevention",
          "AI-powered Voice of Customer analytics",
        ],
      },
      {
        title: "AI in Data Integration",
        description:
          "Connect, transform, and unify data from multiple sources into a single source of truth.",
        gradient: "from-purple-500 to-pink-600",
        useCases: [
          "AI-powered data matching & deduplication",
          "Automated schema mapping & data transformation",
          "Intelligent ETL pipeline optimization with ML",
          "Data quality scoring & anomaly detection",
          "NLP-based metadata extraction & cataloging",
          "AI-driven data lineage & impact analysis",
          "Automated data governance & compliance monitoring",
          "Self-healing data pipelines with ML error correction",
        ],
      },
    ],
  },
  {
    category: "Technology Services",
    items: [
      {
        title: "AI in IoT",
        description:
          "End-to-end IoT ecosystems with sensor integration, edge computing, and real-time analytics.",
        gradient: "from-teal-500 to-cyan-600",
        useCases: [
          "AI anomaly detection on real-time sensor streams",
          "Predictive maintenance with IoT + ML models",
          "RAG-powered IoT knowledge base for troubleshooting",
          "Edge AI inference for low-latency IoT decisions",
          "Digital twin simulation with AI optimization",
          "AI-driven energy optimization in smart buildings",
          "Wearable health monitoring with on-device AI",
          "IoT fleet management with AI route optimization",
        ],
      },
      {
        title: "AI in Robotics",
        description:
          "Industrial AI, mobile robots, healthcare robotics, and microrobotics solutions.",
        gradient: "from-orange-500 to-red-600",
        useCases: [
          "AI-powered autonomous navigation (SLAM, path planning)",
          "Computer vision quality inspection on assembly lines",
          "Multi-robot fleet coordination with reinforcement learning",
          "Surgical robot planning & real-time AI guidance",
          "AI-driven predictive maintenance for robotic arms",
          "Autonomous mobile robots (AMRs) for warehousing",
          "Microrobotics for targeted drug delivery",
          "Swarm intelligence for distributed robotic sensing",
        ],
      },
      {
        title: "AI in Generative AI",
        description:
          "Custom LLMs, RAG pipelines, AI agents, chatbots, and content automation at scale.",
        gradient: "from-violet-500 to-purple-600",
        useCases: [
          "Custom LLM fine-tuning for domain-specific tasks",
          "RAG pipelines for enterprise knowledge retrieval",
          "Multi-modal AI (text, image, audio, video generation)",
          "AI agent orchestration for complex workflows",
          "Automated code generation, review & testing",
          "GenAI-powered document summarization & Q&A",
          "Conversational AI chatbots with context memory",
          "Responsible AI guardrails & bias detection",
        ],
      },
      {
        title: "AI in Computer Vision",
        description:
          "Object detection, medical imaging, quality inspection, and video analytics solutions.",
        gradient: "from-emerald-500 to-green-600",
        useCases: [
          "Real-time object detection & tracking systems",
          "AI-powered medical image analysis (X-ray, MRI, CT)",
          "Automated defect detection in manufacturing",
          "Video analytics for security & surveillance",
          "OCR & intelligent document processing",
          "Face recognition & biometric authentication",
          "Autonomous vehicle perception & scene understanding",
          "Synthetic data generation for CV model training",
        ],
      },
      {
        title: "AI in Embedded & Edge",
        description:
          "TinyML, wearable devices, RTOS firmware, and on-device inference for edge deployments.",
        gradient: "from-pink-500 to-rose-600",
        useCases: [
          "TinyML model deployment on microcontrollers",
          "On-device AI inference for real-time wearable analytics",
          "AI model compression & quantization for edge",
          "FPGA-accelerated deep learning at the edge",
          "AI-powered voice & gesture recognition on-device",
          "Predictive maintenance on embedded industrial controllers",
          "Battery-optimized AI for low-power wearables",
          "Edge AI for automotive ADAS & in-cabin monitoring",
        ],
      },
      {
        title: "AI in Quantum Computing",
        description:
          "Quantum algorithms, quantum security, post-quantum cryptography, and hybrid solutions.",
        gradient: "from-indigo-500 to-blue-700",
        useCases: [
          "Quantum machine learning (QML) model development",
          "Quantum Key Distribution (QKD) for secure communication",
          "Post-quantum cryptography assessment & migration",
          "Hybrid quantum-classical optimization algorithms",
          "Quantum-enhanced drug discovery & molecular simulation",
          "Quantum portfolio optimization for finance",
          "Quantum random number generation for encryption",
          "Quantum-safe encryption protocol implementation",
        ],
      },
      {
        title: "AI in Automation",
        description:
          "Intelligent process automation combining RPA, n8n workflows, AI agents, and hyperautomation to eliminate manual tasks at scale.",
        gradient: "from-yellow-500 to-amber-600",
        useCases: [
          "n8n workflow automation & multi-system integration",
          "AI-powered RPA (UiPath, Automation Anywhere, Power Automate)",
          "Intelligent document processing & data extraction",
          "Workflow orchestration with AI decision engines",
          "Automated invoice processing & accounts payable",
          "AI email classification, routing & auto-response",
          "AI-driven IT operations automation (AIOps)",
          "Hyperautomation with AI agents & low-code platforms",
        ],
      },
      {
        title: "AI in Voice",
        description:
          "Voice AI solutions including speech recognition, voice assistants, conversational IVR, and voice biometrics.",
        gradient: "from-fuchsia-500 to-pink-600",
        useCases: [
          "Custom voice assistant development (Alexa, Google, Siri)",
          "AI-powered speech-to-text & transcription services",
          "Conversational IVR with natural language understanding",
          "Voice biometrics for authentication & security",
          "Real-time voice translation & multilingual support",
          "Voice sentiment analysis for call centers",
          "Text-to-speech with custom AI voice cloning",
          "Voice-enabled robotic process automation",
        ],
      },
      {
        title: "AI Governance & Responsible AI",
        description:
          "End-to-end AI governance frameworks — responsible, explainable, ethical, and compliant AI aligned with ISO 42001, ISO 45001, and global regulations.",
        gradient: "from-gray-600 to-slate-800",
        useCases: [
          "AI governance framework design (ISO 42001 compliance)",
          "Explainable AI (XAI) model interpretability solutions",
          "Responsible AI bias detection & fairness auditing",
          "Ethical AI policy development & review boards",
          "AI risk assessment & impact analysis (ISO 45001)",
          "Model portability & interoperability standards",
          "Robust AI adversarial testing & resilience validation",
          "Trustworthy AI certification & compliance reporting",
        ],
      },
      {
        title: "AI in Digital Marketing",
        description:
          "AI-powered digital marketing across SEO, social media, content, paid ads, and conversion optimization.",
        gradient: "from-rose-500 to-red-600",
        useCases: [
          "AI-driven SEO keyword research & content optimization",
          "Programmatic ad buying with ML bid optimization",
          "GenAI social media content creation & scheduling",
          "Predictive audience targeting & lookalike modeling",
          "AI-powered email marketing personalization & send-time optimization",
          "Conversion rate optimization with ML A/B testing",
          "AI influencer identification & campaign analytics",
          "Automated performance reporting with GenAI insights",
        ],
      },
      {
        title: "AI in Recruitment",
        description:
          "End-to-end AI-powered recruitment — from sourcing and screening to interviewing and onboarding.",
        gradient: "from-lime-500 to-green-600",
        useCases: [
          "AI resume parsing, screening & candidate ranking",
          "GenAI job description generation & optimization",
          "AI-powered candidate sourcing from multiple platforms",
          "Video interview analysis with sentiment & body language AI",
          "Candidate-job fit prediction & skills matching",
          "Diversity hiring analytics & bias-free screening",
          "Chatbot pre-screening & interview scheduling",
          "Predictive offer acceptance & onboarding optimization",
        ],
      },
      {
        title: "AI in Smart Building",
        description:
          "Intelligent building management with AI-driven HVAC, lighting, security, and occupancy optimization.",
        gradient: "from-teal-600 to-emerald-700",
        useCases: [
          "AI-optimized HVAC for energy efficiency & comfort",
          "Smart lighting control with occupancy & daylight sensing",
          "Predictive maintenance for elevators, HVAC & electrical systems",
          "AI-powered security with facial recognition & anomaly detection",
          "Occupancy analytics & space utilization optimization",
          "Indoor air quality monitoring & AI-driven ventilation",
          "Digital twin simulation for building performance",
          "AI-based fire detection & emergency response coordination",
        ],
      },
      {
        title: "AI in Energy Consumption",
        description:
          "AI-driven energy management for optimization, forecasting, renewable integration, and carbon reduction.",
        gradient: "from-green-500 to-teal-600",
        useCases: [
          "AI energy consumption forecasting & demand prediction",
          "Real-time energy anomaly detection & waste reduction",
          "Smart grid optimization with ML load balancing",
          "Renewable energy output prediction (solar, wind)",
          "AI-powered carbon footprint tracking & reduction",
          "EV charging station optimization with demand AI",
          "Building energy benchmarking & efficiency scoring",
          "AI-driven energy trading & procurement optimization",
        ],
      },
      {
        title: "AI in Cloud (AWS, Azure, GCP)",
        description:
          "Cloud-native AI solutions across AWS, Azure, and GCP — from MLOps pipelines to serverless AI deployments.",
        gradient: "from-slate-500 to-gray-700",
        useCases: [
          "AWS SageMaker ML model training & deployment",
          "Azure OpenAI Service & Cognitive Services integration",
          "Google Vertex AI & BigQuery ML pipelines",
          "Multi-cloud AI infrastructure & orchestration",
          "Cloud-native MLOps with CI/CD for ML models",
          "Serverless AI inference with Lambda/Functions/Cloud Run",
          "Cloud data lakehouse for AI (S3, ADLS, GCS)",
          "Kubernetes-based AI workload orchestration (EKS, AKS, GKE)",
        ],
      },
      {
        title: "AI in Microfluidics",
        description:
          "Lab-on-chip systems, point-of-care diagnostics, organ-on-chip, and AI-driven micro-analysis.",
        gradient: "from-sky-500 to-blue-600",
        useCases: [
          "AI-driven droplet detection & flow control",
          "ML-based point-of-care diagnostic analysis",
          "AI image analysis for cell sorting & counting",
          "Predictive modeling for organ-on-chip drug testing",
          "AI-powered contaminant detection in water testing",
          "GenAI-generated experimental protocols & reports",
          "ML-optimized microfluidic chip design",
          "Real-time AI analysis of microfluidic assay results",
        ],
      },
    ],
  },
];

export default function Services() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <section id="services" className="py-24 bg-primary mesh-gradient-1 section-glow-top relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            What We Do
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our Services
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            We deliver end-to-end AI-powered solutions that transform how
            businesses operate across technology and industries.
          </p>
        </motion.div>

        {serviceCategories.map((cat, catIdx) => (
          <div key={cat.category} className={catIdx > 0 ? "mt-16" : ""}>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-xl font-bold text-white mb-6 flex items-center gap-3"
            >
              <span className="w-8 h-1 bg-accent rounded-full" />
              {cat.category}
            </motion.h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cat.items.map((service, i) => {
                const isExpanded = expandedCard === service.title;
                return (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className={`bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-lg group transition-all ${
                      isExpanded ? "sm:col-span-2 lg:col-span-2" : "card-hover glow-card"
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${service.gradient} p-4 relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                      <div className="relative flex items-center justify-between">
                        <h4 className="text-white font-bold text-sm">
                          {service.title}
                        </h4>
                        <button
                          onClick={() =>
                            setExpandedCard(isExpanded ? null : service.title)
                          }
                          className="text-white/80 hover:text-white transition-colors text-xs flex items-center gap-1 bg-white/15 rounded-lg px-2.5 py-1"
                        >
                          {isExpanded ? "Less" : "Use Cases"}
                          <svg
                            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-white/60 text-sm leading-relaxed">
                        {service.description}
                      </p>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
                                AI Use Cases
                              </p>
                              <ul className="space-y-2">
                                {service.useCases.map((uc, j) => (
                                  <motion.li
                                    key={j}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: j * 0.04, duration: 0.2 }}
                                    className="flex items-start gap-2"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5"
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
                                    <span className="text-xs text-white/60">{uc}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
