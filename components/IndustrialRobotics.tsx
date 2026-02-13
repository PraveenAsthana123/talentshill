"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Robot Brands ─── */
const brands = [
  {
    id: "abb",
    name: "ABB Robotics",
    tagline: "Leading the Way in Flexible Automation",
    color: "from-red-600 to-red-800",
    accent: "text-red-400",
    bgAccent: "bg-red-500/10",
    borderAccent: "border-red-500/30",
    series: [
      { name: "IRB 1200", type: "Compact 6-axis", payload: "5-7 kg", reach: "0.7-0.9 m", use: "Assembly, material handling" },
      { name: "IRB 2600", type: "Versatile 6-axis", payload: "12-20 kg", reach: "1.65-1.85 m", use: "Arc welding, machine tending" },
      { name: "IRB 4600", type: "Industrial 6-axis", payload: "20-60 kg", reach: "2.05-2.55 m", use: "Material handling, press tending" },
      { name: "IRB 6700", type: "Heavy-duty 6-axis", payload: "150-300 kg", reach: "2.6-3.2 m", use: "Spot welding, heavy handling" },
      { name: "YuMi (IRB 14000)", type: "Dual-arm Cobot", payload: "0.5 kg/arm", reach: "0.56 m", use: "Electronics assembly, lab automation" },
      { name: "GoFa CRB 15000", type: "Collaborative", payload: "5 kg", reach: "0.95 m", use: "Machine tending, palletizing" },
    ],
    strengths: ["RobotStudio digital twin", "OmniCore controller platform", "FlexPendant intuitive programming", "ABB Ability cloud connectivity"],
  },
  {
    id: "fanuc",
    name: "FANUC Robotics",
    tagline: "Reliability and Precision at Scale",
    color: "from-yellow-500 to-yellow-700",
    accent: "text-yellow-400",
    bgAccent: "bg-yellow-500/10",
    borderAccent: "border-yellow-500/30",
    series: [
      { name: "LR Mate 200iD", type: "Mini 6-axis", payload: "7 kg", reach: "0.72 m", use: "Assembly, testing, dispensing" },
      { name: "M-20iD", type: "Mid-range 6-axis", payload: "25-35 kg", reach: "1.83-2.01 m", use: "Welding, handling, cutting" },
      { name: "R-2000iC", type: "Heavy-duty 6-axis", payload: "100-270 kg", reach: "2.66-3.1 m", use: "Spot welding, press handling" },
      { name: "M-710iC", type: "Process 6-axis", payload: "12-70 kg", reach: "1.36-3.12 m", use: "Arc welding, dispensing" },
      { name: "CR-35iA", type: "Collaborative", payload: "35 kg", reach: "1.83 m", use: "Heavy-duty collaborative tasks" },
      { name: "CRX-10iA", type: "Lightweight Cobot", payload: "10 kg", reach: "1.25 m", use: "Inspection, machine tending" },
    ],
    strengths: ["iRVision integrated vision", "ROBOGUIDE simulation", "ZDT (Zero Down Time) analytics", "30+ year mean time between failure"],
  },
  {
    id: "kuka",
    name: "KUKA Robotics",
    tagline: "Intelligent Automation for Industry 4.0",
    color: "from-orange-500 to-orange-700",
    accent: "text-orange-400",
    bgAccent: "bg-orange-500/10",
    borderAccent: "border-orange-500/30",
    series: [
      { name: "KR CYBERTECH", type: "Compact 6-axis", payload: "8-22 kg", reach: "1.61-2.01 m", use: "Handling, assembly, welding" },
      { name: "KR QUANTEC", type: "High-performance", payload: "90-300 kg", reach: "2.5-3.1 m", use: "Palletizing, foundry, machining" },
      { name: "KR FORTEC", type: "Heavy-duty", payload: "360-600 kg", reach: "2.83-3.33 m", use: "Heavy handling, pressing, casting" },
      { name: "KR IONTEC", type: "Mid-range", payload: "30-70 kg", reach: "2.05-2.5 m", use: "Arc welding, dispensing, handling" },
      { name: "LBR iiwa", type: "Sensitive Cobot", payload: "7-14 kg", reach: "0.8-0.93 m", use: "Precision assembly, testing" },
      { name: "LBR iisy", type: "Easy Cobot", payload: "3-15 kg", reach: "0.6-1.3 m", use: "Machine tending, pick & place" },
    ],
    strengths: ["KUKA.Sim digital twin", "KR C5 micro controller", "KUKA.OS open platform", "Ready2 pre-configured packages"],
  },
  {
    id: "universal",
    name: "Universal Robots",
    tagline: "Cobots That Work Alongside Humans",
    color: "from-blue-500 to-blue-700",
    accent: "text-blue-400",
    bgAccent: "bg-blue-500/10",
    borderAccent: "border-blue-500/30",
    series: [
      { name: "UR3e", type: "Tabletop Cobot", payload: "3 kg", reach: "0.5 m", use: "Light assembly, lab automation" },
      { name: "UR5e", type: "Versatile Cobot", payload: "5 kg", reach: "0.85 m", use: "Machine tending, quality inspection" },
      { name: "UR10e", type: "Mid-range Cobot", payload: "12.5 kg", reach: "1.3 m", use: "Palletizing, packaging, welding" },
      { name: "UR16e", type: "Heavy-lift Cobot", payload: "16 kg", reach: "0.9 m", use: "CNC machine tending, heavy handling" },
      { name: "UR20", type: "Next-gen Cobot", payload: "20 kg", reach: "1.75 m", use: "Welding, palletizing, material handling" },
      { name: "UR30", type: "High-payload Cobot", payload: "30 kg", reach: "1.3 m", use: "Machine tending, heavy-duty tasks" },
    ],
    strengths: ["UR+ ecosystem (300+ components)", "Polyscope intuitive UI", "UR Academy free training", "Safety-certified (ISO 10218-1)"],
  },
  {
    id: "yaskawa",
    name: "Yaskawa Motoman",
    tagline: "500,000+ Robots Deployed Worldwide",
    color: "from-blue-600 to-indigo-700",
    accent: "text-indigo-400",
    bgAccent: "bg-indigo-500/10",
    borderAccent: "border-indigo-500/30",
    series: [
      { name: "GP7", type: "Compact 6-axis", payload: "7 kg", reach: "0.93 m", use: "Assembly, packaging, dispensing" },
      { name: "GP25", type: "Handling 6-axis", payload: "25 kg", reach: "1.73 m", use: "Machine tending, material handling" },
      { name: "GP180", type: "Heavy-duty 6-axis", payload: "180 kg", reach: "2.7 m", use: "Spot welding, press handling" },
      { name: "AR1440", type: "Arc welding", payload: "12 kg", reach: "1.44 m", use: "Arc welding, cutting" },
      { name: "HC10DT", type: "Collaborative", payload: "10 kg", reach: "1.2 m", use: "Assembly, machine tending" },
      { name: "HC20DT", type: "Heavy Cobot", payload: "20 kg", reach: "1.7 m", use: "Palletizing, packaging" },
    ],
    strengths: ["YRC1000 controller", "MotoSim EG-VRC simulation", "Singular Control (multi-robot)", "Smart Pendant easy teach"],
  },
];

/* ─── Services ─── */
const services = [
  {
    id: "design",
    title: "Cell Design & Engineering",
    tagline: "From concept to 3D simulation",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    color: "from-violet-500 to-purple-600",
    phases: [
      { step: "Requirements Analysis", detail: "Process study, cycle time targets, payload/reach analysis" },
      { step: "Concept Design", detail: "Robot selection, end-effector design, cell layout" },
      { step: "3D Simulation", detail: "Offline programming, reach studies, collision detection" },
      { step: "Detailed Engineering", detail: "Electrical schematics, pneumatic layouts, safety design" },
    ],
    deliverables: ["3D Cell Layout", "Robot Program (OLP)", "Bill of Materials", "Safety Risk Assessment"],
  },
  {
    id: "installation",
    title: "Installation & Commissioning",
    tagline: "Turnkey robot cell deployment",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.88-3.39a2 2 0 010-3.56l5.88-3.39a2 2 0 012 0l5.88 3.39a2 2 0 010 3.56l-5.88 3.39a2 2 0 01-2 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 8v6m-7 4v-6" />
      </svg>
    ),
    color: "from-emerald-500 to-green-600",
    phases: [
      { step: "Site Preparation", detail: "Foundation work, power supply, safety fencing" },
      { step: "Mechanical Install", detail: "Robot mounting, peripheral equipment, tooling" },
      { step: "Electrical & Controls", detail: "Wiring, PLC integration, I/O mapping, HMI setup" },
      { step: "Commissioning", detail: "Program loading, path optimization, cycle time validation" },
    ],
    deliverables: ["Commissioned Robot Cell", "Wiring Diagrams (As-Built)", "Test Protocols", "Handover Certificate"],
  },
  {
    id: "calibration",
    title: "Calibration & Precision",
    tagline: "Micron-level accuracy guaranteed",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "from-cyan-500 to-teal-600",
    phases: [
      { step: "Baseline Measurement", detail: "Laser tracker / ballbar test, TCP verification" },
      { step: "Kinematic Calibration", detail: "DH parameter correction, joint mastering, absolute accuracy" },
      { step: "Tool Calibration", detail: "TCP (Tool Center Point), tool frame, payload identification" },
      { step: "Validation & Certification", detail: "ISO 9283 compliance, repeatability & accuracy report" },
    ],
    deliverables: ["Calibration Certificate (ISO 9283)", "TCP Verification Report", "Accuracy Maps", "Before/After Comparison"],
  },
  {
    id: "maintenance",
    title: "Preventive Maintenance",
    tagline: "Maximize uptime, extend robot life",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "from-amber-500 to-orange-600",
    phases: [
      { step: "Inspection", detail: "Visual check, cable inspection, brake test, battery check" },
      { step: "Lubrication", detail: "Gear oil change, grease replenishment (per OEM schedule)" },
      { step: "Wear Analysis", detail: "Belt tension, bearing condition, backlash measurement" },
      { step: "Software Update", detail: "Controller firmware, safety software, backup & restore" },
    ],
    deliverables: ["Maintenance Report", "Wear Assessment", "Remaining Life Forecast", "Recommended Spares List"],
  },
  {
    id: "training",
    title: "Operator & Programmer Training",
    tagline: "Empower your team with certified skills",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: "from-pink-500 to-rose-600",
    phases: [
      { step: "Operator Fundamentals", detail: "Safety procedures, jog modes, program execution, recovery" },
      { step: "Basic Programming", detail: "Teach pendant, motion types, I/O control, tool frames" },
      { step: "Advanced Programming", detail: "Offline programming, sensor integration, vision-guided" },
      { step: "Maintenance Training", detail: "Troubleshooting, preventive maintenance, spare parts" },
    ],
    deliverables: ["Training Certificates", "Course Materials", "Lab Exercise Workbook", "Skills Assessment"],
  },
];

/* ─── Robot Arm SVG ─── */
function RobotArmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* Base */}
      <ellipse cx="32" cy="58" rx="14" ry="4" className="fill-white/5 stroke-white/20" />
      {/* Lower arm */}
      <line x1="32" y1="54" x2="22" y2="36" className="stroke-white/30" strokeWidth="3" />
      {/* Upper arm */}
      <line x1="22" y1="36" x2="36" y2="20" className="stroke-white/25" strokeWidth="2.5" />
      {/* Forearm */}
      <line x1="36" y1="20" x2="44" y2="14" className="stroke-white/20" strokeWidth="2" />
      {/* Joints */}
      <circle cx="32" cy="54" r="3" className="fill-accent/30 stroke-accent/50" />
      <circle cx="22" cy="36" r="2.5" className="fill-accent/30 stroke-accent/50" />
      <circle cx="36" cy="20" r="2" className="fill-accent/30 stroke-accent/50" />
      {/* End effector */}
      <circle cx="44" cy="14" r="3" className="fill-accent/20 stroke-accent" />
      <line x1="42" y1="11" x2="41" y2="8" className="stroke-accent/60" strokeWidth="1.5" />
      <line x1="46" y1="11" x2="47" y2="8" className="stroke-accent/60" strokeWidth="1.5" />
    </svg>
  );
}

export default function IndustrialRobotics() {
  const [activeBrand, setActiveBrand] = useState(0);
  const [activeService, setActiveService] = useState<number | null>(null);
  const [expandedRobot, setExpandedRobot] = useState<number | null>(null);
  const brand = brands[activeBrand];

  const toggleService = useCallback((idx: number) => {
    setActiveService((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section id="industrial-robotics" className="py-24 bg-primary relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      {/* Decorative robot arm silhouettes */}
      <div className="absolute top-32 right-8 opacity-[0.04] pointer-events-none hidden lg:block">
        <RobotArmIcon className="w-48 h-48" />
      </div>
      <div className="absolute bottom-32 left-8 opacity-[0.04] pointer-events-none hidden lg:block scale-x-[-1]">
        <RobotArmIcon className="w-36 h-36" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Industrial Robotics Services
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Robot Integration <span className="text-accent">Experts</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            End-to-end industrial robot services — design, installation, calibration, maintenance, and training
            across ABB, FANUC, KUKA, Universal Robots, and Yaskawa platforms.
          </p>
        </motion.div>

        {/* ── PART 1: Robot Brands ── */}
        <div className="mb-20">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6 text-center">Robot Platforms We Support</h3>

          {/* Brand tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white/5 rounded-2xl p-1.5 gap-1 flex-wrap justify-center border border-white/10">
              {brands.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBrand(i); setExpandedRobot(null); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    i === activeBrand
                      ? `bg-gradient-to-r ${b.color} text-white shadow-lg`
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {b.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Brand detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Brand header card */}
              <div className={`rounded-2xl border ${brand.borderAccent} ${brand.bgAccent} p-6 mb-6`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-white shadow-lg`}>
                    <RobotArmIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{brand.name}</h3>
                    <p className="text-sm text-white/50">{brand.tagline}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brand.strengths.map((s, j) => (
                      <span key={j} className="text-[10px] font-medium text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Robot series grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {brand.series.map((robot, i) => (
                  <motion.div
                    key={robot.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    onClick={() => setExpandedRobot(expandedRobot === i ? null : i)}
                    className={`cursor-pointer rounded-xl border transition-all p-4 ${
                      expandedRobot === i
                        ? `bg-white/[0.08] ${brand.borderAccent}`
                        : "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-white text-sm">{robot.name}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${brand.bgAccent} ${brand.accent}`}>
                        {robot.type}
                      </span>
                    </div>

                    <AnimatePresence>
                      {expandedRobot === i ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                            <div>
                              <p className="text-[9px] text-white/30 uppercase tracking-wider">Payload</p>
                              <p className="text-xs text-white/70 font-semibold">{robot.payload}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/30 uppercase tracking-wider">Reach</p>
                              <p className="text-xs text-white/70 font-semibold">{robot.reach}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[9px] text-white/30 uppercase tracking-wider">Applications</p>
                              <p className="text-xs text-white/60">{robot.use}</p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-[11px] text-white/40">{robot.payload} &middot; {robot.reach}</p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── PART 2: Services ── */}
        <div>
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-8 text-center">Our Services</h3>

          <div className="grid md:grid-cols-5 gap-3 mb-6">
            {services.map((svc, i) => (
              <motion.button
                key={svc.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                onClick={() => toggleService(i)}
                className={`group rounded-xl border p-4 text-left transition-all ${
                  activeService === i
                    ? `bg-white/[0.08] border-accent/40 shadow-lg shadow-accent/10`
                    : "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                  {svc.icon}
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{svc.title}</h4>
                <p className="text-[11px] text-white/40">{svc.tagline}</p>
              </motion.button>
            ))}
          </div>

          {/* Expanded service detail */}
          <AnimatePresence>
            {activeService !== null && (
              <motion.div
                key={services[activeService].id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden"
              >
                <div className={`rounded-2xl border border-accent/30 bg-white/[0.06] p-6`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${services[activeService].color} flex items-center justify-center text-white`}>
                      {services[activeService].icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{services[activeService].title}</h4>
                      <p className="text-xs text-white/40">{services[activeService].tagline}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Process phases */}
                    <div>
                      <h5 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-4">Service Process</h5>
                      <div className="space-y-3">
                        {services[activeService].phases.map((phase, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.08, duration: 0.25 }}
                            className="flex gap-3"
                          >
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${services[activeService].color} text-white text-[10px] font-bold flex items-center justify-center`}>
                                {j + 1}
                              </div>
                              {j < services[activeService].phases.length - 1 && (
                                <div className="w-px flex-1 bg-white/10 mt-1" />
                              )}
                            </div>
                            <div className="pb-3">
                              <p className="text-sm font-semibold text-white">{phase.step}</p>
                              <p className="text-[11px] text-white/50">{phase.detail}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <h5 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-4">Deliverables</h5>
                      <div className="space-y-2">
                        {services[activeService].deliverables.map((d, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: j * 0.06, duration: 0.2 }}
                            className="flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-lg px-4 py-3"
                          >
                            <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-white/70">{d}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Supported brands badge row */}
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Available for all platforms</p>
                        <div className="flex gap-2 flex-wrap">
                          {brands.map((b) => (
                            <span key={b.id} className={`text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${b.color} text-white`}>
                              {b.name.split(" ")[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { value: "5", label: "Robot Brands" },
            { value: "30", label: "Robot Models" },
            { value: "5", label: "Core Services" },
            { value: "20", label: "Process Steps" },
            { value: "20", label: "Deliverables" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center hover:bg-white/[0.08] transition-colors"
            >
              <p className="text-xl font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
