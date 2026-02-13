"use client";

import { motion } from "framer-motion";

const partners = [
  { name: "AWS", color: "#FF9900" },
  { name: "Microsoft Azure", color: "#0078D4" },
  { name: "Google Cloud", color: "#4285F4" },
  { name: "NVIDIA", color: "#76B900" },
  { name: "OpenAI", color: "#412991" },
  { name: "Meta AI", color: "#0668E1" },
  { name: "Hugging Face", color: "#FFD21E" },
  { name: "Databricks", color: "#FF3621" },
  { name: "Snowflake", color: "#29B5E8" },
  { name: "MongoDB", color: "#47A248" },
  { name: "Docker", color: "#2496ED" },
  { name: "Kubernetes", color: "#326CE5" },
];

const row1 = partners.slice(0, 6);
const row2 = partners.slice(6, 12);

function LogoCard({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex-shrink-0 w-48 mx-3">
      <div className="bg-white/10 rounded-xl shadow-md hover:shadow-lg transition-shadow px-6 py-5 flex items-center justify-center h-20 border border-white/10">
        <svg viewBox="0 0 200 40" className="w-full h-full" aria-label={name}>
          <text
            x="100"
            y="28"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            fontSize={name.length > 10 ? "14" : "18"}
            fill={color}
            letterSpacing="0.5"
          >
            {name}
          </text>
        </svg>
      </div>
    </div>
  );
}

function MarqueeRow({
  logos,
  direction = "left",
  duration = 30,
}: {
  logos: typeof partners;
  direction?: "left" | "right";
  duration?: number;
}) {
  // Duplicate logos enough times to ensure seamless loop
  const duplicated = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="relative overflow-hidden py-2">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none" />

      <div
        className={`flex ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={
          {
            "--marquee-duration": `${duration}s`,
          } as React.CSSProperties
        }
      >
        {duplicated.map((logo, i) => (
          <LogoCard key={`${logo.name}-${i}`} name={logo.name} color={logo.color} />
        ))}
      </div>
    </div>
  );
}

export default function ClientLogos() {
  return (
    <section className="py-20 bg-primary mesh-gradient-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Our Partners
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted By Industry Leaders
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            We partner with leading technology platforms to deliver world-class
            AI and cloud solutions.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        <MarqueeRow logos={row1} direction="left" duration={35} />
        <MarqueeRow logos={row2} direction="right" duration={40} />
      </motion.div>
    </section>
  );
}
