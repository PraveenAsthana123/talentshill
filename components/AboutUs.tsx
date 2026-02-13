"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-primary noise-overlay">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image/Video placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-white">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-80"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm opacity-70">Company Overview Video</p>
              </div>
            </div>
            {/* Accent decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-xl -z-10" />
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              About Talents Hill Inc
            </h2>
            <p className="text-white/60 mb-4 leading-relaxed">
              Talents Hill Inc is a leading analytics consulting firm that helps
              businesses unlock the power of their data. We specialize in
              marketing analytics, customer analytics, and data integration
              solutions that deliver measurable business impact.
            </p>
            <p className="text-white/60 mb-6 leading-relaxed">
              Our team of experienced data scientists and analysts work closely
              with clients to understand their unique challenges and deliver
              tailored solutions that drive growth, improve efficiency, and
              create competitive advantages.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-2xl font-bold text-accent">150+</h4>
                <p className="text-sm text-white/60">Projects Completed</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-accent">50+</h4>
                <p className="text-sm text-white/60">Happy Clients</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-accent">10+</h4>
                <p className="text-sm text-white/60">Years Experience</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-accent">25+</h4>
                <p className="text-sm text-white/60">Team Members</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
