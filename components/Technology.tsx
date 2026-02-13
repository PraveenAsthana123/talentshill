"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const technologies = [
  {
    id: "iot",
    label: "IoT",
    icon: "📡",
    color: "from-teal-500 to-cyan-600",
    tagColor: "bg-teal-100 text-teal-700",
    title: "Internet of Things",
    tagline: "Connected Intelligence at Scale",
    description:
      "We design and deploy end-to-end IoT ecosystems with AI/RAG-powered analytics — from smart buildings and wearables to industrial IoT and connected healthcare.",
    capabilities: [
      "IoT platform architecture & development",
      "Sensor integration & edge computing",
      "Real-time data streaming & processing",
      "Device management & OTA updates",
      "IoT security & compliance frameworks",
      "Digital twin modeling & simulation",
    ],
    departments: [
      {
        name: "IoT + AI/RAG Use Cases",
        useCases: [
          "RAG-powered IoT knowledge base for device troubleshooting",
          "AI anomaly detection on real-time sensor streams",
          "GenAI-generated maintenance reports from IoT data",
          "Conversational AI assistant for IoT fleet management",
          "RAG-based root cause analysis from IoT event logs",
          "AI-driven predictive maintenance with sensor fusion",
        ],
      },
      {
        name: "Wearable Devices",
        useCases: [
          "AI health monitoring (heart rate, SpO2, ECG, temperature)",
          "Fall detection & emergency alert wearables",
          "Fitness tracking with personalized AI coaching",
          "Industrial safety wearables (gas, vibration, fatigue)",
          "Smart glasses with AR overlay & AI assistance",
          "Sleep quality analysis & circadian rhythm optimization",
        ],
      },
      {
        name: "Smart Infrastructure",
        useCases: [
          "Smart building HVAC, lighting & occupancy optimization",
          "Industrial IoT equipment monitoring & predictive maintenance",
          "Smart agriculture soil monitoring & irrigation automation",
          "Fleet management with vehicle tracking & route optimization",
          "Smart city traffic, waste & energy management",
          "Connected healthcare remote patient monitoring & asset tracking",
        ],
      },
    ],
    stats: [
      { value: "10B+", label: "Devices Connected Globally" },
      { value: "40%", label: "Energy Savings Achieved" },
      { value: "99.9%", label: "Uptime SLA" },
    ],
  },
  {
    id: "robotics",
    label: "Robotics",
    icon: "🤖",
    color: "from-orange-500 to-red-600",
    tagColor: "bg-orange-100 text-orange-700",
    title: "Robotics & Automation",
    tagline: "Intelligent Machines, Smarter Operations",
    description:
      "From industrial AI-driven automation and autonomous mobile robots to healthcare robotics and microrobotics, we build intelligent robotics solutions across every scale.",
    capabilities: [
      "Autonomous navigation (SLAM, path planning)",
      "Collaborative robot (cobot) programming",
      "Fleet orchestration & multi-robot coordination",
      "Robot-as-a-Service (RaaS) platforms",
      "Simulation & digital twin for robotics",
      "Microrobotics design & control systems",
    ],
    departments: [
      {
        name: "Industrial AI",
        useCases: [
          "AI-driven predictive maintenance for robotic arms",
          "Computer vision quality inspection on assembly lines",
          "Automated welding, painting & material handling",
          "Digital twin simulation for factory optimization",
          "AI-based process control and yield optimization",
        ],
      },
      {
        name: "Mobile AI",
        useCases: [
          "Autonomous mobile robots (AMRs) for warehousing",
          "Last-mile delivery robots & drones",
          "Fleet management & multi-robot coordination",
          "SLAM-based autonomous navigation systems",
          "AI-powered route optimization & obstacle avoidance",
        ],
      },
      {
        name: "Healthcare AI",
        useCases: [
          "Surgical robot planning & real-time guidance",
          "Automated pharmacy dispensing & medication delivery",
          "Robotic rehabilitation & physiotherapy assistants",
          "AI-powered endoscopy & diagnostic robotics",
          "Hospital logistics robots for supplies & specimens",
        ],
      },
      {
        name: "Microrobotics",
        useCases: [
          "Microrobots for targeted drug delivery",
          "Micro-assembly for semiconductor & MEMS manufacturing",
          "Swarm microrobotics for distributed sensing",
          "Lab-on-chip manipulation & microfluidic handling",
          "Minimally invasive surgical microrobots",
        ],
      },
    ],
    stats: [
      { value: "300%", label: "Throughput Increase" },
      { value: "24/7", label: "Autonomous Operation" },
      { value: "60%", label: "Labor Cost Reduction" },
    ],
  },
  {
    id: "embedded",
    label: "Embedded",
    icon: "⚙️",
    color: "from-pink-500 to-rose-600",
    tagColor: "bg-pink-100 text-pink-700",
    title: "Embedded Systems & AI",
    tagline: "Intelligence at the Edge",
    description:
      "We develop embedded AI solutions that bring machine learning to resource-constrained devices — from wearables and medical devices to automotive and industrial controllers.",
    capabilities: [
      "TinyML & on-device inference optimization",
      "FPGA & custom hardware accelerator design",
      "Real-Time Operating Systems (RTOS) development",
      "Firmware development (ARM, RISC-V, ESP32)",
      "Low-power design & battery optimization",
      "Edge AI model compression & quantization",
    ],
    applications: [
      { name: "Wearables", desc: "Health monitoring, fitness, safety devices" },
      { name: "Medical Devices", desc: "Point-of-care diagnostics, implants" },
      { name: "Automotive", desc: "ADAS, in-cabin monitoring, ECU development" },
      { name: "Industrial Controllers", desc: "PLCs, motor drives, process control" },
      { name: "Consumer Electronics", desc: "Smart home, voice assistants, cameras" },
      { name: "Defense & Aerospace", desc: "Navigation, communication, surveillance" },
    ],
    stats: [
      { value: "<1ms", label: "Inference Latency" },
      { value: "10x", label: "Battery Life Extension" },
      { value: "95%+", label: "Model Accuracy on Edge" },
    ],
  },
  {
    id: "quantum",
    label: "Quantum",
    icon: "⚛️",
    color: "from-indigo-500 to-blue-700",
    tagColor: "bg-indigo-100 text-indigo-700",
    title: "Quantum Computing",
    tagline: "Beyond Classical Limits",
    description:
      "We help organizations prepare for and leverage quantum computing through algorithm development, hybrid classical-quantum solutions, and quantum-readiness consulting — with deep expertise in quantum security.",
    capabilities: [
      "Quantum algorithm design & optimization",
      "Hybrid quantum-classical computing pipelines",
      "Quantum machine learning (QML) models",
      "Quantum cryptography & post-quantum security",
      "Quantum simulation for materials & chemistry",
      "Quantum-readiness assessment & roadmapping",
    ],
    departments: [
      {
        name: "Quantum Security",
        useCases: [
          "Quantum Key Distribution (QKD) for secure communication",
          "Post-quantum cryptography migration & assessment",
          "Quantum random number generation (QRNG) for encryption",
          "Quantum-safe TLS/SSL protocol implementation",
          "Crypto-agility frameworks for quantum readiness",
          "Quantum-resistant digital signatures & PKI",
          "Secure multi-party computation with quantum protocols",
          "Quantum threat modeling for enterprise infrastructure",
        ],
      },
      {
        name: "Quantum Applications",
        useCases: [
          "Drug discovery & molecular simulation",
          "Financial portfolio optimization & risk modeling",
          "Supply chain combinatorial optimization",
          "Materials science property prediction",
          "Climate modeling & complex system simulation",
          "Quantum-enhanced machine learning models",
        ],
      },
    ],
    stats: [
      { value: "1000x", label: "Speedup Potential" },
      { value: "100+", label: "Qubit Systems Supported" },
      { value: "5+", label: "Quantum Platforms" },
    ],
  },
  {
    id: "automation",
    label: "Automation",
    icon: "⚡",
    color: "from-yellow-500 to-amber-600",
    tagColor: "bg-yellow-100 text-yellow-700",
    title: "Intelligent Automation",
    tagline: "Automate Everything with AI",
    description:
      "We build intelligent automation solutions combining RPA, AI agents, n8n workflows, and hyperautomation platforms to eliminate manual processes and accelerate business operations.",
    capabilities: [
      "n8n workflow automation & integration",
      "RPA bot development (UiPath, Automation Anywhere, Power Automate)",
      "AI agent orchestration for complex workflows",
      "Intelligent document processing (IDP)",
      "Low-code/no-code automation platforms",
      "Hyperautomation strategy & implementation",
    ],
    departments: [
      {
        name: "RPA & Process Automation",
        useCases: [
          "End-to-end invoice processing & accounts payable automation",
          "Automated data entry & cross-system migration",
          "Employee onboarding/offboarding workflow automation",
          "Claims processing automation for insurance",
          "Order-to-cash process automation",
          "Compliance reporting & audit trail generation",
        ],
      },
      {
        name: "n8n & Workflow Orchestration",
        useCases: [
          "n8n-based multi-system integration workflows",
          "Automated lead capture & CRM enrichment pipelines",
          "Event-driven notification & escalation workflows",
          "Scheduled data sync across SaaS platforms",
          "AI-powered email triage & auto-response workflows",
          "Custom API orchestration & webhook automation",
        ],
      },
      {
        name: "AI-Powered Automation",
        useCases: [
          "Intelligent document classification & data extraction",
          "AI email classification, routing & auto-response",
          "GenAI-powered report generation & summarization",
          "AI chatbot-driven process initiation & task routing",
          "ML-based anomaly detection in automated pipelines",
          "AI decision engines for approval workflows",
        ],
      },
      {
        name: "Hyperautomation & AIOps",
        useCases: [
          "Process mining & discovery for automation candidates",
          "IT operations automation (AIOps) with ML",
          "Automated test execution & QA with AI",
          "Self-healing infrastructure automation",
          "CI/CD pipeline automation with AI code review",
          "Autonomous monitoring, alerting & remediation",
        ],
      },
    ],
    stats: [
      { value: "80%", label: "Manual Task Reduction" },
      { value: "10x", label: "Process Speed" },
      { value: "99%", label: "Accuracy Rate" },
    ],
  },
  {
    id: "genai",
    label: "Generative AI",
    icon: "🧠",
    color: "from-violet-500 to-purple-600",
    tagColor: "bg-violet-100 text-violet-700",
    title: "Generative AI",
    tagline: "Create, Transform, Automate",
    description:
      "We build and deploy generative AI solutions powered by large language models, diffusion models, and multi-modal AI — from intelligent chatbots to content generation and code automation.",
    capabilities: [
      "Custom LLM fine-tuning & deployment",
      "RAG (Retrieval-Augmented Generation) pipelines",
      "Multi-modal AI (text, image, audio, video)",
      "AI agent & workflow orchestration",
      "Prompt engineering & optimization",
      "Responsible AI guardrails & evaluation",
    ],
    applications: [
      { name: "Chatbots & Assistants", desc: "Customer support, internal help desks" },
      { name: "Content Generation", desc: "Marketing copy, reports, documentation" },
      { name: "Code Automation", desc: "Code generation, review, testing" },
      { name: "Document Intelligence", desc: "Extraction, summarization, Q&A" },
      { name: "Creative AI", desc: "Image, video, and audio generation" },
      { name: "Knowledge Management", desc: "Enterprise search, insights extraction" },
    ],
    stats: [
      { value: "60%", label: "Cost Reduction" },
      { value: "50+", label: "Languages Supported" },
      { value: "10x", label: "Content Velocity" },
    ],
  },
  {
    id: "microfluidics",
    label: "Microfluidics",
    icon: "🔬",
    color: "from-sky-500 to-blue-600",
    tagColor: "bg-sky-100 text-sky-700",
    title: "Microfluidics & Lab-on-Chip",
    tagline: "Precision at the Microscale",
    description:
      "We design AI-integrated microfluidic systems for diagnostics, drug discovery, and environmental monitoring — enabling rapid, low-cost analysis with minimal sample volumes.",
    capabilities: [
      "Microfluidic chip design & fabrication",
      "Lab-on-chip (LoC) system development",
      "AI-powered droplet & flow control",
      "Point-of-care diagnostic device integration",
      "Organ-on-chip modeling for drug testing",
      "Microfluidic sensor fusion & analytics",
    ],
    applications: [
      { name: "Point-of-Care Diagnostics", desc: "Rapid blood tests, pathogen detection" },
      { name: "Drug Discovery", desc: "High-throughput screening, dose optimization" },
      { name: "Organ-on-Chip", desc: "Liver, lung, heart tissue modeling" },
      { name: "Environmental Testing", desc: "Water quality, contaminant detection" },
      { name: "Cell Analysis", desc: "Single-cell sorting, genomic analysis" },
      { name: "Food Safety", desc: "Rapid toxin & allergen detection" },
    ],
    stats: [
      { value: "100x", label: "Faster Analysis" },
      { value: "<1μL", label: "Sample Volume" },
      { value: "95%+", label: "Diagnostic Accuracy" },
    ],
  },
  {
    id: "cv",
    label: "Computer Vision",
    icon: "👁️",
    color: "from-emerald-500 to-green-600",
    tagColor: "bg-emerald-100 text-emerald-700",
    title: "Computer Vision",
    tagline: "Machines That See & Understand",
    description:
      "We develop computer vision solutions that enable machines to interpret visual data — from real-time object detection and tracking to medical imaging and quality inspection.",
    capabilities: [
      "Object detection, segmentation & tracking",
      "Image classification & recognition",
      "Video analytics & activity recognition",
      "3D reconstruction & depth estimation",
      "OCR & document understanding",
      "Synthetic data generation for training",
    ],
    applications: [
      { name: "Quality Inspection", desc: "Defect detection, surface analysis" },
      { name: "Medical Imaging", desc: "Radiology, pathology, ophthalmology AI" },
      { name: "Autonomous Vehicles", desc: "Perception, lane detection, obstacles" },
      { name: "Retail Analytics", desc: "Shelf monitoring, footfall, loss prevention" },
      { name: "Security & Surveillance", desc: "Face recognition, anomaly detection" },
      { name: "Agriculture", desc: "Crop health, pest detection, yield estimation" },
    ],
    stats: [
      { value: "99.5%", label: "Detection Accuracy" },
      { value: "30fps", label: "Real-Time Processing" },
      { value: "50%", label: "Defect Reduction" },
    ],
  },
  {
    id: "voiceai",
    label: "Voice AI",
    icon: "🎙️",
    color: "from-fuchsia-500 to-pink-600",
    tagColor: "bg-fuchsia-100 text-fuchsia-700",
    title: "Voice AI",
    tagline: "Speak, Listen, Understand",
    description:
      "We build end-to-end Voice AI solutions — from speech recognition and voice assistants to conversational IVR, voice biometrics, and real-time multilingual translation.",
    capabilities: [
      "Automatic speech recognition (ASR) & STT",
      "Text-to-speech (TTS) with custom voice synthesis",
      "Natural language understanding (NLU) for voice",
      "Voice biometrics & speaker identification",
      "Real-time voice translation & localization",
      "Conversational AI & dialogue management",
    ],
    departments: [
      {
        name: "Voice Assistants & IVR",
        useCases: [
          "Custom voice assistant development (Alexa, Google, Siri)",
          "Conversational IVR with natural language understanding",
          "Voice-enabled customer self-service portals",
          "Multi-turn dialogue management for complex queries",
          "Voice-driven appointment booking & scheduling",
          "Proactive outbound voice AI for reminders & surveys",
        ],
      },
      {
        name: "Speech Analytics & Security",
        useCases: [
          "Real-time call center speech analytics & coaching",
          "Voice sentiment & emotion analysis during calls",
          "Voice biometrics for secure authentication",
          "Automated call transcription & summarization",
          "Compliance monitoring & keyword detection in calls",
          "Speaker diarization & multi-party meeting analysis",
        ],
      },
      {
        name: "Voice Generation & Translation",
        useCases: [
          "Custom AI voice cloning for brand identity",
          "Real-time multilingual voice translation",
          "AI-powered podcast & audiobook narration",
          "Voice-enabled robotic process automation",
          "Accessibility solutions with voice AI (screen readers)",
          "Voice-driven content creation & dictation",
        ],
      },
    ],
    stats: [
      { value: "95%+", label: "Recognition Accuracy" },
      { value: "50+", label: "Languages Supported" },
      { value: "<200ms", label: "Response Latency" },
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    icon: "☁️",
    color: "from-slate-500 to-gray-700",
    tagColor: "bg-slate-100 text-slate-700",
    title: "Cloud Services (AWS, Azure, GCP)",
    tagline: "AI-Native Cloud Infrastructure",
    description:
      "We architect and deploy cloud-native AI solutions across AWS, Azure, and Google Cloud — from MLOps pipelines and data lakehouses to serverless AI inference at scale.",
    capabilities: [
      "Multi-cloud architecture & strategy",
      "MLOps pipeline design & automation",
      "Cloud data lakehouse & warehousing",
      "Serverless & containerized AI deployments",
      "Cloud security & compliance (SOC2, HIPAA, GDPR)",
      "FinOps & cloud cost optimization",
    ],
    departments: [
      {
        name: "AWS AI Services",
        useCases: [
          "Amazon SageMaker ML model training & deployment",
          "AWS Bedrock for managed GenAI & foundation models",
          "Amazon Rekognition for computer vision workloads",
          "AWS Lambda serverless AI inference pipelines",
          "Amazon S3 + Glue data lakehouse for ML",
          "Amazon EKS for containerized AI workloads",
        ],
      },
      {
        name: "Azure AI Services",
        useCases: [
          "Azure OpenAI Service for GPT & DALL-E integration",
          "Azure Machine Learning for enterprise MLOps",
          "Azure Cognitive Services (Speech, Vision, Language)",
          "Azure Functions serverless AI endpoints",
          "Azure Synapse Analytics for big data ML",
          "AKS-based AI workload orchestration",
        ],
      },
      {
        name: "Google Cloud AI",
        useCases: [
          "Vertex AI for end-to-end ML lifecycle management",
          "BigQuery ML for in-database machine learning",
          "Google Cloud Vision & Natural Language APIs",
          "Cloud Run serverless AI model serving",
          "Gemini API integration for GenAI applications",
          "GKE Autopilot for scalable AI workloads",
        ],
      },
      {
        name: "Cloud MLOps & Data",
        useCases: [
          "CI/CD pipelines for ML model deployment",
          "Feature store design & management",
          "Model monitoring, drift detection & retraining",
          "Multi-cloud data mesh architecture",
          "Cloud-native data streaming (Kafka, Kinesis, Pub/Sub)",
          "FinOps AI cost optimization & governance",
        ],
      },
    ],
    stats: [
      { value: "3", label: "Cloud Platforms" },
      { value: "99.99%", label: "Uptime SLA" },
      { value: "60%", label: "Cost Optimization" },
    ],
  },
  {
    id: "governance",
    label: "AI Governance",
    icon: "🛡️",
    color: "from-gray-600 to-slate-800",
    tagColor: "bg-gray-100 text-white/70",
    title: "AI Governance & Responsible AI",
    tagline: "Trustworthy, Ethical, Compliant AI",
    description:
      "We help organizations build and deploy AI responsibly — with governance frameworks, explainability, ethical guidelines, and compliance aligned with ISO 42001, ISO 45001, and global AI regulations.",
    capabilities: [
      "AI governance framework design & implementation",
      "ISO 42001 AI Management System certification readiness",
      "Explainable AI (XAI) & model interpretability",
      "AI ethics policy development & advisory boards",
      "AI risk management & safety (ISO 45001 alignment)",
      "Regulatory compliance (EU AI Act, NIST AI RMF)",
    ],
    departments: [
      {
        name: "Responsible AI",
        useCases: [
          "Bias detection & fairness auditing across ML models",
          "Responsible AI impact assessments before deployment",
          "Data privacy & consent management for AI systems",
          "Inclusive AI design ensuring accessibility & equity",
          "Responsible data sourcing & labeling governance",
          "AI sustainability & carbon footprint measurement",
        ],
      },
      {
        name: "Explainable & Interpretable AI",
        useCases: [
          "SHAP & LIME model explanation dashboards",
          "Feature importance & decision path visualization",
          "Counterfactual explanations for end-user transparency",
          "Model-agnostic interpretability frameworks",
          "Automated model documentation & explainability reports",
          "Human-in-the-loop review workflows for AI decisions",
        ],
      },
      {
        name: "AI Compliance & Standards",
        useCases: [
          "ISO 42001 AI Management System gap analysis & implementation",
          "ISO 45001 occupational safety alignment for AI in workplace",
          "EU AI Act risk classification & compliance mapping",
          "NIST AI Risk Management Framework (AI RMF) adoption",
          "AI audit trail & model versioning for regulatory reporting",
          "Cross-border AI regulatory compliance (GDPR, CCPA, PDPA)",
        ],
      },
      {
        name: "Ethical AI",
        useCases: [
          "AI ethics board setup & governance charter design",
          "Ethical AI review process for high-risk applications",
          "Fairness-aware model training & constraint optimization",
          "Ethical guidelines for GenAI content generation",
          "Stakeholder transparency & AI disclosure frameworks",
          "Ethical AI training programs for engineering teams",
        ],
      },
      {
        name: "Robust & Trustworthy AI",
        useCases: [
          "Adversarial robustness testing & attack simulation",
          "Model drift detection & continuous monitoring",
          "AI system reliability & failure mode analysis",
          "Trustworthy AI scoring & certification frameworks",
          "AI model portability & interoperability standards",
          "Secure AI deployment with access control & encryption",
        ],
      },
      {
        name: "Portable & Interoperable AI",
        useCases: [
          "ONNX-based model portability across platforms",
          "Multi-cloud AI model deployment & migration",
          "Containerized AI model packaging (Docker, K8s)",
          "Federated learning for privacy-preserving AI",
          "Open-standard API design for AI interoperability",
          "Model registry & lifecycle management across environments",
        ],
      },
    ],
    stats: [
      { value: "ISO 42001", label: "AI Management" },
      { value: "ISO 45001", label: "Safety Aligned" },
      { value: "100%", label: "Audit Ready" },
    ],
  },
];

export default function Technology() {
  const [activeTab, setActiveTab] = useState(0);
  const tech = technologies[activeTab];

  return (
    <section id="technology" className="py-24 bg-primary dot-pattern relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Our Technology Stack
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Technology Expertise
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Deep expertise across cutting-edge technologies — from IoT and
            robotics to quantum computing and generative AI.
          </p>
        </motion.div>

        {/* Tech tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 rounded-2xl p-2 gap-1 flex-wrap justify-center">
            {technologies.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  i === activeTab
                    ? "bg-accent text-white shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tech content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero banner */}
            <div className={`bg-gradient-to-r ${tech.color} rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
              <div className="relative grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{tech.icon}</span>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {tech.title}
                      </h3>
                      <p className="text-white/70 text-sm">{tech.tagline}</p>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed text-lg">
                    {tech.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 md:justify-end">
                  {tech.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[100px]"
                    >
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-[11px] text-white/60 uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-8 mb-8"
            >
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Core Capabilities
              </h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tech.capabilities.map((cap, i) => (
                  <motion.div
                    key={cap}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/60 text-sm">{cap}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Department use cases (if available) */}
            {"departments" in tech && tech.departments && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {tech.departments.map((dept: { name: string; useCases: string[] }, i: number) => (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden card-hover glow-card"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${tech.tagColor}`}>
                          {dept.name}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {dept.useCases.map((uc: string, j: number) => (
                          <motion.li
                            key={j}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 + j * 0.03, duration: 0.2 }}
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
                            <span className="text-sm text-white/60">{uc}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Applications (if available) */}
            {"applications" in tech && tech.applications && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {tech.applications.map((app: { name: string; desc: string }, i: number) => (
                  <motion.div
                    key={app.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.2 }}
                    className={`${tech.tagColor.split(" ")[0]} border rounded-xl p-4 hover:shadow-md transition-shadow`}
                  >
                    <p className={`font-semibold text-sm ${tech.tagColor.split(" ")[1]}`}>
                      {app.name}
                    </p>
                    <p className="text-xs text-white/50 mt-1">{app.desc}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="text-center mt-10">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/30 cta-glow"
              >
                Discuss Your {tech.title} Project
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
