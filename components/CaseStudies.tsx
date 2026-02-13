"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Metric {
  value: string;
  label: string;
}

interface CaseStudy {
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  results: Metric[];
  technologies: string[];
  gradient: string;
  borderColor: string;
}

const caseStudies: CaseStudy[] = [
  {
    industry: "Healthcare",
    title: "AI-Powered Medical Imaging Diagnosis",
    challenge:
      "A leading hospital network was struggling with long radiology turnaround times, delayed diagnoses, and an increasing backlog of imaging studies. Radiologists were overwhelmed, and misdiagnosis rates were climbing due to fatigue and volume.",
    solution:
      "We developed a deep learning-based medical imaging analysis platform that assists radiologists by pre-screening X-rays, MRIs, and CT scans. The system flags anomalies, prioritizes urgent cases, and provides AI-generated diagnostic suggestions with explainability overlays.",
    results: [
      { value: "60%", label: "Reduction in Diagnosis Time" },
      { value: "95%", label: "Diagnostic Accuracy" },
      { value: "3x", label: "Radiologist Throughput" },
      { value: "40%", label: "Fewer Missed Findings" },
    ],
    technologies: [
      "PyTorch",
      "MONAI",
      "DICOM",
      "AWS SageMaker",
      "Computer Vision",
      "Explainable AI",
    ],
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-l-blue-500",
  },
  {
    industry: "Banking",
    title: "Real-Time Fraud Detection System",
    challenge:
      "A major financial institution faced escalating fraud losses exceeding $200M annually. Their legacy rule-based system generated excessive false positives, frustrating legitimate customers while sophisticated fraud patterns went undetected.",
    solution:
      "We built a real-time fraud detection engine using ensemble ML models and graph neural networks to analyze transaction patterns, device fingerprints, and behavioral biometrics. The system processes millions of transactions per second with sub-100ms latency.",
    results: [
      { value: "$50M+", label: "Fraud Prevented Annually" },
      { value: "99.7%", label: "Detection Rate" },
      { value: "80%", label: "Fewer False Positives" },
      { value: "<50ms", label: "Detection Latency" },
    ],
    technologies: [
      "TensorFlow",
      "Apache Kafka",
      "Graph Neural Networks",
      "Redis",
      "Kubernetes",
      "Azure ML",
    ],
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-l-emerald-500",
  },
  {
    industry: "Manufacturing",
    title: "Predictive Maintenance for Smart Factory",
    challenge:
      "A global manufacturing company experienced frequent unplanned equipment failures causing costly production halts, safety hazards, and missed delivery deadlines. Reactive maintenance was draining resources and impacting profitability.",
    solution:
      "We deployed an IoT-integrated predictive maintenance platform that collects sensor data from 500+ machines, applies anomaly detection and remaining useful life (RUL) prediction models, and generates proactive maintenance schedules with automated work orders.",
    results: [
      { value: "45%", label: "Downtime Reduction" },
      { value: "$12M", label: "Annual Cost Savings" },
      { value: "30%", label: "Extended Equipment Life" },
      { value: "92%", label: "Prediction Accuracy" },
    ],
    technologies: [
      "IoT Sensors",
      "Apache Spark",
      "LSTM Networks",
      "Digital Twin",
      "AWS IoT Core",
      "Grafana",
    ],
    gradient: "from-orange-500 to-red-600",
    borderColor: "border-l-orange-500",
  },
  {
    industry: "Retail",
    title: "Personalized Customer Experience Engine",
    challenge:
      "A major e-commerce retailer was losing customers to competitors due to generic product recommendations, irrelevant marketing emails, and a one-size-fits-all shopping experience that failed to engage diverse customer segments.",
    solution:
      "We built a real-time personalization engine that leverages collaborative filtering, NLP-based product understanding, and customer journey analysis to deliver hyper-personalized product recommendations, dynamic pricing, and individualized content across all touchpoints.",
    results: [
      { value: "35%", label: "Conversion Rate Increase" },
      { value: "28%", label: "Higher Average Order Value" },
      { value: "50%", label: "Improved Email CTR" },
      { value: "22%", label: "Customer Retention Lift" },
    ],
    technologies: [
      "Python",
      "Recommendation Systems",
      "NLP",
      "Google BigQuery",
      "Vertex AI",
      "A/B Testing",
    ],
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-l-violet-500",
  },
  {
    industry: "Oil & Gas",
    title: "AI Pipeline Monitoring & Leak Detection",
    challenge:
      "An energy company operating thousands of miles of pipelines faced environmental and safety risks from undetected leaks. Traditional inspection methods were slow, expensive, and unable to provide continuous real-time monitoring across remote terrains.",
    solution:
      "We developed an AI-powered pipeline monitoring system combining satellite imagery analysis, acoustic sensor data, and pressure flow modeling to detect and localize leaks in real time. The platform provides automated alerts, risk heat maps, and regulatory compliance reporting.",
    results: [
      { value: "90%", label: "Faster Leak Detection" },
      { value: "Zero", label: "Major Environmental Incidents" },
      { value: "65%", label: "Inspection Cost Reduction" },
      { value: "24/7", label: "Continuous Monitoring" },
    ],
    technologies: [
      "Satellite Imagery",
      "Edge AI",
      "Acoustic ML",
      "Azure IoT Hub",
      "SCADA Integration",
      "GIS Mapping",
    ],
    gradient: "from-yellow-500 to-amber-600",
    borderColor: "border-l-yellow-500",
  },
  {
    industry: "Insurance",
    title: "Automated Claims Processing with GenAI",
    challenge:
      "A national insurance provider was drowning in manual claims processing, with average resolution times of 15+ days. Customer satisfaction was declining, operational costs were soaring, and skilled adjusters were spending most of their time on routine low-complexity claims.",
    solution:
      "We implemented a GenAI-powered claims automation platform that uses LLMs for document extraction, damage assessment from photos, policy cross-referencing, and automated decision-making for straightforward claims while routing complex cases to human adjusters with AI-prepared summaries.",
    results: [
      { value: "70%", label: "Processing Time Reduction" },
      { value: "85%", label: "Auto-Resolution Rate" },
      { value: "$8M", label: "Annual OpEx Savings" },
      { value: "4.8/5", label: "Customer Satisfaction" },
    ],
    technologies: [
      "GPT-4",
      "RAG Pipeline",
      "Computer Vision",
      "LangChain",
      "AWS Bedrock",
      "Document AI",
    ],
    gradient: "from-pink-500 to-rose-600",
    borderColor: "border-l-pink-500",
  },
];

export default function CaseStudies() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  return (
    <section id="case-studies" className="py-24 bg-primary mesh-gradient-1 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Case Studies
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Real-world results from our AI consulting engagements across
            industries. See how we help organizations unlock measurable value
            with intelligent solutions.
          </p>
        </motion.div>

        {/* Case Study Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {caseStudies.map((study, index) => {
            const isExpanded = expandedId === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden border-l-4 ${study.borderColor} transition-all duration-300 ${
                  isExpanded ? "md:col-span-2" : "card-hover glow-card"
                }`}
              >
                {/* Card Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <span
                        className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${study.gradient} text-white mb-3`}
                      >
                        {study.industry}
                      </span>
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {study.title}
                      </h3>
                    </div>
                    <button
                      className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors mt-1"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Preview metrics (visible when collapsed) */}
                  {!isExpanded && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      {study.results.slice(0, 2).map((metric, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold bg-gradient-to-r ${study.gradient} bg-clip-text text-transparent`}
                          >
                            {metric.value}
                          </span>
                          <span className="text-xs text-white/60">
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-white/10 pt-6">
                          {/* Challenge & Solution */}
                          <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1, duration: 0.3 }}
                            >
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </span>
                                The Challenge
                              </h4>
                              <p className="text-sm text-white/60 leading-relaxed">
                                {study.challenge}
                              </p>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15, duration: 0.3 }}
                            >
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-green-500"
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
                                </span>
                                Our Solution
                              </h4>
                              <p className="text-sm text-white/60 leading-relaxed">
                                {study.solution}
                              </p>
                            </motion.div>
                          </div>

                          {/* Results Metrics */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="mb-8"
                          >
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                              Key Results
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {study.results.map((metric, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: 0.25 + i * 0.05,
                                    duration: 0.3,
                                  }}
                                  className="bg-white/10 rounded-xl p-4 text-center"
                                >
                                  <p
                                    className={`text-2xl font-bold bg-gradient-to-r ${study.gradient} bg-clip-text text-transparent`}
                                  >
                                    {metric.value}
                                  </p>
                                  <p className="text-xs text-white/60 mt-1">
                                    {metric.label}
                                  </p>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Technologies Used */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                          >
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                              Technologies Used
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {study.technologies.map((tech, i) => (
                                <motion.span
                                  key={i}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: 0.35 + i * 0.04,
                                    duration: 0.2,
                                  }}
                                  className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-white/10 text-white/80 border border-white/10 hover:border-accent hover:text-accent transition-colors"
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
