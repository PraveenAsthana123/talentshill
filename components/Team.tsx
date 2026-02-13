"use client";

import { motion } from "framer-motion";

const team = [
  {
    name: "Praveen Asthana",
    role: "Founder & CEO",
    bio: "20+ years in analytics consulting, former senior leader at top consulting firms.",
    initials: "PA",
    gradient: "from-blue-500 to-indigo-600",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Sarah Chen",
    role: "Head of AI & GenAI",
    bio: "PhD in Machine Learning, expertise in NLP, LLMs, and conversational AI systems.",
    initials: "SC",
    gradient: "from-violet-500 to-purple-600",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Michael Torres",
    role: "Director of Robotics",
    bio: "15+ years in robotics engineering, specializing in autonomous mobile robots and RPA.",
    initials: "MT",
    gradient: "from-orange-500 to-red-600",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Priya Sharma",
    role: "Head of IoT Solutions",
    bio: "Expert in IoT architecture, smart buildings, and edge computing platforms.",
    initials: "PS",
    gradient: "from-teal-500 to-cyan-600",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "David Kim",
    role: "Lead Data Scientist",
    bio: "Specialist in predictive modeling, customer analytics, and marketing science.",
    initials: "DK",
    gradient: "from-pink-500 to-rose-600",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Emily Watson",
    role: "VP of Client Success",
    bio: "Passionate about delivering measurable business impact through data-driven strategies.",
    initials: "EW",
    gradient: "from-emerald-500 to-green-600",
    social: { linkedin: "#", twitter: "#" },
  },
];

export default function Team() {
  return (
    <section id="team" className="py-24 bg-primary mesh-gradient-2 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Our People
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Meet the Team
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Experienced leaders and technologists driving innovation across AI,
            robotics, IoT, and analytics.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-hover glow-card group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                {/* Gradient header */}
                <div className={`bg-gradient-to-r ${member.gradient} p-8 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <div className="relative flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">
                      {member.initials}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-white group-hover:text-accent-light transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-accent-light text-sm font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">
                    {member.bio}
                  </p>

                  {/* Social links */}
                  <div className="flex justify-center gap-3">
                    <a
                      href={member.social.linkedin}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:bg-accent hover:text-white transition-all"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href={member.social.twitter}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:bg-accent hover:text-white transition-all"
                      aria-label={`${member.name} Twitter`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
