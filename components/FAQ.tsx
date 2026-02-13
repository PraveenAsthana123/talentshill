"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What AI services does Talents Hill Inc offer?",
    answer:
      "Talents Hill Inc provides a comprehensive suite of AI and data analytics services including Machine Learning model development, Generative AI and LLM solutions, Natural Language Processing, Computer Vision, Predictive Analytics, AI-powered Business Intelligence, Data Engineering and Integration, MLOps and model deployment, Conversational AI and chatbot development, and AI strategy consulting. We deliver end-to-end solutions from ideation and proof-of-concept through production deployment and ongoing optimization.",
  },
  {
    question: "Which industries do you serve?",
    answer:
      "We serve a wide range of industries including Healthcare and Pharmaceuticals, Financial Services and Banking, Retail and E-Commerce, Manufacturing, Telecommunications, Energy and Utilities, Insurance, Logistics and Supply Chain, Media and Entertainment, and Government and Public Sector. Our domain expertise allows us to deliver tailored AI solutions that address the unique challenges and regulatory requirements of each industry.",
  },
  {
    question: "What is your approach to AI project delivery?",
    answer:
      "Our delivery methodology follows a structured yet agile approach: We begin with a Discovery and Assessment phase to understand your business objectives and data landscape. This is followed by a Strategy and Roadmap phase where we define the AI use cases, success metrics, and technical architecture. We then move into iterative Development Sprints with regular demos and feedback loops, followed by rigorous Testing and Validation including model performance benchmarking. Finally, we handle Production Deployment with CI/CD pipelines and MLOps best practices, and provide post-launch Monitoring and Optimization.",
  },
  {
    question: "How do you ensure AI governance and compliance?",
    answer:
      "AI governance is embedded into every project we deliver. We implement Responsible AI frameworks that include bias detection and mitigation, model explainability and interpretability (XAI), audit trails and model versioning, compliance with regulations such as GDPR, HIPAA, SOC 2, and industry-specific mandates, ethical AI review processes, and transparent documentation of model decisions. We also help organizations establish their own AI governance policies and review boards.",
  },
  {
    question: "What cloud platforms do you support?",
    answer:
      "We are cloud-agnostic and have deep expertise across all major cloud platforms. This includes AWS (SageMaker, Bedrock, Lambda, EMR), Microsoft Azure (Azure ML, Azure OpenAI Service, Cognitive Services, Databricks), Google Cloud Platform (Vertex AI, BigQuery ML, Cloud AI Platform), and hybrid/multi-cloud architectures. We also support on-premises deployments for organizations with strict data residency requirements and can design solutions that span multiple cloud environments.",
  },
  {
    question: "How long does a typical AI project take?",
    answer:
      "Project timelines vary based on complexity and scope. A Proof of Concept or pilot typically takes 4 to 8 weeks. An MVP or initial production model usually requires 3 to 6 months. A full enterprise-scale AI solution can take 6 to 12 months or more depending on the number of integrations and scale requirements. We also offer rapid prototyping engagements that deliver working demos in as little as 2 weeks, helping you validate ideas quickly before committing to a larger investment.",
  },
  {
    question: "Do you offer AI strategy consulting?",
    answer:
      "Yes, AI strategy consulting is one of our core offerings. We help organizations assess their AI readiness, identify high-impact use cases, build an AI roadmap aligned with business objectives, evaluate build-vs-buy decisions, design the target data and AI architecture, plan for organizational change management and AI talent development, and calculate expected ROI and business impact. Our strategy engagements are designed to help leadership teams make informed decisions about where and how to invest in AI for maximum business value.",
  },
  {
    question: "What GenAI and LLM technologies do you work with?",
    answer:
      "We work with the full spectrum of Generative AI and Large Language Model technologies including OpenAI GPT-4 and GPT-4o, Anthropic Claude, Google Gemini, Meta LLaMA and open-source models, Retrieval-Augmented Generation (RAG) architectures, fine-tuning and prompt engineering, LangChain and LlamaIndex frameworks, vector databases such as Pinecone, Weaviate, and ChromaDB, and multi-modal AI combining text, image, and audio. We help organizations leverage these technologies for use cases like intelligent document processing, code generation, customer support automation, knowledge management, and content creation.",
  },
  {
    question: "How do you handle data privacy and security?",
    answer:
      "Data privacy and security are foundational to our work. We follow industry best practices including end-to-end encryption for data in transit and at rest, role-based access controls and least-privilege principles, data anonymization and pseudonymization techniques, secure development lifecycle (SDLC) practices, regular security audits and penetration testing, compliance with SOC 2 Type II, GDPR, HIPAA, and CCPA requirements, private cloud and VPC deployments where required, and data residency and sovereignty compliance. We also sign NDAs and data processing agreements as standard practice.",
  },
  {
    question: "What is your engagement model?",
    answer:
      "We offer flexible engagement models tailored to your needs. Our Fixed Price model is ideal for well-defined projects with clear scope and deliverables. The Time and Materials model works best for exploratory or evolving projects where requirements may shift. Our Dedicated Team model provides a fully embedded team that operates as an extension of your organization for long-term initiatives. We also offer a Hybrid model that combines elements of the above. Additionally, we provide Staff Augmentation where individual AI specialists join your existing team to fill specific skill gaps. Every engagement begins with a detailed scoping exercise to recommend the best-fit model.",
  },
  {
    question: "Do you provide ongoing support and maintenance?",
    answer:
      "Absolutely. We offer comprehensive post-deployment support including 24/7 production monitoring and incident response, model performance tracking and drift detection, periodic model retraining and optimization, infrastructure scaling and cost optimization, feature enhancements and new capability additions, SLA-backed support tiers (Standard, Premium, and Enterprise), and dedicated support engineers familiar with your systems. We believe AI solutions require continuous attention to maintain peak performance and deliver sustained business value over time.",
  },
  {
    question: "How do you measure AI project success?",
    answer:
      "We establish clear, measurable KPIs at the outset of every engagement aligned with your business objectives. These typically include model performance metrics such as accuracy, precision, recall, and F1 score, business impact metrics like revenue uplift, cost reduction, and efficiency gains, adoption and usage metrics including user engagement and task completion rates, time-to-value and return on investment calculations, and data quality and pipeline reliability scores. We provide dashboards and regular reporting to ensure full transparency, and we conduct formal business reviews to assess outcomes against the original success criteria.",
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="border border-white/10 rounded-xl bg-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 glow-card"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-accent/50 rounded-xl"
        aria-expanded={isOpen}
      >
        <span className="text-sm md:text-base font-semibold text-white pr-4 leading-snug">
          {item.question}
        </span>
        <span className="flex-shrink-0 ml-2">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isOpen
                ? "bg-accent text-white"
                : "bg-white/10 text-white/40"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v12M6 12h12"
              />
            </svg>
          </motion.div>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/10 pt-4">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const midpoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midpoint);
  const rightColumn = faqs.slice(midpoint);

  return (
    <section id="faq" className="py-20 bg-primary mesh-gradient-1 dot-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-2">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Everything you need to know about our AI consulting services,
            engagement models, and how we deliver measurable business outcomes.
          </p>
        </motion.div>

        {/* Two-Column Accordion Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {leftColumn.map((item, index) => (
              <FAQAccordionItem
                key={index}
                item={item}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
                index={index}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {rightColumn.map((item, index) => {
              const globalIndex = index + midpoint;
              return (
                <FAQAccordionItem
                  key={globalIndex}
                  item={item}
                  isOpen={openItems.has(globalIndex)}
                  onToggle={() => toggleItem(globalIndex)}
                  index={index}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 mb-4">
            Still have questions? We would love to hear from you.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl cta-glow"
          >
            Contact Us
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
