"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const genaiCapabilities = [
  {
    category: "Hyperscaler GenAI Platforms",
    items: [
      "Azure OpenAI Service — GPT-4o, GPT-4 Turbo, DALL-E, Whisper deployments",
      "Google Gemini AI — Gemini Pro & Ultra for multi-modal enterprise workflows",
      "AWS Bedrock — Claude, Llama, Titan model orchestration & fine-tuning",
    ],
  },
  {
    category: "RAG & Knowledge Retrieval",
    items: [
      "Enterprise RAG pipelines with vector databases (Pinecone, Weaviate, pgvector)",
      "Hybrid search — semantic + keyword retrieval with re-ranking",
      "Multi-document RAG with citation tracking & hallucination guardrails",
      "Agentic RAG — autonomous retrieval with tool-calling LLM agents",
    ],
  },
  {
    category: "Text-to-SQL & Data Intelligence",
    items: [
      "Natural language to SQL query generation for business users",
      "Schema-aware Text2SQL with auto-join & aggregation inference",
      "Conversational analytics — chat with your database using LLMs",
      "SQL validation, optimization & security guardrails",
    ],
  },
  {
    category: "LLM Fine-Tuning & Custom Models",
    items: [
      "Domain-specific fine-tuning (LoRA, QLoRA, full fine-tune)",
      "Instruction tuning & RLHF for enterprise compliance",
      "Model distillation — compress large models for edge/cost efficiency",
      "Continuous fine-tuning pipelines with MLOps integration",
    ],
  },
  {
    category: "Model Deployment & LLMOps",
    items: [
      "vLLM — high-throughput LLM serving with PagedAttention & continuous batching",
      "ONNX Runtime — cross-platform model optimization & hardware-accelerated inference",
      "TGI (Text Generation Inference) — production LLM serving with streaming & batching",
      "LLMOps pipelines — model versioning, A/B testing, canary rollouts & monitoring",
      "MLOps — end-to-end ML lifecycle (training, registry, deployment, drift detection)",
      "GPU cluster orchestration — multi-node inference with Kubernetes & Ray Serve",
    ],
  },
];

// Neural network node positions (deterministic)
const nodes = [
  { x: 15, y: 20 }, { x: 35, y: 15 }, { x: 55, y: 25 },
  { x: 75, y: 12 }, { x: 88, y: 30 }, { x: 10, y: 50 },
  { x: 30, y: 55 }, { x: 50, y: 48 }, { x: 70, y: 55 },
  { x: 90, y: 50 }, { x: 20, y: 80 }, { x: 40, y: 78 },
  { x: 60, y: 82 }, { x: 80, y: 75 }, { x: 50, y: 65 },
];

// Connections between nodes
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6],
  [2, 7], [3, 8], [4, 9], [5, 6], [6, 7], [7, 8],
  [8, 9], [5, 10], [6, 11], [7, 14], [8, 13], [9, 13],
  [10, 11], [11, 12], [12, 13], [14, 7], [14, 11], [14, 12],
];

function NeuralNetworkViz() {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Connections */}
      {connections.map(([a, b], i) => {
        const isHighlighted = hoveredNode === a || hoveredNode === b;
        return (
          <motion.line
            key={`c-${i}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={isHighlighted ? "rgba(34,211,238,0.5)" : "rgba(255,255,255,0.08)"}
            strokeWidth={isHighlighted ? "0.4" : "0.15"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
          />
        );
      })}
      {/* Animated pulse along connections */}
      {connections.map(([a, b], i) => (
        <motion.circle
          key={`pulse-${i}`}
          r="0.4"
          fill="rgba(34,211,238,0.6)"
          initial={{ opacity: 0 }}
          animate={{
            cx: [nodes[a].x, nodes[b].x],
            cy: [nodes[a].y, nodes[b].y],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear",
          }}
        />
      ))}
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={`n-${i}`}
          cx={node.x}
          cy={node.y}
          r={hoveredNode === i ? 1.8 : 1}
          fill={hoveredNode === i ? "rgba(34,211,238,0.8)" : "rgba(34,211,238,0.4)"}
          className="cursor-pointer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
          onMouseEnter={() => setHoveredNode(i)}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ filter: hoveredNode === i ? "drop-shadow(0 0 4px rgba(34,211,238,0.8))" : "none" }}
        />
      ))}
    </svg>
  );
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), { stiffness: 100, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), { stiffness: 100, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export default function VideoSection() {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Background decoration */}
      <motion.div
        className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-y-1/2 translate-x-1/2"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Generative AI Solutions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Enterprise <span className="text-accent">GenAI</span> at Hyperscaler Scale
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Production-grade Generative AI across Azure OpenAI, Google Gemini, and AWS Bedrock —
            with RAG pipelines, Text-to-SQL, fine-tuning, and AI agent orchestration.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Interactive neural network placeholder + badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <TiltCard className="relative group">
              <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-video bg-gradient-to-br from-[#0f172a] via-[#164e63] to-[#0f172a]">
                {/* Animated mesh overlay */}
                <motion.div
                  className="absolute inset-0 opacity-40"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  style={{
                    backgroundSize: "200% 200%",
                    backgroundImage:
                      "radial-gradient(ellipse at 30% 40%, rgba(34,211,238,0.2) 0%, transparent 50%), " +
                      "radial-gradient(ellipse at 70% 60%, rgba(8,145,178,0.15) 0%, transparent 50%)",
                  }}
                />

                {/* Interactive neural network */}
                <NeuralNetworkViz />

                {/* Center play icon & label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer"
                      whileHover={{ scale: 1.15, backgroundColor: "rgba(255,255,255,0.2)" }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(34,211,238,0)",
                          "0 0 0 15px rgba(34,211,238,0.15)",
                          "0 0 0 30px rgba(34,211,238,0)",
                        ],
                      }}
                      transition={{
                        boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeOut" },
                      }}
                    >
                      <svg className="w-8 h-8 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
                    <motion.span
                      className="text-white/70 text-sm font-medium tracking-wide"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      GenAI Demo
                    </motion.span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl -z-10 group-hover:bg-accent/30 transition-colors" />
            </TiltCard>

            {/* Hyperscaler platform badges */}
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                { name: "Azure OpenAI", gradient: "from-blue-500 to-blue-700" },
                { name: "Google Gemini", gradient: "from-red-500 to-yellow-500" },
                { name: "AWS Bedrock", gradient: "from-orange-500 to-amber-600" },
                { name: "RAG Pipelines", gradient: "from-purple-500 to-violet-600" },
                { name: "Text-to-SQL", gradient: "from-emerald-500 to-teal-600" },
                { name: "Fine-Tuning", gradient: "from-pink-500 to-rose-600" },
                { name: "LLMOps", gradient: "from-indigo-500 to-blue-600" },
                { name: "MLOps", gradient: "from-cyan-500 to-teal-600" },
                { name: "vLLM", gradient: "from-gray-600 to-gray-800" },
                { name: "ONNX", gradient: "from-sky-500 to-blue-600" },
                { name: "TGI", gradient: "from-yellow-500 to-amber-600" },
              ].map((badge, i) => (
                <motion.span
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${badge.gradient} text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md cursor-default hover:shadow-lg transition-shadow`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {badge.name}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Capability cards with expand interaction */}
          <div className="space-y-5">
            {genaiCapabilities.map((cap, i) => (
              <motion.div
                key={cap.category}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                onClick={() => setExpandedCard(expandedCard === i ? null : i)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-accent/30 hover:bg-white/[0.12] cursor-pointer transition-all group"
              >
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-accent"
                    animate={expandedCard === i ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  />
                  {cap.category}
                  <motion.svg
                    className="w-4 h-4 text-white/40 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: expandedCard === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </h4>
                <motion.ul
                  className="space-y-2 overflow-hidden"
                  initial={false}
                  animate={{
                    height: expandedCard === i ? "auto" : cap.items.length <= 3 ? "auto" : "4.5rem",
                    opacity: 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {cap.items.map((item, j) => (
                    <motion.li
                      key={j}
                      className="flex items-start gap-2"
                      initial={false}
                      animate={{
                        opacity: expandedCard === i || j < 2 ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-xs text-white/60 group-hover:text-white/70 transition-colors">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
