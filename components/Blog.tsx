"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const posts = [
  {
    id: 1,
    title: "How GenAI is Revolutionizing Customer Service in 2025",
    excerpt:
      "Discover how generative AI chatbots are transforming customer support with human-like conversations, 24/7 availability, and personalized experiences.",
    category: "GenAI",
    date: "Jan 28, 2025",
    readTime: "5 min read",
    gradient: "from-violet-500 to-indigo-600",
    content: `Generative AI is fundamentally changing how businesses interact with customers. Modern AI chatbots powered by large language models can understand context, handle complex queries, and provide personalized responses at scale.

Key trends we're seeing:

1. **Contextual Understanding** — New LLMs can maintain conversation context across multiple turns, making interactions feel natural and human-like.

2. **Multilingual Support** — GenAI models can seamlessly switch between languages, enabling global customer support without dedicated teams for each language.

3. **Proactive Engagement** — AI systems can now anticipate customer needs based on behavior patterns and reach out proactively with relevant information.

4. **Seamless Handoff** — When complex issues arise, AI agents can smoothly transfer conversations to human agents with full context preserved.

At Talents Hill Inc, our AI Chatbot Platform leverages these capabilities to help businesses reduce support costs by up to 60% while improving customer satisfaction scores.`,
  },
  {
    id: 2,
    title: "Mobile Robots in Warehouse Automation: A Complete Guide",
    excerpt:
      "Learn how autonomous mobile robots are optimizing warehouse operations, reducing costs, and improving order fulfillment speed.",
    category: "Robotics",
    date: "Jan 20, 2025",
    readTime: "7 min read",
    gradient: "from-orange-500 to-red-600",
    content: `Autonomous Mobile Robots (AMRs) are reshaping warehouse and logistics operations worldwide. Unlike traditional automated guided vehicles (AGVs), AMRs use advanced SLAM navigation and AI to move freely through dynamic environments.

Key benefits of mobile robot deployment:

1. **Increased Throughput** — AMRs can operate 24/7 without fatigue, increasing picking and sorting throughput by 200-300%.

2. **Flexible Deployment** — Unlike fixed conveyor systems, robots can be redeployed as warehouse layouts change.

3. **Fleet Intelligence** — Modern fleet management systems optimize task allocation across dozens of robots simultaneously.

4. **Safety First** — Advanced sensor fusion ensures safe operation alongside human workers.

Talents Hill Inc's Mobile Robot Solution provides everything from initial assessment to full-scale deployment, including integration with existing WMS and ERP systems.`,
  },
  {
    id: 3,
    title: "Smart Buildings: The Future of Energy Efficiency",
    excerpt:
      "How IoT sensors and AI-driven analytics are creating intelligent buildings that reduce energy consumption by up to 40%.",
    category: "IoT",
    date: "Jan 12, 2025",
    readTime: "6 min read",
    gradient: "from-teal-500 to-cyan-600",
    content: `The convergence of IoT sensors, cloud computing, and artificial intelligence is enabling a new generation of smart buildings that are more efficient, comfortable, and sustainable.

Core components of a smart building:

1. **Environmental Sensors** — Temperature, humidity, CO2, and light sensors provide real-time data about building conditions.

2. **AI-Driven HVAC** — Machine learning algorithms optimize heating and cooling based on occupancy patterns, weather forecasts, and energy prices.

3. **Occupancy Analytics** — Understanding how spaces are actually used enables better space planning and resource allocation.

4. **Predictive Maintenance** — Analyzing equipment data to predict failures before they occur, reducing downtime and repair costs.

Our Smart Building Platform integrates all these capabilities into a single dashboard, giving facility managers complete visibility and control.`,
  },
  {
    id: 4,
    title: "Wearable AI: From Fitness Tracking to Clinical Diagnostics",
    excerpt:
      "Embedded AI in wearable devices is enabling real-time health monitoring and early disease detection at unprecedented scale.",
    category: "Embedded",
    date: "Jan 5, 2025",
    readTime: "8 min read",
    gradient: "from-pink-500 to-rose-600",
    content: `Wearable technology has evolved far beyond simple step counting. Today's AI-powered wearables can monitor vital signs, detect anomalies, and even predict health events before they occur.

The evolution of wearable intelligence:

1. **On-Device ML** — TinyML models running on ultra-low-power chips enable real-time analysis without cloud dependency.

2. **Multi-Sensor Fusion** — Combining data from heart rate, SpO2, accelerometer, and other sensors provides a holistic health picture.

3. **Clinical Grade Accuracy** — New sensor technologies and algorithms are achieving accuracy levels suitable for medical diagnostics.

4. **Continuous Monitoring** — Battery optimizations enable multi-day continuous monitoring for chronic condition management.

Talents Hill Inc's Wearable Intelligence Platform provides the complete stack from hardware reference designs to cloud analytics dashboards.`,
  },
  {
    id: 5,
    title: "Data Integration Strategies for the Modern Enterprise",
    excerpt:
      "Building a unified data foundation is critical for AI success. Learn the best practices for enterprise data integration in 2025.",
    category: "Analytics",
    date: "Dec 28, 2024",
    readTime: "6 min read",
    gradient: "from-blue-500 to-indigo-600",
    content: `Successful AI and analytics initiatives depend on having clean, unified, and accessible data. Yet most enterprises struggle with data silos, inconsistent formats, and quality issues.

Modern data integration best practices:

1. **Data Mesh Architecture** — Decentralized data ownership with federated governance enables scale while maintaining quality.

2. **Real-Time Streaming** — Event-driven architectures with tools like Kafka enable real-time data processing and analytics.

3. **API-First Integration** — Modern APIs make it easier to connect systems and share data across the organization.

4. **Data Quality Automation** — ML-powered data quality tools can automatically detect and fix issues at scale.

Our Data Integration services help enterprises build robust, scalable data foundations that power AI and analytics initiatives.`,
  },
  {
    id: 6,
    title: "AI in Banking: Fighting Fraud with Machine Learning",
    excerpt:
      "How machine learning models are detecting fraudulent transactions in real-time, saving banks billions annually.",
    category: "Banking",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    gradient: "from-emerald-500 to-green-600",
    content: `Financial fraud is becoming increasingly sophisticated, but AI-powered detection systems are staying one step ahead. Modern ML models can analyze thousands of transaction features in milliseconds to identify suspicious patterns.

Key approaches in fraud detection:

1. **Real-Time Scoring** — Every transaction is scored by ML models in under 50ms, enabling instant fraud blocking.

2. **Behavioral Biometrics** — Analyzing how users interact with devices (typing patterns, touch pressure) adds an invisible security layer.

3. **Network Analysis** — Graph-based models identify fraud rings by analyzing relationships between accounts and transactions.

4. **Adaptive Learning** — Models continuously retrain on new fraud patterns, staying ahead of evolving threats.

Talents Hill Inc's Banking AI solutions have helped financial institutions reduce fraud losses by 70% while minimizing false positives that frustrate legitimate customers.`,
  },
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);

  return (
    <section id="blog" className="py-24 bg-primary mesh-gradient-3 section-glow-top relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-96 h-96 bg-accent/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Insights & Articles
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Our Blog
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Stay updated with the latest trends in AI, robotics, IoT, and
            analytics from our team of experts.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/10 rounded-xl p-1.5 shadow-sm gap-1 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === cat
                    ? "bg-primary text-white shadow"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blog grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((post, i) => (
              <motion.article
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="card-hover glow-card cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-white/10 h-full flex flex-col">
                  {/* Card header with gradient */}
                  <div className={`bg-gradient-to-r ${post.gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <span className="relative inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 bg-white/30 rounded-full" />
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-accent text-sm font-semibold">
                        Read Article
                      </span>
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Blog post modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${selectedPost.gradient} p-8 relative overflow-hidden sticky top-0`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="relative">
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {selectedPost.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-3 text-white/70 text-sm mt-3">
                    <span>{selectedPost.date}</span>
                    <span className="w-1 h-1 bg-white/50 rounded-full" />
                    <span>{selectedPost.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-8">
                <div className="prose prose-gray max-w-none">
                  {selectedPost.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-white/60 leading-relaxed mb-4">
                      {para.split("**").map((segment, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="text-primary font-semibold">
                            {segment}
                          </strong>
                        ) : (
                          segment
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
