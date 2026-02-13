"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

const slides = [
  {
    title: "Intelligent Analytics.",
    titleHighlight: "Intelligently Delivered.",
    subtitle:
      "We help businesses transform raw data into actionable insights that drive growth and profitability.",
    gradient: "from-[#0f172a] via-[#164e63] to-[#0f172a]",
    cta: "Explore Our Services",
    ctaLink: "#services",
  },
  {
    title: "Maximize Your",
    titleHighlight: "Customer Value.",
    subtitle:
      "Advanced customer analytics powered by AI to unlock deeper engagement and higher lifetime value.",
    gradient: "from-[#0f172a] via-[#1e3a5f] to-[#0f172a]",
    cta: "Customer Analytics",
    ctaLink: "#ai-products",
  },
  {
    title: "AI-Powered",
    titleHighlight: "Retail Analytics.",
    subtitle:
      "Optimize merchandising, pricing, and promotions with data-driven strategies and real-time insights.",
    gradient: "from-[#0f172a] via-[#134e4a] to-[#0f172a]",
    cta: "Learn More",
    ctaLink: "#features",
  },
];

const stats = [
  { value: 150, suffix: "+", label: "Projects" },
  { value: 50, suffix: "+", label: "Clients" },
  { value: 10, suffix: "+", label: "Years" },
  { value: 99, suffix: "%", label: "Satisfaction" },
];

// Floating shape data (deterministic, no random)
const floatingShapes = [
  { x: 10, y: 15, size: 60, duration: 20, delay: 0, type: "ring" },
  { x: 85, y: 10, size: 40, duration: 15, delay: 2, type: "dot" },
  { x: 70, y: 70, size: 80, duration: 25, delay: 1, type: "ring" },
  { x: 20, y: 80, size: 30, duration: 18, delay: 3, type: "dot" },
  { x: 50, y: 30, size: 50, duration: 22, delay: 0.5, type: "hex" },
  { x: 90, y: 45, size: 35, duration: 16, delay: 4, type: "dot" },
  { x: 35, y: 55, size: 70, duration: 24, delay: 1.5, type: "ring" },
  { x: 60, y: 85, size: 25, duration: 14, delay: 2.5, type: "hex" },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <p ref={ref} className="text-2xl font-bold text-accent tabular-nums">
      {count}{suffix}
    </p>
  );
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax transforms for mesh overlay
  const meshX = useTransform(smoothX, [0, 1], [-30, 30]);
  const meshY = useTransform(smoothY, [0, 1], [-30, 30]);

  // Spotlight gradient position
  const spotlightX = useTransform(smoothX, [0, 1], [0, 100]);
  const spotlightY = useTransform(smoothY, [0, 1], [0, 100]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Animated gradient backgrounds */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`} />
          {/* Parallax mesh overlay that follows cursor */}
          <motion.div
            className="absolute -inset-10 opacity-40"
            style={{
              x: meshX,
              y: meshY,
              backgroundImage:
                "radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.18) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 80% 20%, rgba(8,145,178,0.12) 0%, transparent 50%), " +
                "radial-gradient(ellipse at 60% 80%, rgba(103,232,249,0.12) 0%, transparent 50%)",
            }}
          />
        </div>
      ))}

      {/* Mouse-following spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) =>
              `radial-gradient(600px circle at ${x}% ${y}%, rgba(34,211,238,0.15), transparent 60%)`
          ),
        }}
      />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 10, 0, -8, 0],
              rotate: shape.type === "hex" ? [0, 90, 180, 270, 360] : [0, 360],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay,
            }}
          >
            {shape.type === "ring" && (
              <div
                className="rounded-full border border-white/10"
                style={{ width: shape.size, height: shape.size }}
              />
            )}
            {shape.type === "dot" && (
              <div
                className="rounded-full bg-accent/20"
                style={{ width: shape.size, height: shape.size }}
              />
            )}
            {shape.type === "hex" && (
              <svg
                width={shape.size}
                height={shape.size}
                viewBox="0 0 100 100"
                className="text-white/10"
              >
                <polygon
                  points="50,2 93,25 93,75 50,98 7,75 7,25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            )}
          </motion.div>
        ))}

        {/* Small drifting particles */}
        {[...Array(20)].map((_, i) => {
          const seed = (i + 1) * 7.3;
          const x1 = (seed * 13.7) % 100;
          const y1 = (seed * 17.3) % 100;
          const x2 = (seed * 23.1) % 100;
          const y2 = (seed * 31.7) % 100;
          const dur = 5 + (seed % 10);
          const del = seed % 5;
          return (
            <motion.div
              key={`p-${i}`}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              initial={{ x: `${x1}%`, y: `${y1}%` }}
              animate={{
                y: [null, `${y2}%`],
                x: [null, `${x2}%`],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: dur,
                repeat: Infinity,
                ease: "linear",
                delay: del,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="inline-block glass rounded-full px-4 py-1.5 mb-6"
                >
                  <span className="text-sm text-white/90 font-medium">
                    Talents Hill Inc AI Solutions
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-2 leading-tight"
                >
                  {slides[current].title}
                </motion.h1>
                <motion.h1
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee, #0891b2, #67e8f9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {slides[current].titleHighlight}
                </motion.h1>

                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-lg md:text-xl text-white/80 mb-8 max-w-xl"
                >
                  {slides[current].subtitle}
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.65, duration: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  <a
                    href={slides[current].ctaLink}
                    className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-accent/30 cta-glow"
                  >
                    {slides[current].cta}
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                  <a
                    href="/portal"
                    className="inline-flex items-center gap-2 glass hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105"
                  >
                    AI Portal
                  </a>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="glass-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="hidden md:flex items-center gap-12">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center group cursor-default">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                    <p className="text-xs text-white/60 uppercase tracking-wider group-hover:text-accent/80 transition-colors">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Slide controls */}
              <div className="flex items-center gap-4 ml-auto">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
                  aria-label="Previous slide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 hover:bg-accent/70 ${
                        i === current ? "w-8 bg-accent" : "w-4 bg-white/30"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
