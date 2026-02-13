"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Market Research",
    description:
      "Comprehensive market research analytics to identify opportunities, understand competitive landscapes, and make informed strategic decisions backed by data.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Pharmaceutical",
    description:
      "Specialized analytics for the pharmaceutical industry including drug performance tracking, physician targeting, patient analytics, and commercial optimization.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "from-teal-500 to-cyan-600",
  },
  {
    title: "Retail",
    description:
      "End-to-end retail analytics covering merchandising optimization, pricing strategies, promotion effectiveness, and inventory management insights.",
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: "from-purple-500 to-pink-600",
  },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export default function Features() {
  return (
    <section id="features" className="py-20 bg-primary dot-pattern noise-overlay relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Industry Solutions
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Tailored analytics solutions for key industries, delivering
            domain-specific insights that drive results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="rounded-xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow glow-card"
            >
              <div
                className={`bg-gradient-to-r ${feature.color} p-8 text-white`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
              </div>
              <div className="p-8 bg-white/10 backdrop-blur-sm">
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
                <a
                  href="#"
                  className="inline-block mt-4 text-accent-light font-semibold hover:text-accent transition-colors"
                >
                  Learn More &rarr;
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
