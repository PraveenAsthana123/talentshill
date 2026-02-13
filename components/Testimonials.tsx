"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote:
      "Talents Hill Inc transformed our marketing strategy with their analytics expertise. Their insights helped us increase our ROI by 40% within the first quarter.",
    name: "John Doe",
    title: "VP Analytics & Strategy",
    company: "Fortune 500 Retail",
    initials: "JD",
    gradient: "from-blue-500 to-indigo-600",
    rating: 5,
  },
  {
    quote:
      "The customer analytics solutions provided by Talents Hill Inc gave us deep visibility into our customer base. We now understand our customers better than ever before.",
    name: "Rebaca Michel",
    title: "Analytics & Strategy",
    company: "Global Healthcare Co",
    initials: "RM",
    gradient: "from-teal-500 to-cyan-600",
    rating: 5,
  },
  {
    quote:
      "Working with Talents Hill Inc on data integration was a game-changer. They unified our fragmented data sources into a single, reliable platform in record time.",
    name: "Stev Smith",
    title: "CTO",
    company: "FinTech Startup",
    initials: "SS",
    gradient: "from-violet-500 to-purple-600",
    rating: 5,
  },
  {
    quote:
      "Their GenAI chatbot solution reduced our support tickets by 60% while improving customer satisfaction. The team was incredibly knowledgeable and responsive.",
    name: "Aisha Patel",
    title: "Director of Operations",
    company: "E-Commerce Platform",
    initials: "AP",
    gradient: "from-pink-500 to-rose-600",
    rating: 5,
  },
  {
    quote:
      "Talents Hill Inc's IoT platform gave us real-time visibility into our manufacturing operations. We reduced downtime by 45% in the first six months.",
    name: "Robert Chang",
    title: "Plant Manager",
    company: "Manufacturing Corp",
    initials: "RC",
    gradient: "from-orange-500 to-red-600",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section id="testimonials" className="py-24 bg-primary mesh-gradient-3 section-glow-top relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
        </motion.div>

        {/* Main testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12 glow-card"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-white/80 text-xl md:text-2xl leading-relaxed mb-8 font-light italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{t.name}</p>
                  <p className="text-accent-light text-sm">{t.title}</p>
                  <p className="text-white/40 text-xs">{t.company}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={() =>
                setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length)
              }
              className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Previous testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-8 bg-accent" : "w-2 bg-white/30"
                  }`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Next testimonial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
