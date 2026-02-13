"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const phases = [
  {
    id: "brd",
    number: "01",
    title: "Business Requirements (BRD)",
    tagline: "Defining What to Build",
    color: "from-blue-500 to-indigo-600",
    ring: "ring-blue-500/40",
    duration: "Week 1-2",
    milestone: "BRD Sign-off",
    input: [
      "Stakeholder interviews & pain points",
      "Business objectives & KPIs",
      "Market research & competitor analysis",
      "Regulatory & compliance requirements",
    ],
    process: [
      "Requirements gathering workshops",
      "User story mapping & persona creation",
      "Functional & non-functional requirement analysis",
      "Prioritization (MoSCoW method)",
      "Feasibility & ROI assessment",
    ],
    output: [
      "Business Requirements Document (BRD)",
      "User Stories & Acceptance Criteria",
      "Requirements Traceability Matrix",
      "Stakeholder Sign-off Sheet",
    ],
    visualization: {
      type: "flow",
      label: "Requirements Flow",
      nodes: ["Stakeholders", "Workshops", "Analysis", "BRD Document"],
      description: "Structured flow from stakeholder needs to formal requirements documentation",
    },
  },
  {
    id: "hld",
    number: "02",
    title: "High-Level Design (HLD)",
    tagline: "Architecting the Big Picture",
    color: "from-cyan-500 to-teal-600",
    ring: "ring-cyan-500/40",
    duration: "Week 2-3",
    milestone: "Architecture Approval",
    input: [
      "Approved BRD & requirements matrix",
      "Technology stack preferences",
      "Infrastructure constraints & budget",
      "Scalability & performance targets",
    ],
    process: [
      "System architecture design",
      "Component identification & interaction mapping",
      "Technology selection & evaluation",
      "Security architecture & threat modeling",
      "Integration pattern definition (APIs, events, batch)",
    ],
    output: [
      "High-Level Design Document (HLD)",
      "System Architecture Diagrams",
      "Technology Stack Decision Matrix",
      "Integration Architecture Map",
    ],
    visualization: {
      type: "architecture",
      label: "System Architecture",
      nodes: ["Frontend", "API Gateway", "Microservices", "Data Layer", "Cloud Infra"],
      description: "Bird's-eye view of system components and their interactions",
    },
  },
  {
    id: "lld",
    number: "03",
    title: "Low-Level Design (LLD)",
    tagline: "Engineering the Details",
    color: "from-violet-500 to-purple-600",
    ring: "ring-violet-500/40",
    duration: "Week 3-4",
    milestone: "Design Review Complete",
    input: [
      "Approved HLD & architecture diagrams",
      "API contract specifications",
      "Data model requirements",
      "UI/UX wireframes & design system",
    ],
    process: [
      "Class & sequence diagram creation",
      "Database schema design & normalization",
      "API endpoint specification (OpenAPI/Swagger)",
      "Algorithm & data structure selection",
      "Error handling & logging strategy",
    ],
    output: [
      "Low-Level Design Document (LLD)",
      "Database Schema & ERD Diagrams",
      "API Specification (Swagger/OpenAPI)",
      "Sequence & Class Diagrams",
    ],
    visualization: {
      type: "schema",
      label: "Data & API Design",
      nodes: ["Models", "Schemas", "APIs", "Sequences", "ERD"],
      description: "Detailed technical blueprints — schemas, APIs, and interaction flows",
    },
  },
  {
    id: "adr",
    number: "04",
    title: "Architecture Decisions (ADR)",
    tagline: "Recording Why We Choose",
    color: "from-amber-500 to-orange-600",
    ring: "ring-amber-500/40",
    duration: "Ongoing",
    milestone: "ADR Repository Established",
    input: [
      "Design trade-offs & alternatives evaluated",
      "Performance benchmarks & PoC results",
      "Team expertise & learning curves",
      "Cost-benefit analysis of each option",
    ],
    process: [
      "Decision context & problem statement framing",
      "Options evaluation with pros/cons matrix",
      "Proof of Concept (PoC) & spike execution",
      "Team consensus & approval workflow",
      "Decision documentation in ADR format",
    ],
    output: [
      "Architecture Decision Records (ADRs)",
      "Decision Log & Rationale Archive",
      "PoC Results & Benchmark Reports",
      "Risk Register Updates",
    ],
    visualization: {
      type: "decision",
      label: "Decision Matrix",
      nodes: ["Problem", "Options", "PoC", "Evaluate", "Record"],
      description: "Structured decision framework capturing the 'why' behind every choice",
    },
  },
  {
    id: "sad",
    number: "05",
    title: "Solution Architecture (SAD)",
    tagline: "The Complete Blueprint",
    color: "from-emerald-500 to-green-600",
    ring: "ring-emerald-500/40",
    duration: "Week 4-5",
    milestone: "SAD Baselined",
    input: [
      "HLD + LLD + ADRs consolidated",
      "Non-functional requirements (NFRs)",
      "Security & compliance requirements",
      "Deployment & operational requirements",
    ],
    process: [
      "End-to-end solution architecture synthesis",
      "Cross-cutting concerns (auth, logging, monitoring)",
      "Deployment topology & environment strategy",
      "Disaster recovery & business continuity planning",
      "Architecture review board presentation",
    ],
    output: [
      "Solution Architecture Document (SAD)",
      "Deployment Topology Diagrams",
      "Security Architecture & Controls",
      "DR/BCP Plan",
    ],
    visualization: {
      type: "topology",
      label: "Deployment Topology",
      nodes: ["Dev", "Staging", "Pre-Prod", "Production", "DR"],
      description: "Full deployment topology across environments with failover paths",
    },
  },
  {
    id: "test",
    number: "06",
    title: "Testing & QA",
    tagline: "Validating Every Layer",
    color: "from-rose-500 to-pink-600",
    ring: "ring-rose-500/40",
    duration: "Week 8-11",
    milestone: "Quality Gate Passed",
    input: [
      "Completed code & build artifacts",
      "Test plans derived from BRD & LLD",
      "Test data & environment configuration",
      "Acceptance criteria from user stories",
    ],
    process: [
      "Unit testing (>90% coverage target)",
      "Integration & API contract testing",
      "Performance & load testing (JMeter, k6)",
      "Security testing (OWASP, SAST, DAST)",
      "UAT with business stakeholders",
    ],
    output: [
      "Test Execution Reports",
      "Defect Log & Resolution Tracker",
      "Performance Benchmark Results",
      "UAT Sign-off Certificate",
    ],
    visualization: {
      type: "pyramid",
      label: "Test Pyramid",
      nodes: ["Unit", "Integration", "E2E", "Performance", "Security", "UAT"],
      description: "Multi-layered testing strategy from unit tests to user acceptance",
    },
  },
  {
    id: "deployment",
    number: "07",
    title: "Deployment & Go-Live",
    tagline: "Shipping with Confidence",
    color: "from-pink-500 to-fuchsia-600",
    ring: "ring-pink-500/40",
    duration: "Week 11-12",
    milestone: "Production Go-Live",
    input: [
      "Tested & approved build artifacts",
      "Deployment runbook & rollback plan",
      "Infrastructure provisioned (IaC)",
      "Monitoring & alerting configured",
    ],
    process: [
      "Canary deployment to 5% traffic",
      "Blue-green switch with health checks",
      "Database migration execution",
      "DNS cutover & CDN configuration",
      "Smoke testing & production validation",
    ],
    output: [
      "Production System Live",
      "Deployment Verification Report",
      "Monitoring Dashboard Active",
      "Runbook & Rollback Procedures",
    ],
    visualization: {
      type: "pipeline",
      label: "CI/CD Pipeline",
      nodes: ["Build", "Test", "Stage", "Canary", "Blue-Green", "Live"],
      description: "Automated deployment pipeline with progressive traffic shifting",
    },
  },
  {
    id: "calibration",
    number: "08",
    title: "Calibration & Optimization",
    tagline: "Fine-Tuning for Peak Performance",
    color: "from-indigo-500 to-blue-600",
    ring: "ring-indigo-500/40",
    duration: "Week 12-14",
    milestone: "Performance Targets Met",
    input: [
      "Production metrics & telemetry data",
      "User feedback & behavior analytics",
      "Performance baseline measurements",
      "Model accuracy & drift metrics (for AI)",
    ],
    process: [
      "Performance profiling & bottleneck identification",
      "Query optimization & caching strategy",
      "Model retraining & hyperparameter tuning",
      "A/B testing & feature flag analysis",
      "Cost optimization (FinOps review)",
    ],
    output: [
      "Optimization Report & Metrics",
      "Tuned System Configuration",
      "A/B Test Results & Recommendations",
      "FinOps Cost Optimization Plan",
    ],
    visualization: {
      type: "metrics",
      label: "Performance Metrics",
      nodes: ["Baseline", "Profile", "Optimize", "Validate", "Target"],
      description: "Iterative performance tuning cycle driving toward target metrics",
    },
  },
  {
    id: "maintenance",
    number: "09",
    title: "Maintenance & Evolution",
    tagline: "Sustaining Long-Term Value",
    color: "from-teal-500 to-cyan-600",
    ring: "ring-teal-500/40",
    duration: "Ongoing",
    milestone: "Continuous Value Delivery",
    input: [
      "Production monitoring alerts & logs",
      "User support tickets & feature requests",
      "Technology updates & security patches",
      "Business roadmap & new requirements",
    ],
    process: [
      "24/7 monitoring & incident response (SLA-backed)",
      "Patch management & security updates",
      "Feature enhancements & sprint releases",
      "Quarterly business reviews & ROI tracking",
      "Capacity planning & infrastructure scaling",
    ],
    output: [
      "SLA Compliance Reports",
      "Release Notes & Changelog",
      "Quarterly ROI & Value Reports",
      "Roadmap for Next Phase",
    ],
    visualization: {
      type: "cycle",
      label: "Continuous Improvement",
      nodes: ["Monitor", "Detect", "Respond", "Improve", "Release"],
      description: "Continuous feedback loop ensuring the system evolves with your business",
    },
  },
];

// Animated mini-visualization per phase type
function PhaseVisualization({ phase }: { phase: (typeof phases)[0] }) {
  const viz = phase.visualization;
  const nodeCount = viz.nodes.length;

  if (viz.type === "flow" || viz.type === "decision" || viz.type === "pipeline") {
    // Horizontal flow with animated connections
    return (
      <div className="relative py-4">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-semibold">{viz.label}</p>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {viz.nodes.map((node, i) => (
            <div key={node} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.12, duration: 0.3 }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg bg-gradient-to-br ${phase.color} text-white text-[10px] font-semibold whitespace-nowrap shadow-md`}
              >
                {node}
              </motion.div>
              {i < nodeCount - 1 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 24 }}
                  transition={{ delay: i * 0.12 + 0.1, duration: 0.2 }}
                  className="flex items-center justify-center overflow-hidden"
                >
                  <svg className="w-6 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 16">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 8h16m0 0l-4-4m4 4l-4 4" />
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2">{viz.description}</p>
      </div>
    );
  }

  if (viz.type === "architecture" || viz.type === "topology") {
    // Grid layout of connected boxes
    return (
      <div className="relative py-4">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-semibold">{viz.label}</p>
        <div className="grid grid-cols-3 gap-2">
          {viz.nodes.map((node, i) => (
            <motion.div
              key={node}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`px-2 py-2 rounded-lg border border-white/15 bg-white/5 text-center text-[10px] text-white/70 font-medium hover:bg-white/10 hover:border-accent/30 transition-all cursor-default ${
                i === Math.floor(nodeCount / 2) ? `ring-1 ${phase.ring}` : ""
              }`}
            >
              {node}
            </motion.div>
          ))}
        </div>
        {/* Connection lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-10" viewBox="0 0 200 100">
            <line x1="33" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
            <line x1="100" y1="40" x2="166" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
            <line x1="100" y1="40" x2="100" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          </svg>
        </div>
        <p className="text-[10px] text-white/30 mt-2">{viz.description}</p>
      </div>
    );
  }

  if (viz.type === "pyramid") {
    // Stacked pyramid
    return (
      <div className="relative py-4">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-semibold">{viz.label}</p>
        <div className="space-y-1">
          {viz.nodes.map((node, i) => {
            const width = 40 + ((nodeCount - i) / nodeCount) * 60;
            return (
              <motion.div
                key={node}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className={`mx-auto rounded bg-gradient-to-r ${phase.color} text-center text-[10px] text-white font-semibold py-1.5`}
                style={{ width: `${width}%`, opacity: 1 - i * 0.08 }}
              >
                {node}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] text-white/30 mt-2">{viz.description}</p>
      </div>
    );
  }

  if (viz.type === "schema") {
    // Connected node graph
    return (
      <div className="relative py-4">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-semibold">{viz.label}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {viz.nodes.map((node, i) => (
            <motion.div
              key={node}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3, type: "spring" }}
              className={`px-3 py-1.5 rounded-full border border-white/20 bg-gradient-to-r ${phase.color} text-[10px] text-white font-semibold shadow-sm`}
            >
              {node}
            </motion.div>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2">{viz.description}</p>
      </div>
    );
  }

  // cycle / metrics — circular representation
  return (
    <div className="relative py-4">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3 font-semibold">{viz.label}</p>
      <div className="relative w-40 h-40 mx-auto">
        {viz.nodes.map((node, i) => {
          const angle = (i / nodeCount) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 38 * Math.cos(rad);
          const y = 50 + 38 * Math.sin(rad);
          return (
            <motion.div
              key={node}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12, duration: 0.3 }}
              className={`absolute px-2 py-1 rounded-md bg-gradient-to-br ${phase.color} text-[9px] text-white font-semibold whitespace-nowrap shadow-md`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {node}
            </motion.div>
          );
        })}
        {/* Center circle */}
        <div className="absolute inset-[30%] rounded-full border border-white/10 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-accent"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        {/* Connecting ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(34,211,238,0.15)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {/* Animated dot traveling around the ring */}
          <motion.circle
            r="1.5"
            fill="rgba(34,211,238,0.8)"
            animate={{
              cx: Array.from({ length: 60 }, (_, i) => 50 + 38 * Math.cos(((i / 60) * 360 - 90) * Math.PI / 180)),
              cy: Array.from({ length: 60 }, (_, i) => 50 + 38 * Math.sin(((i / 60) * 360 - 90) * Math.PI / 180)),
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
      <p className="text-[10px] text-white/30 mt-2 text-center">{viz.description}</p>
    </div>
  );
}

function IPOCard({
  title,
  items,
  icon,
  delay,
  accentColor,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  delay: number;
  accentColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-colors"
    >
      <h4 className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className={accentColor}>{icon}</span>
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, j) => (
          <motion.li
            key={j}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + j * 0.04, duration: 0.2 }}
            className="flex items-start gap-2"
          >
            <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
            </svg>
            <span className="text-[11px] text-white/55 leading-snug">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function ProjectJourney() {
  const [activePhase, setActivePhase] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    if (!isAutoPlaying) return;
    if (activePhase >= phases.length - 1) {
      setIsAutoPlaying(false);
      return;
    }
    const timer = setTimeout(() => setActivePhase((p) => p + 1), 2200);
    return () => clearTimeout(timer);
  }, [isAutoPlaying, activePhase]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAutoPlayed.current) {
          hasAutoPlayed.current = true;
          setIsAutoPlaying(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleExpand = useCallback((idx: number) => {
    setExpandedPhase((prev) => (prev === idx ? null : idx));
    setIsAutoPlaying(false);
  }, []);

  return (
    <section ref={sectionRef} id="project-journey" className="py-24 bg-primary relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            End-to-End Project Lifecycle
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Your Project <span className="text-accent">Journey</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            From Business Requirements to Maintenance — every phase shows what goes in, how we process it,
            what comes out, and how it&apos;s visualized. Click any phase to explore.
          </p>
        </motion.div>

        {/* Phase navigator strip */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-0.5 sm:gap-1 bg-white/5 rounded-2xl p-1.5 sm:p-2 backdrop-blur-sm border border-white/10 flex-wrap justify-center">
            {phases.map((phase, i) => {
              const isActive = i === activePhase;
              const isPast = i < activePhase;
              return (
                <button
                  key={phase.id}
                  onClick={() => { setActivePhase(i); setIsAutoPlaying(false); }}
                  className={`relative group flex flex-col items-center justify-center w-9 h-12 sm:w-11 sm:h-14 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                    isActive
                      ? "bg-accent text-white shadow-lg shadow-accent/30 scale-105"
                      : isPast
                      ? "bg-white/15 text-white hover:bg-white/20"
                      : "bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
                  }`}
                  aria-label={phase.title}
                >
                  {phase.number}
                  <span className="text-[7px] sm:text-[8px] font-medium opacity-60 leading-none mt-0.5 uppercase">
                    {phase.id}
                  </span>
                  {/* Tooltip */}
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/10 backdrop-blur text-white/70 text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    {phase.title}
                  </span>
                </button>
              );
            })}

            <div className="w-px h-8 bg-white/10 mx-1" />

            <button
              onClick={() => {
                if (isAutoPlaying) {
                  setIsAutoPlaying(false);
                } else {
                  setActivePhase(0);
                  setExpandedPhase(null);
                  setIsAutoPlaying(true);
                }
              }}
              className="w-9 h-12 sm:w-11 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:text-accent hover:bg-white/15 transition-all"
              aria-label={isAutoPlaying ? "Pause" : "Auto-play"}
            >
              {isAutoPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Phase cards */}
        <div className="space-y-4">
          {phases.map((phase, i) => {
            const isActive = i === activePhase;
            const isPast = i < activePhase;
            const isExpanded = expandedPhase === i;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.03, duration: 0.35 }}
              >
                {/* Card header (always visible) */}
                <motion.div
                  onClick={() => { setActivePhase(i); toggleExpand(i); }}
                  className={`relative cursor-pointer rounded-2xl border transition-all ${
                    isActive
                      ? "bg-white/[0.08] border-accent/40 shadow-xl shadow-accent/10"
                      : isPast
                      ? "bg-white/[0.05] border-white/15 hover:bg-white/[0.07]"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                  }`}
                  whileHover={{ y: -1 }}
                >
                  <div className="p-4 sm:p-5 flex items-center gap-4">
                    {/* Phase icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${phase.color} flex items-center justify-center text-white shadow-md`}>
                      <span className="text-sm font-bold">{phase.number}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`font-bold text-base sm:text-lg ${isActive ? "text-white" : isPast ? "text-white/80" : "text-white/60"}`}>
                          {phase.title}
                        </h3>
                        <span className="hidden sm:inline text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                          {phase.duration}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/40">{phase.tagline}</p>
                    </div>

                    {/* Milestone badge */}
                    <div className="hidden md:flex items-center gap-1.5 bg-accent/10 text-accent text-[10px] font-semibold px-3 py-1 rounded-full flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {phase.milestone}
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <svg className="w-5 h-5 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Expanded IPO + Visualization */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-5 pb-5 border-t border-white/10 pt-5">
                          {/* Input → Process → Output grid */}
                          <div className="grid md:grid-cols-3 gap-4 mb-5">
                            <IPOCard
                              title="Input"
                              items={phase.input}
                              delay={0}
                              accentColor="text-blue-400"
                              icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                              }
                            />
                            <IPOCard
                              title="Process"
                              items={phase.process}
                              delay={0.1}
                              accentColor="text-accent"
                              icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              }
                            />
                            <IPOCard
                              title="Output"
                              items={phase.output}
                              delay={0.2}
                              accentColor="text-emerald-400"
                              icon={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              }
                            />
                          </div>

                          {/* Visualization */}
                          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                            <PhaseVisualization phase={phase} />
                          </div>

                          {/* Mobile milestone */}
                          <div className="md:hidden mt-4 flex items-center gap-1.5 bg-accent/10 text-accent text-[10px] font-semibold px-3 py-1.5 rounded-full w-fit">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            {phase.milestone}
                          </div>

                          {/* Next phase link */}
                          {i < phases.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhase(i + 1);
                                setExpandedPhase(i + 1);
                              }}
                              className="mt-4 flex items-center gap-2 text-xs text-accent hover:text-white font-semibold transition-colors group"
                            >
                              Next: {phases[i + 1].title}
                              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-3 md:grid-cols-5 gap-3"
        >
          {[
            { value: "9", label: "Phases" },
            { value: "36", label: "Inputs" },
            { value: "45", label: "Process Steps" },
            { value: "36", label: "Outputs" },
            { value: "9", label: "Visualizations" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center hover:bg-white/[0.08] transition-colors"
            >
              <p className="text-xl font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
