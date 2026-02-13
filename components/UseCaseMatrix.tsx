"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Segment = "b2b" | "b2c" | "b2e";

const segments: { key: Segment; label: string; full: string; color: string; icon: React.ReactNode }[] = [
  {
    key: "b2b",
    label: "B2B",
    full: "Business-to-Business",
    color: "from-blue-500 to-indigo-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    key: "b2c",
    label: "B2C",
    full: "Business-to-Consumer",
    color: "from-emerald-500 to-green-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: "b2e",
    label: "B2E",
    full: "Business-to-Employee",
    color: "from-amber-500 to-orange-600",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

const technologies = [
  {
    id: "ai-ml",
    name: "AI / ML & GenAI",
    icon: "🧠",
    color: "from-violet-500 to-purple-600",
    b2b: [
      { title: "Predictive Lead Scoring", desc: "ML models that rank prospect accounts by conversion likelihood, integrated into CRM pipelines.", industry: "SaaS / Enterprise Sales" },
      { title: "Supply Chain Demand Forecasting", desc: "Time-series AI predicting inventory needs across distribution networks to reduce stockouts & overstock.", industry: "Manufacturing / Logistics" },
      { title: "Contract Intelligence (RAG)", desc: "GenAI-powered contract review extracting clauses, obligations, and risk from thousands of legal documents.", industry: "Legal / Procurement" },
      { title: "B2B Pricing Optimization", desc: "Dynamic pricing engine using competitive intelligence, demand elasticity, and customer segmentation.", industry: "Wholesale / Distribution" },
      { title: "Fraud Detection Platform", desc: "Real-time transaction scoring using ensemble ML models for payment processors and banks.", industry: "FinTech / Banking" },
      { title: "Text-to-SQL Analytics", desc: "Natural language interface letting business users query data warehouses without writing SQL.", industry: "Cross-industry" },
    ],
    b2c: [
      { title: "Personalized Recommendation Engine", desc: "Collaborative + content-based filtering for e-commerce product suggestions and streaming content.", industry: "Retail / Entertainment" },
      { title: "AI Health Coach", desc: "GenAI chatbot providing personalized nutrition, fitness, and wellness advice from wearable data.", industry: "Health & Wellness" },
      { title: "Smart Home Energy Optimizer", desc: "ML model predicting usage patterns to auto-schedule appliances for lowest cost & carbon footprint.", industry: "Smart Home / Utilities" },
      { title: "AI Tutor & Learning Companion", desc: "Adaptive learning platform that adjusts difficulty, generates practice problems, and explains concepts.", industry: "EdTech" },
      { title: "Visual Search & Try-On", desc: "Computer vision enabling photo-based product search and AR virtual try-on for fashion/beauty.", industry: "Fashion / Beauty" },
      { title: "AI Financial Advisor", desc: "Robo-advisor using ML for portfolio allocation, tax-loss harvesting, and retirement planning.", industry: "Personal Finance" },
    ],
    b2e: [
      { title: "Intelligent Document Processing", desc: "Automated extraction of data from invoices, receipts, and forms using OCR + NLP, reducing manual data entry.", industry: "Finance / Operations" },
      { title: "AI Copilot for Developers", desc: "Code generation, review, and documentation assistant integrated into IDE workflows.", industry: "Engineering / IT" },
      { title: "Employee Knowledge Base (RAG)", desc: "GenAI-powered internal Q&A system trained on company wikis, policies, and SOPs.", industry: "HR / Operations" },
      { title: "Meeting Summarizer & Action Tracker", desc: "Automatic transcription, summarization, and action-item extraction from meetings.", industry: "Cross-functional" },
      { title: "Talent Matching & Screening", desc: "ML-powered resume parsing, skill matching, and candidate ranking for recruitment teams.", industry: "HR / Recruiting" },
      { title: "Predictive Maintenance Alerts", desc: "ML models on equipment telemetry predicting failures before they happen, reducing downtime.", industry: "Facilities / Manufacturing" },
    ],
  },
  {
    id: "robotics",
    name: "Industrial Robotics",
    icon: "🤖",
    color: "from-red-500 to-rose-600",
    b2b: [
      { title: "Automated Welding Cell", desc: "ABB/FANUC robot cells for MIG/TIG welding with seam tracking and quality inspection.", industry: "Automotive / Metal Fabrication" },
      { title: "Palletizing & Depalletizing", desc: "High-speed robotic palletizing with mixed-SKU pattern recognition and dynamic layer planning.", industry: "FMCG / Logistics" },
      { title: "CNC Machine Tending", desc: "Cobot (UR/KUKA) loading/unloading CNC machines with vision-guided part orientation.", industry: "Precision Manufacturing" },
      { title: "Quality Inspection (Vision)", desc: "6-axis robot + multi-camera system for 100% surface inspection and dimensional measurement.", industry: "Electronics / Pharma" },
      { title: "Packaging & Assembly Line", desc: "Multi-robot assembly cells with force-torque sensing for delicate product packaging.", industry: "Consumer Goods" },
      { title: "Robotic Process Automation (Physical)", desc: "End-to-end material handling from warehouse to production line using AGV + robot arm coordination.", industry: "Warehouse / Distribution" },
    ],
    b2c: [
      { title: "Robotic Kitchen / Food Prep", desc: "Consumer-facing robot arms preparing customized meals, smoothies, or coffee in retail venues.", industry: "Food & Beverage" },
      { title: "Personal Assistant Robot", desc: "Home service robots for elderly care, cleaning, and companion interaction.", industry: "Consumer Electronics" },
      { title: "Robotic Retail Kiosk", desc: "Automated vending/service kiosks using robotic arms for product retrieval and customization.", industry: "Retail" },
      { title: "Educational Robot Kit", desc: "Consumer robotics kits (arm/mobile) with app-based programming for STEM education.", industry: "Education" },
    ],
    b2e: [
      { title: "Cobot Workstation Assistant", desc: "Collaborative robot alongside workers for repetitive tasks — lifting, screwing, gluing — reducing RSI.", industry: "Manufacturing" },
      { title: "Warehouse Pick & Pack", desc: "Robot-assisted picking systems integrated with WMS for employee order fulfillment.", industry: "Logistics / E-commerce" },
      { title: "Robot Training Simulator", desc: "VR/digital-twin simulation for training operators on robot programming without production downtime.", industry: "Training / HR" },
      { title: "Exoskeleton for Heavy Lifting", desc: "Powered exoskeleton reducing physical strain for warehouse and construction workers.", industry: "Construction / Logistics" },
    ],
  },
  {
    id: "wearable",
    name: "Wearable & Embedded",
    icon: "⌚",
    color: "from-cyan-500 to-teal-600",
    b2b: [
      { title: "Connected Worker Platform", desc: "Smart helmet/vest with gas detection, location tracking, and real-time safety alerts for field crews.", industry: "Oil & Gas / Mining" },
      { title: "Fleet Driver Monitoring", desc: "Wearable fatigue & drowsiness detection for commercial vehicle fleets with fleet manager dashboard.", industry: "Transportation / Logistics" },
      { title: "Remote Patient Monitoring (RPM)", desc: "Medical-grade wearable patches streaming ECG/SpO2 to hospital systems for chronic disease management.", industry: "Healthcare / Pharma" },
      { title: "Smart Agriculture Sensors", desc: "Embedded soil/weather sensor networks with LoRaWAN connectivity and AI-powered crop advisory.", industry: "Agriculture" },
      { title: "Industrial Asset Tracker", desc: "BLE/UWB embedded tags on tools, pallets, and WIP for real-time location and utilization analytics.", industry: "Manufacturing / Logistics" },
      { title: "Environmental Monitoring", desc: "Embedded sensor nodes measuring air quality, noise, vibration, and temperature for compliance.", industry: "Smart City / Construction" },
    ],
    b2c: [
      { title: "Fitness & Wellness Wearable", desc: "Consumer smartwatch/band with heart rate, sleep tracking, stress scoring, and AI coaching.", industry: "Health & Wellness" },
      { title: "Smart Hearing Aid", desc: "AI-powered hearable with real-time noise cancellation, speech enhancement, and audiogram personalization.", industry: "Consumer Audio / Medical" },
      { title: "Kids GPS Watch", desc: "Child safety wearable with location tracking, geo-fencing, SOS button, and parent app.", industry: "Consumer / Parenting" },
      { title: "Smart Ring (Health)", desc: "Compact form-factor wearable tracking HRV, temperature, SpO2, and sleep stages.", industry: "Consumer Health" },
      { title: "AR Glasses for Navigation", desc: "Lightweight smart glasses with turn-by-turn AR overlay for walking/cycling navigation.", industry: "Consumer Electronics" },
      { title: "Pet Health Tracker", desc: "Embedded collar device monitoring pet activity, temperature, and location with owner app.", industry: "Pet Care" },
    ],
    b2e: [
      { title: "Warehouse Pick-by-Vision", desc: "AR glasses guiding warehouse workers to correct bin locations with hands-free scanning.", industry: "Logistics / E-commerce" },
      { title: "Field Service AR Assist", desc: "Smart glasses streaming video to remote experts for real-time maintenance guidance.", industry: "Utilities / Telecom" },
      { title: "Employee Wellness Band", desc: "Corporate wellness program wearable tracking steps, stress, and ergonomic posture alerts.", industry: "Corporate HR" },
      { title: "Safety Proximity Alert", desc: "UWB wearable tag alerting workers when too close to heavy machinery or restricted zones.", industry: "Construction / Manufacturing" },
      { title: "Training Biofeedback", desc: "Wearable monitoring heart rate, galvanic skin response during training simulations for performance scoring.", industry: "Defense / Aviation" },
    ],
  },
  {
    id: "bci",
    name: "Brain-Computer Interface",
    icon: "🧬",
    color: "from-pink-500 to-rose-600",
    b2b: [
      { title: "Neuromarketing Research", desc: "EEG/fNIRS-based consumer attention & emotion measurement for ad testing and product design.", industry: "Marketing / Advertising" },
      { title: "Cognitive Workload Monitoring", desc: "Real-time EEG-based operator workload assessment for air traffic control, surgery, and power plants.", industry: "Aviation / Energy / Healthcare" },
      { title: "BCI-Powered Rehabilitation Device", desc: "Motor-imagery EEG controlling robotic exoskeletons for post-stroke upper-limb rehabilitation.", industry: "Medical Devices" },
      { title: "Epilepsy Monitoring System", desc: "Continuous EEG monitoring with AI seizure prediction and automated alert to clinical teams.", industry: "Healthcare / Neurotech" },
      { title: "Sleep Lab Automation", desc: "Automated polysomnography (EEG+EMG+EOG) staging using deep learning for sleep clinics.", industry: "Sleep Medicine" },
      { title: "Drug Response Biomarker", desc: "EEG-based pharmacodynamic biomarkers measuring CNS drug effects in clinical trials.", industry: "Pharmaceutical" },
    ],
    b2c: [
      { title: "Meditation & Focus Headband", desc: "Consumer EEG headband with real-time neurofeedback for meditation, focus training, and stress reduction.", industry: "Wellness / Consumer Tech" },
      { title: "Neurogaming Controller", desc: "BCI headset enabling thought-controlled game mechanics — concentration, relaxation, and motor imagery.", industry: "Gaming / Entertainment" },
      { title: "Sleep Improvement Device", desc: "Wearable EEG detecting sleep stages and delivering auditory stimulation to enhance deep sleep.", industry: "Consumer Health" },
      { title: "ADHD Neurofeedback Training", desc: "Home-use EEG neurofeedback system for attention training in children and adults with ADHD.", industry: "Digital Therapeutics" },
      { title: "Brain-Controlled Accessibility", desc: "P300/SSVEP BCI enabling people with severe motor disabilities to control computers and smart homes.", industry: "Assistive Technology" },
    ],
    b2e: [
      { title: "Operator Fatigue Detection", desc: "EEG-based real-time drowsiness detection for truck drivers, pilots, and machine operators with alerts.", industry: "Transportation / Manufacturing" },
      { title: "Cognitive Training Platform", desc: "EEG neurofeedback for employee cognitive enhancement — focus, memory, and stress resilience.", industry: "Corporate Training" },
      { title: "Stress & Burnout Monitoring", desc: "Passive EEG/HRV wearable detecting chronic stress patterns with HR dashboard and intervention prompts.", industry: "Corporate HR / Wellness" },
      { title: "Skill Acquisition Accelerator", desc: "BCI-guided training measuring neural proficiency during skill learning (surgery, piloting, coding).", industry: "Training / Education" },
    ],
  },
  {
    id: "iot",
    name: "IoT & Edge AI",
    icon: "📡",
    color: "from-indigo-500 to-blue-600",
    b2b: [
      { title: "Predictive Maintenance (IIoT)", desc: "Vibration, temperature, and current sensors on machinery with edge AI detecting failure signatures.", industry: "Manufacturing / Energy" },
      { title: "Smart Building Management", desc: "IoT sensors for HVAC, lighting, occupancy, and energy optimization with digital twin dashboard.", industry: "Real Estate / Facilities" },
      { title: "Cold Chain Monitoring", desc: "Cellular IoT sensors tracking temperature, humidity, and location of perishable goods in transit.", industry: "Pharma / Food & Beverage" },
      { title: "Smart Grid / Utility Metering", desc: "Edge-connected smart meters with load forecasting and demand-response optimization.", industry: "Utilities / Energy" },
      { title: "Connected Fleet Telematics", desc: "OBD-II/CAN bus devices with edge processing for fuel optimization, route planning, and compliance.", industry: "Transportation" },
      { title: "Water Quality Monitoring", desc: "Sensor networks measuring pH, turbidity, chlorine, and flow with real-time anomaly detection.", industry: "Utilities / Environment" },
    ],
    b2c: [
      { title: "Smart Home Hub", desc: "Matter/Thread-enabled home hub coordinating lights, locks, cameras, and appliances with voice control.", industry: "Consumer Electronics" },
      { title: "Connected Garden", desc: "Solar-powered soil moisture, light, and weather sensors with automated irrigation and plant care app.", industry: "Consumer / Agriculture" },
      { title: "Personal Air Quality Monitor", desc: "Portable PM2.5, CO2, VOC sensor with app alerts and historical trends for health-conscious consumers.", industry: "Consumer Health" },
      { title: "Smart Pet Feeder", desc: "Wi-Fi connected auto-feeder with portion control, camera, and scheduled feeding via mobile app.", industry: "Pet Care" },
      { title: "Energy Monitor & Solar Tracker", desc: "Real-time home energy consumption dashboard with solar production tracking and grid export optimization.", industry: "Smart Home / Energy" },
    ],
    b2e: [
      { title: "Smart Office Occupancy", desc: "Desk/room sensors optimizing space utilization, HVAC, and cleaning schedules for hybrid workplaces.", industry: "Corporate Real Estate" },
      { title: "Tool & Equipment Tracking", desc: "BLE/UWB tags on tools and equipment with utilization analytics and loss prevention alerts.", industry: "Construction / Manufacturing" },
      { title: "Employee Environment Comfort", desc: "Desk-level temperature, noise, and light sensors with personal comfort adjustment controls.", industry: "Corporate Facilities" },
      { title: "Digital Badge & Access", desc: "IoT-enabled smart badges for access control, attendance, location analytics, and emergency mustering.", industry: "Corporate Security" },
    ],
  },
  {
    id: "data",
    name: "Data & Analytics",
    icon: "📊",
    color: "from-orange-500 to-amber-600",
    b2b: [
      { title: "Customer 360 Platform", desc: "Unified customer data platform aggregating CRM, marketing, support, and product usage into a single view.", industry: "SaaS / Enterprise" },
      { title: "Revenue Intelligence Dashboard", desc: "Real-time pipeline analytics, win/loss analysis, and revenue forecasting for sales leadership.", industry: "Sales / SaaS" },
      { title: "Regulatory Reporting Automation", desc: "Automated data extraction, validation, and regulatory report generation (Basel III, SOX, GDPR).", industry: "Banking / Insurance" },
      { title: "Competitive Intelligence Engine", desc: "Web scraping, NLP, and trend analysis platform monitoring competitor pricing, features, and reviews.", industry: "Strategy / Marketing" },
      { title: "Supply Chain Visibility", desc: "End-to-end supply chain analytics with supplier risk scoring, lead time prediction, and cost optimization.", industry: "Retail / Manufacturing" },
    ],
    b2c: [
      { title: "Personal Finance Dashboard", desc: "Aggregated bank, investment, and spending analytics with AI-powered savings recommendations.", industry: "FinTech" },
      { title: "Health Data Hub", desc: "Consumer platform aggregating wearable, lab, and EHR data into a unified health timeline.", industry: "Health Tech" },
      { title: "Real Estate Market Insights", desc: "Consumer-facing property valuation, neighborhood scoring, and market trend analytics.", industry: "PropTech" },
      { title: "Educational Progress Analytics", desc: "Student-facing learning analytics showing skill gaps, progress, and personalized study plans.", industry: "EdTech" },
    ],
    b2e: [
      { title: "People Analytics Platform", desc: "HR analytics on attrition risk, engagement scores, diversity metrics, and workforce planning.", industry: "HR" },
      { title: "Operational Excellence Dashboard", desc: "Cross-functional KPI dashboard integrating finance, operations, sales, and support metrics.", industry: "Operations / C-Suite" },
      { title: "IT Observability & AIOps", desc: "Unified infrastructure monitoring with anomaly detection, auto-remediation, and incident correlation.", industry: "IT / DevOps" },
      { title: "Sales Productivity Analytics", desc: "Per-rep activity metrics, pipeline velocity, and coaching insights for sales managers.", industry: "Sales Operations" },
    ],
  },
];

export default function UseCaseMatrix() {
  const [activeTech, setActiveTech] = useState(0);
  const [activeSegment, setActiveSegment] = useState<Segment>("b2b");
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const tech = technologies[activeTech];
  const cases = tech[activeSegment];

  return (
    <section id="use-cases-matrix" className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Use Case Library
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            B2B &middot; B2C &middot; <span className="text-accent">B2E</span> Use Cases
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Real-world applications across every technology — for enterprises, consumers,
            and employees. Select a technology and segment to explore.
          </p>
        </motion.div>

        {/* Technology selector */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-white/5 rounded-2xl p-1.5 gap-1 flex-wrap justify-center border border-white/10">
            {technologies.map((t, i) => (
              <button
                key={t.id}
                onClick={() => { setActiveTech(i); setExpandedCase(null); }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  i === activeTech
                    ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* B2B / B2C / B2E segment toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/5 rounded-xl p-1 gap-1 border border-white/10">
            {segments.map((seg) => (
              <button
                key={seg.key}
                onClick={() => { setActiveSegment(seg.key); setExpandedCase(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeSegment === seg.key
                    ? `bg-gradient-to-r ${seg.color} text-white shadow-lg`
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {seg.icon}
                <span>{seg.label}</span>
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {tech[seg.key].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Context bar */}
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center text-lg`}>
            {tech.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{tech.name}</h3>
            <p className="text-xs text-white/40">
              {segments.find((s) => s.key === activeSegment)?.full} — {cases.length} use cases
            </p>
          </div>
        </div>

        {/* Use case grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tech.id}-${activeSegment}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {cases.map((uc, i) => {
              const isExpanded = expandedCase === i;
              return (
                <motion.div
                  key={uc.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  onClick={() => setExpandedCase(isExpanded ? null : i)}
                  className={`cursor-pointer rounded-xl border transition-all ${
                    isExpanded
                      ? "bg-white/[0.08] border-accent/40 shadow-lg shadow-accent/10"
                      : "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-white text-sm leading-snug">{uc.title}</h4>
                      <motion.svg
                        className="w-4 h-4 text-white/25 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full mb-3 ${
                      segments.find((s) => s.key === activeSegment)?.key === "b2b"
                        ? "bg-blue-500/10 text-blue-400"
                        : activeSegment === "b2c"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {uc.industry}
                    </span>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-white/50 leading-relaxed mt-2 pt-3 border-t border-white/10">
                            {uc.desc}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { value: technologies.length.toString(), label: "Technologies" },
            {
              value: technologies.reduce((a, t) => a + t.b2b.length, 0).toString(),
              label: "B2B Use Cases",
            },
            {
              value: technologies.reduce((a, t) => a + t.b2c.length, 0).toString(),
              label: "B2C Use Cases",
            },
            {
              value: technologies.reduce((a, t) => a + t.b2e.length, 0).toString(),
              label: "B2E Use Cases",
            },
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
