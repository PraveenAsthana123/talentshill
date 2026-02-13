"use client";

import { motion } from "framer-motion";

const certifications = [
  {
    name: "ISO 42001",
    subtitle: "AI Management System",
    description:
      "Certified framework for responsible AI governance, ensuring ethical development, deployment, and monitoring of artificial intelligence systems.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    name: "ISO 45001",
    subtitle: "Occupational Health & Safety",
    description:
      "International standard for occupational health and safety management, ensuring a safe and healthy workplace for employees and stakeholders.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    name: "ISO 27001",
    subtitle: "Information Security",
    description:
      "Gold standard for information security management systems, safeguarding data confidentiality, integrity, and availability across all operations.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    name: "AWS Partner",
    subtitle: "Amazon Web Services",
    description:
      "Official AWS partner with validated expertise in deploying scalable AI/ML workloads on Amazon SageMaker, Lambda, and the broader AWS ecosystem.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
        />
      </svg>
    ),
  },
  {
    name: "Microsoft Azure Partner",
    subtitle: "Azure Cloud Solutions",
    description:
      "Certified Microsoft Azure partner delivering enterprise AI solutions with Azure OpenAI, Cognitive Services, and cloud-native infrastructure.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    name: "Google Cloud Partner",
    subtitle: "GCP Solutions Provider",
    description:
      "Recognized Google Cloud partner specializing in Vertex AI, BigQuery ML, and end-to-end cloud AI pipelines for enterprise-grade deployments.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ),
  },
  {
    name: "NVIDIA Partner",
    subtitle: "GPU & AI Acceleration",
    description:
      "Strategic NVIDIA partner leveraging GPU-accelerated computing, CUDA, TensorRT, and NVIDIA AI Enterprise for high-performance AI workloads.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
  },
  {
    name: "SOC 2 Type II",
    subtitle: "Compliance Certified",
    description:
      "SOC 2 Type II compliant, demonstrating rigorous controls over security, availability, processing integrity, confidentiality, and privacy.",
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Certifications() {
  return (
    <section id="certifications" className="py-24 bg-primary mesh-gradient-2 section-glow-top relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-accent/10 rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Trust & Compliance
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Certifications & Partnerships
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Industry-recognized certifications and strategic technology partnerships
            that ensure enterprise-grade security, compliance, and innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={cardVariants}
              className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-lg card-hover glow-card transition-all duration-300"
            >
              {/* Gradient accent border on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent via-primary to-accent-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-[1px] scale-[1.02]" />
              <div className="absolute inset-[1px] rounded-2xl bg-white/10 -z-[5]" />

              <div className="flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary group-hover:text-accent transition-colors duration-300 mb-4">
                  {cert.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {cert.name}
                </h3>
                <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                  {cert.subtitle}
                </p>
                <p className="text-white/60 text-sm leading-relaxed mt-auto">
                  {cert.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
