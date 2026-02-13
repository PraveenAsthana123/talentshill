"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface Capability {
  name: string;
  description: string;
}

interface UseCase {
  industry: string;
  title: string;
  outcome: string;
}

interface MaturityLevel {
  basic: string;
  intermediate: string;
  advanced: string;
}

interface AICategory {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  gradient: string;
  gradientText: string;
  ringColor: string;
  description: string;
  value: string;
  capabilities: Capability[];
  techStack: string[];
  useCases: UseCase[];
  integrationPoints: string[];
  maturity: MaturityLevel;
}

const categories: AICategory[] = [
  {
    id: "transactional",
    title: "Transactional AI",
    shortTitle: "Transactional",
    icon: "⚡",
    gradient: "from-cyan-500 to-blue-600",
    gradientText: "from-cyan-400 to-blue-500",
    ringColor: "ring-cyan-500/40",
    description:
      "Automates high-volume, rule-intensive business transactions end-to-end, reducing cycle times from days to seconds while improving accuracy to 99.5%+. Eliminates manual touchpoints in financial operations, order management, and customer interactions.",
    value:
      "Enterprises deploying Transactional AI report 60-80% reduction in processing costs, 95% faster cycle times, and near-zero error rates across accounts payable, receivable, and order fulfillment workflows.",
    capabilities: [
      { name: "Intelligent Invoice Processing", description: "OCR + NLP extraction of line items, PO matching, three-way verification, and auto-posting to ERP with exception-based human review." },
      { name: "Order Management Automation", description: "End-to-end order orchestration from capture through fulfillment, including inventory checks, credit validation, and shipping coordination." },
      { name: "Payment Reconciliation", description: "ML-driven matching of bank statements to ledger entries across currencies, identifying discrepancies and auto-resolving 90%+ of exceptions." },
      { name: "Conversational AI Agents", description: "Context-aware chatbots and voice agents handling customer inquiries, order status, returns, and account changes with human-level accuracy." },
      { name: "RPA + AI Hybrid Automation", description: "Robotic Process Automation enhanced with ML for document understanding, decision-making, and adaptive workflows that handle unstructured inputs." },
      { name: "Smart Contract Execution", description: "Automated triggering and validation of contractual obligations, milestone payments, SLA monitoring, and penalty calculations." },
    ],
    techStack: [
      "UiPath + AI Center", "Microsoft Power Automate", "ABBYY FlexiCapture", "Google Document AI",
      "Amazon Textract", "SAP Intelligent RPA", "Celonis EMS", "Kofax TotalAgility",
      "LangChain Agents", "Apache Kafka", "Redis Streams", "PostgreSQL",
    ],
    useCases: [
      { industry: "Financial Services", title: "Automated Claims Adjudication", outcome: "Reduced claims processing from 14 days to 4 hours with 97.3% straight-through processing rate, saving $12M annually across 2M+ claims." },
      { industry: "Manufacturing", title: "Purchase Order Automation", outcome: "Automated 85% of PO creation and approval workflows, reducing procurement cycle time by 70% and eliminating $3.2M in duplicate payments." },
      { industry: "Healthcare", title: "Revenue Cycle Optimization", outcome: "Automated charge capture, coding validation, and claim submission achieving 99.1% clean claim rate and reducing A/R days from 45 to 18." },
      { industry: "Retail & E-Commerce", title: "Returns & Refund Processing", outcome: "AI-driven returns disposition and instant refund decisions reduced return processing from 7 days to 2 hours with 40% reduction in fraudulent returns." },
    ],
    integrationPoints: [
      "Feeds structured transaction data to Analytical AI for trend analysis and forecasting",
      "Triggers Governance & Compliance AI checks for regulatory validation on each transaction",
      "Sends process execution logs to Process AI for mining and optimization",
      "Provides customer interaction data to Business AI for lifetime value modeling",
    ],
    maturity: {
      basic: "Rule-based automation of single transaction types (e.g., invoice data entry) with human review on all exceptions. 30-40% automation rate.",
      intermediate: "ML-enhanced processing across multiple transaction types with intelligent exception handling. Cross-system orchestration and 60-75% straight-through processing.",
      advanced: "Fully autonomous transaction processing with predictive exception prevention, self-healing workflows, and continuous learning. 90%+ straight-through rates across all transaction types.",
    },
  },
  {
    id: "analytical",
    title: "Analytical AI",
    shortTitle: "Analytical",
    icon: "📊",
    gradient: "from-violet-500 to-purple-600",
    gradientText: "from-violet-400 to-purple-500",
    ringColor: "ring-violet-500/40",
    description:
      "Transforms raw enterprise data into actionable intelligence through pattern recognition, statistical modeling, and deep learning. Moves organizations from reactive reporting to predictive and prescriptive decision-making.",
    value:
      "Organizations leveraging Analytical AI achieve 15-25% improvement in forecast accuracy, 30-50% faster anomaly detection, and data-driven decisions that outperform intuition-based choices by 3-5x on measurable outcomes.",
    capabilities: [
      { name: "Predictive Analytics & Forecasting", description: "Time-series models, ensemble methods, and neural networks for demand forecasting, revenue prediction, churn probability, and resource planning with confidence intervals." },
      { name: "Anomaly Detection", description: "Unsupervised learning algorithms identifying outliers in real-time data streams — fraud patterns, equipment failures, security threats, and quality deviations." },
      { name: "Pattern Recognition & Clustering", description: "Discovery of hidden segments, behavioral patterns, and correlations in high-dimensional datasets using dimensionality reduction and clustering techniques." },
      { name: "Recommendation Engines", description: "Collaborative filtering, content-based, and hybrid recommendation systems for products, content, actions, and next-best-offer personalization." },
      { name: "Natural Language Analytics", description: "Sentiment analysis, topic modeling, entity extraction, and text classification across customer feedback, support tickets, and social media at scale." },
      { name: "Computer Vision Analytics", description: "Image and video analysis for quality inspection, inventory counting, safety compliance monitoring, and spatial analytics using CNNs and transformer architectures." },
    ],
    techStack: [
      "Python (scikit-learn, XGBoost)", "TensorFlow / PyTorch", "Apache Spark MLlib", "Databricks ML",
      "AWS SageMaker", "Azure ML Studio", "Google Vertex AI", "H2O.ai",
      "MLflow", "Feast (Feature Store)", "Great Expectations", "Grafana / Tableau",
    ],
    useCases: [
      { industry: "Telecommunications", title: "Customer Churn Prediction", outcome: "Ensemble ML model predicting churn 90 days ahead with 87% accuracy, enabling targeted retention campaigns that reduced churn by 23% and saved $45M in annual revenue." },
      { industry: "Energy & Utilities", title: "Predictive Maintenance for Grid Infrastructure", outcome: "Sensor data analytics predicting transformer and line failures 2 weeks in advance with 91% precision, reducing unplanned outages by 62% and maintenance costs by $28M." },
      { industry: "Pharmaceutical", title: "Drug Interaction Pattern Analysis", outcome: "NLP + graph analytics across 50M+ clinical records identifying previously unknown drug interactions, accelerating pharmacovigilance and reducing adverse event reporting time by 75%." },
      { industry: "Logistics", title: "Dynamic Route Optimization", outcome: "Real-time predictive models incorporating traffic, weather, and delivery constraints optimizing 50K+ daily routes, reducing fuel costs by 18% and improving on-time delivery to 96.4%." },
    ],
    integrationPoints: [
      "Receives clean, enriched data from Data Intelligence AI for model training and inference",
      "Provides predictive insights to Business AI for strategic decision support",
      "Feeds anomaly detection signals to Governance & Compliance AI for risk alerting",
      "Delivers demand forecasts and predictions to Transactional AI for automated decision-making",
    ],
    maturity: {
      basic: "Descriptive analytics dashboards with basic statistical models. Batch predictions on structured data. Manual feature engineering and model retraining.",
      intermediate: "Real-time predictive models in production with automated retraining pipelines. Feature stores, A/B testing frameworks, and multi-model serving infrastructure.",
      advanced: "Self-tuning model ecosystems with automated feature discovery, neural architecture search, continuous learning from production data, and prescriptive recommendation engines with causal inference.",
    },
  },
  {
    id: "governance",
    title: "Governance & Compliance AI",
    shortTitle: "Governance",
    icon: "🛡️",
    gradient: "from-emerald-500 to-green-600",
    gradientText: "from-emerald-400 to-green-500",
    ringColor: "ring-emerald-500/40",
    description:
      "Continuously monitors regulatory landscapes, automates compliance workflows, and provides real-time risk assessment across the enterprise. Transforms compliance from a periodic audit burden into an always-on, intelligent assurance function.",
    value:
      "Enterprises using Governance & Compliance AI reduce compliance costs by 40-55%, detect regulatory violations 10x faster, and maintain audit-ready postures that reduce external audit fees by 30% while eliminating material findings.",
    capabilities: [
      { name: "Regulatory Change Intelligence", description: "NLP-powered monitoring of 500+ regulatory sources, automatically mapping rule changes to affected business processes, controls, and policies with impact assessment." },
      { name: "Automated Audit Trail & Evidence Collection", description: "Continuous capture and indexing of control evidence, automated SOX/SOC testing, and AI-generated audit workpapers reducing audit preparation by 70%." },
      { name: "Risk Assessment & Scoring", description: "Dynamic risk models incorporating internal controls data, external threat intelligence, and behavioral patterns to produce real-time enterprise risk heat maps." },
      { name: "Policy Enforcement Automation", description: "AI agents that monitor transactions, communications, and data access for policy violations, automatically triggering remediation workflows and escalations." },
      { name: "Privacy & Data Protection (GDPR/CCPA)", description: "Automated data discovery, classification, consent management, DSAR fulfillment, and data retention enforcement across structured and unstructured repositories." },
      { name: "Financial Compliance (SOX/Basel/MiFID)", description: "Automated control testing, segregation of duties monitoring, transaction surveillance, and regulatory reporting with full traceability." },
    ],
    techStack: [
      "OneTrust", "ServiceNow GRC", "IBM OpenPages", "SAP GRC",
      "Relativity (eDiscovery)", "Datadog / Splunk SIEM", "Apache Atlas", "Collibra Governance",
      "Hugging Face Transformers", "spaCy NLP", "Neo4j (Graph DB)", "Elasticsearch",
    ],
    useCases: [
      { industry: "Banking & Finance", title: "Anti-Money Laundering (AML) Intelligence", outcome: "AI-enhanced transaction monitoring reduced false positive alerts by 72% while increasing suspicious activity detection by 45%, saving 15,000+ analyst hours annually." },
      { industry: "Healthcare & Life Sciences", title: "HIPAA Compliance Automation", outcome: "Continuous monitoring of PHI access, automated breach detection, and real-time compliance scoring across 200+ applications achieving 99.8% compliance posture." },
      { industry: "Technology", title: "GDPR & Global Privacy Compliance", outcome: "Automated data mapping across 150+ systems, AI-powered DSAR fulfillment in <24 hours (vs. 30 days), and consent management reducing privacy incidents by 89%." },
      { industry: "Energy", title: "Environmental Regulatory Compliance", outcome: "Real-time emissions monitoring, automated EPA/ESG reporting, and predictive compliance modeling preventing $15M+ in potential penalties across 40 facilities." },
    ],
    integrationPoints: [
      "Applies compliance rules to all transactions processed by Transactional AI",
      "Receives risk signals and anomaly alerts from Analytical AI for enhanced monitoring",
      "Leverages Data Intelligence AI for data lineage, classification, and privacy discovery",
      "Monitors Process AI workflows to ensure regulatory-compliant process execution",
    ],
    maturity: {
      basic: "Periodic manual compliance checks augmented with basic rule-based monitoring. Spreadsheet-based risk registers and annual audit cycles.",
      intermediate: "Continuous automated monitoring with AI-assisted anomaly detection. Integrated GRC platform with automated evidence collection and semi-automated regulatory mapping.",
      advanced: "Predictive compliance with AI anticipating regulatory changes, autonomous control testing, self-healing compliance gaps, and real-time enterprise risk quantification with Monte Carlo simulations.",
    },
  },
  {
    id: "business",
    title: "Business AI",
    shortTitle: "Business",
    icon: "💼",
    gradient: "from-amber-500 to-orange-600",
    gradientText: "from-amber-400 to-orange-500",
    ringColor: "ring-amber-500/40",
    description:
      "Empowers C-suite and business leaders with AI-driven strategic intelligence, transforming market data, competitive signals, and operational metrics into actionable strategies that drive growth and profitability.",
    value:
      "Organizations deploying Business AI achieve 20-35% improvement in strategic decision outcomes, 15-25% revenue uplift through optimization, and 2-3x faster time-to-insight for market and competitive intelligence.",
    capabilities: [
      { name: "Strategic Decision Support", description: "Scenario modeling, what-if analysis, and decision optimization engines that quantify trade-offs across strategic options with probabilistic outcome projections." },
      { name: "Market Intelligence & Signals", description: "AI-powered aggregation and analysis of market trends, competitor moves, patent filings, M&A activity, and regulatory shifts from 10,000+ sources." },
      { name: "Competitive Analysis Engine", description: "Real-time competitive benchmarking across pricing, product features, market positioning, and customer sentiment using web scraping, NLP, and structured data integration." },
      { name: "Revenue Optimization", description: "Dynamic pricing, promotion effectiveness, channel mix optimization, and cross-sell/upsell models maximizing customer revenue and margin across segments." },
      { name: "Customer Lifetime Value (CLV) Modeling", description: "Probabilistic CLV models incorporating acquisition cost, retention curves, expansion revenue, and behavioral cohort analysis for investment prioritization." },
      { name: "AI-Powered Business Planning", description: "Automated financial modeling, demand-supply planning, workforce planning, and capacity optimization with continuous plan-vs-actual tracking." },
    ],
    techStack: [
      "Palantir Foundry", "Salesforce Einstein", "Microsoft Copilot for M365", "Snowflake Cortex",
      "ThoughtSpot Sage", "Alteryx APA", "DataRobot", "Domo BI",
      "OpenAI GPT-4 API", "Anthropic Claude API", "LangChain / LlamaIndex", "dbt (transform layer)",
    ],
    useCases: [
      { industry: "Consumer Goods", title: "AI-Driven Category Management", outcome: "ML-optimized assortment, pricing, and shelf-space allocation across 5,000+ SKUs, driving 12% revenue lift and 8% margin improvement in pilot regions." },
      { industry: "Private Equity", title: "Deal Intelligence & Due Diligence", outcome: "AI platform analyzing 1,000+ potential targets against 200 criteria, reducing due diligence time by 60% and improving deal sourcing hit rate from 3% to 11%." },
      { industry: "Insurance", title: "Underwriting Decision Intelligence", outcome: "AI-assisted risk assessment and pricing models processing 10x more data points per application, improving loss ratios by 7 points while maintaining growth targets." },
      { industry: "Media & Entertainment", title: "Content Investment Optimization", outcome: "Predictive content valuation and audience modeling guiding $500M+ annual content investment, improving viewer acquisition cost by 35% and content ROI by 28%." },
    ],
    integrationPoints: [
      "Consumes predictive models and forecasts generated by Analytical AI",
      "Uses clean, governed data pipelines curated by Data Intelligence AI",
      "Incorporates compliance constraints from Governance & Compliance AI into strategy models",
      "Leverages Process AI insights to quantify operational improvement opportunities",
    ],
    maturity: {
      basic: "BI dashboards with historical KPIs and basic segmentation. Ad-hoc analysis by data analysts. Manual competitive research and market reports.",
      intermediate: "Predictive KPI dashboards, automated competitive monitoring, and CLV-based segmentation. Scenario planning tools with data-driven recommendations for business reviews.",
      advanced: "Autonomous strategy co-pilot generating and evaluating strategic options, real-time market simulation, causal AI for decision impact analysis, and continuous optimization of pricing, assortment, and resource allocation.",
    },
  },
  {
    id: "data-intelligence",
    title: "Data Intelligence AI",
    shortTitle: "Data Intelligence",
    icon: "🔬",
    gradient: "from-pink-500 to-rose-600",
    gradientText: "from-pink-400 to-rose-500",
    ringColor: "ring-pink-500/40",
    description:
      "The foundational AI layer that ensures enterprise data is discoverable, trustworthy, well-governed, and ready for AI consumption. Manages the full data lifecycle from ingestion through lineage, quality, and cataloging.",
    value:
      "Mature Data Intelligence practices reduce data-related project delays by 60%, improve model accuracy by 15-30% through better data quality, and cut data preparation time from 80% of analyst effort to under 20%.",
    capabilities: [
      { name: "Automated Data Quality Management", description: "ML-powered data profiling, anomaly detection, deduplication, and quality scoring across all enterprise datasets with automated remediation workflows." },
      { name: "Intelligent Metadata Management", description: "Auto-discovery and classification of metadata, business glossary maintenance, and semantic tagging using NLP to make data self-describing and searchable." },
      { name: "End-to-End Data Lineage", description: "Automated column-level lineage tracking from source systems through transformations to consumption, enabling impact analysis and regulatory traceability." },
      { name: "Master Data Management (MDM)", description: "AI-assisted golden record creation, entity resolution, and cross-system synchronization for customer, product, vendor, and location master data." },
      { name: "Knowledge Graph Construction", description: "Automated entity extraction and relationship mapping creating enterprise knowledge graphs that power semantic search, recommendations, and discovery." },
      { name: "Data Cataloging & Marketplace", description: "Self-service data marketplace with AI-powered search, automated documentation, usage analytics, and data product packaging for internal and external consumers." },
    ],
    techStack: [
      "Collibra Data Intelligence", "Alation Data Catalog", "Informatica IDMC", "Atlan",
      "Monte Carlo (Observability)", "Great Expectations", "Apache Atlas", "Amundsen",
      "dbt Core / Cloud", "Fivetran / Airbyte", "Snowflake / Databricks", "Neo4j / Amazon Neptune",
    ],
    useCases: [
      { industry: "Banking", title: "Enterprise Data Mesh Implementation", outcome: "Federated data product architecture with AI-powered cataloging and quality, reducing data access time from weeks to hours and enabling 40+ new data products in year one." },
      { industry: "Healthcare", title: "Clinical Data Harmonization", outcome: "NLP-driven entity resolution and standardization across 30+ EHR systems, creating unified patient records that improved care coordination scores by 34%." },
      { industry: "Retail", title: "Product Data Intelligence Platform", outcome: "AI-powered product data enrichment, attribute extraction, and cross-channel synchronization across 2M+ SKUs, reducing product launch time by 55% and improving search conversion by 22%." },
      { industry: "Government", title: "Cross-Agency Data Sharing Framework", outcome: "Knowledge graph-based data sharing with automated PII detection, access controls, and lineage, enabling inter-agency analytics while maintaining data sovereignty and privacy." },
    ],
    integrationPoints: [
      "Provides clean, trusted, cataloged data to all other five AI categories",
      "Feeds data quality metrics and lineage to Governance & Compliance AI for audit and regulatory needs",
      "Supplies enriched features and curated datasets to Analytical AI model training pipelines",
      "Ensures master data consistency for Transactional AI processing accuracy",
    ],
    maturity: {
      basic: "Manual data dictionaries, spreadsheet-based catalogs, and reactive data quality fixes. Siloed metadata with no automated lineage tracking.",
      intermediate: "Automated data profiling and cataloging with basic lineage. Centralized metadata repository, data stewardship programs, and quality SLAs on critical datasets.",
      advanced: "AI-native data fabric with auto-discovery, self-healing data quality, real-time lineage, knowledge graphs, and data products with embedded governance — enabling a true data marketplace.",
    },
  },
  {
    id: "process",
    title: "Process AI",
    shortTitle: "Process",
    icon: "⚙️",
    gradient: "from-sky-500 to-indigo-600",
    gradientText: "from-sky-400 to-indigo-500",
    ringColor: "ring-sky-500/40",
    description:
      "Discovers, maps, monitors, and continuously optimizes business processes by analyzing event logs, system data, and operational patterns. Creates a digital twin of operations that enables simulation-driven improvement.",
    value:
      "Process AI implementations deliver 25-40% process efficiency gains, 50-70% reduction in process deviations, and 3-6 month payback through elimination of bottlenecks, rework, and unnecessary process steps.",
    capabilities: [
      { name: "Process Mining & Discovery", description: "Automated reconstruction of actual process flows from system event logs, revealing how processes truly execute vs. how they were designed, with variant analysis." },
      { name: "Process Optimization & Simulation", description: "AI-driven identification of bottlenecks, redundancies, and improvement opportunities with discrete event simulation to test changes before implementation." },
      { name: "Intelligent Workflow Automation", description: "Adaptive workflow engines that learn optimal routing, escalation, and resource allocation patterns from historical execution data." },
      { name: "Bottleneck Detection & Resolution", description: "Real-time monitoring of process throughput, wait times, and resource utilization with automated root cause analysis and resolution recommendations." },
      { name: "Continuous Improvement Engine", description: "Closed-loop system that measures process KPIs, identifies degradation, generates improvement hypotheses, and tracks the impact of implemented changes." },
      { name: "Digital Twin of Processes", description: "Living simulation model of end-to-end business processes enabling what-if analysis, capacity planning, and predictive process performance forecasting." },
    ],
    techStack: [
      "Celonis Process Mining", "SAP Signavio", "Microsoft Process Mining", "ABBYY Timeline",
      "Camunda (BPM)", "Nintex", "Automation Anywhere", "Pegasystems",
      "Apache Airflow", "Temporal.io", "pm4py (Python)", "Simul8 / AnyLogic",
    ],
    useCases: [
      { industry: "Automotive", title: "Manufacturing Process Digital Twin", outcome: "Digital twin of assembly line processes identified 14 hidden bottlenecks, enabling targeted improvements that increased throughput by 22% without capital investment." },
      { industry: "Financial Services", title: "Loan Origination Process Optimization", outcome: "Process mining across 8 systems revealed 47 process variants (vs. 1 designed), enabling standardization that reduced loan processing time from 21 days to 5 days." },
      { industry: "Supply Chain", title: "Order-to-Cash Process Excellence", outcome: "End-to-end O2C process mining and automation across ERP, CRM, and logistics systems, reducing DSO by 12 days and improving perfect order rate from 82% to 95%." },
      { industry: "Public Sector", title: "Citizen Service Process Redesign", outcome: "Process mining of permit and licensing workflows identified 60% of steps as non-value-adding, enabling digital redesign that cut citizen wait times by 73%." },
    ],
    integrationPoints: [
      "Optimizes execution workflows that Transactional AI automates",
      "Uses Analytical AI predictions to anticipate process bottlenecks before they occur",
      "Ensures processes comply with rules monitored by Governance & Compliance AI",
      "Leverages Data Intelligence AI for clean event logs and consistent process data",
    ],
    maturity: {
      basic: "Manual process mapping with Visio/BPMN. Reactive issue resolution based on complaints. No systematic event log analysis.",
      intermediate: "Automated process mining with event log analysis, conformance checking, and KPI dashboards. Pilot automation of top bottleneck processes with measurable improvements.",
      advanced: "Continuous process intelligence with digital twins, predictive process analytics, autonomous workflow optimization, and organization-wide process excellence culture driven by real-time AI insights.",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  CONNECTIONS BETWEEN CATEGORIES (for SVG diagram)                   */
/* ------------------------------------------------------------------ */

const connections: [number, number][] = [
  [0, 1], [0, 2], [0, 5],
  [1, 3], [1, 4], [1, 2],
  [2, 5], [2, 4],
  [3, 4], [3, 5],
  [4, 5],
  [0, 3],
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

/* Summary stats */
const totalCapabilities = categories.reduce((s, c) => s + c.capabilities.length, 0);
const totalUseCases = categories.reduce((s, c) => s + c.useCases.length, 0);
const totalTech = new Set(categories.flatMap((c) => c.techStack)).size;

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export default function AITaxonomy() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedUseCase, setExpandedUseCase] = useState<string | null>(null);

  const active = categories.find((c) => c.id === activeId) ?? null;

  const handleSelect = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
    setExpandedUseCase(null);
  }, []);

  /* Hex positions for the 6 categories in the center diagram (arranged in a hexagon) */
  const hexPositions = [
    { x: 200, y: 60 },
    { x: 340, y: 130 },
    { x: 340, y: 270 },
    { x: 200, y: 340 },
    { x: 60, y: 270 },
    { x: 60, y: 130 },
  ];

  const gradientColors = [
    ["#06b6d4", "#2563eb"],
    ["#8b5cf6", "#9333ea"],
    ["#10b981", "#16a34a"],
    ["#f59e0b", "#ea580c"],
    ["#ec4899", "#e11d48"],
    ["#0ea5e9", "#4f46e5"],
  ];

  return (
    <section id="ai-taxonomy" className="relative py-24 overflow-hidden bg-primary-dark">
      {/* ---------- Animated circuit-board background ---------- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg className="w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 60h40m10 0h10m10 0h50M60 0v40m0 10v10m0 10v50" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
              <circle cx="60" cy="60" r="3" fill="#22d3ee" />
              <circle cx="40" cy="60" r="1.5" fill="#22d3ee" />
              <circle cx="60" cy="40" r="1.5" fill="#22d3ee" />
              <circle cx="80" cy="60" r="1.5" fill="#22d3ee" />
              <circle cx="60" cy="80" r="1.5" fill="#22d3ee" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
        {/* Floating particles */}
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-accent-light/30"
            style={{
              left: `${5 + (i * 5.3) % 90}%`,
              top: `${8 + (i * 7.1) % 84}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========== HEADER ========== */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <motion.p variants={fadeUp} className="text-accent font-semibold tracking-widest uppercase text-sm mb-3">
            Enterprise AI Framework
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-5">
            AI Taxonomy
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/60 max-w-3xl mx-auto text-lg leading-relaxed">
            A comprehensive classification of enterprise AI capabilities spanning six interconnected domains.
            Each category addresses distinct business challenges while forming a cohesive, integrated AI ecosystem
            that amplifies value across the organization.
          </motion.p>
        </motion.div>

        {/* ========== CENTER INTERCONNECTION DIAGRAM (SVG) ========== */}
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <svg viewBox="0 0 400 400" className="w-full max-w-md" xmlns="http://www.w3.org/2000/svg">
            <defs>
              {gradientColors.map(([c1, c2], i) => (
                <linearGradient key={i} id={`cg${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={c1} />
                  <stop offset="100%" stopColor={c2} />
                </linearGradient>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Animated connecting lines */}
            {connections.map(([a, b], idx) => {
              const pa = hexPositions[a];
              const pb = hexPositions[b];
              const isHighlighted =
                active && (categories[a].id === active.id || categories[b].id === active.id);
              return (
                <motion.line
                  key={idx}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke={isHighlighted ? "#22d3ee" : "#334155"}
                  strokeWidth={isHighlighted ? 2 : 0.8}
                  strokeDasharray="6 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: idx * 0.07 }}
                >
                  {isHighlighted && (
                    <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
                  )}
                </motion.line>
              );
            })}

            {/* Animated data particles along connections when a category is active */}
            {active &&
              connections
                .filter(([a, b]) => categories[a].id === active.id || categories[b].id === active.id)
                .map(([a, b], idx) => {
                  const pa = hexPositions[a];
                  const pb = hexPositions[b];
                  return (
                    <motion.circle
                      key={`particle-${idx}`}
                      r="3"
                      fill="#22d3ee"
                      filter="url(#glow)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        begin={`${idx * 0.3}s`}
                        path={`M${pa.x},${pa.y} L${pb.x},${pb.y}`}
                      />
                    </motion.circle>
                  );
                })}

            {/* Category nodes */}
            {hexPositions.map((pos, i) => {
              const cat = categories[i];
              const isActive = active?.id === cat.id;
              return (
                <g
                  key={cat.id}
                  className="cursor-pointer"
                  onClick={() => handleSelect(cat.id)}
                >
                  {/* Hex-like circle */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isActive ? 34 : 28}
                    fill={`url(#cg${i})`}
                    opacity={isActive ? 1 : 0.75}
                    stroke={isActive ? "#fff" : "transparent"}
                    strokeWidth={isActive ? 2 : 0}
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  {/* Pulsing ring when active */}
                  {isActive && (
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r={34}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={1.5}
                      initial={{ r: 34, opacity: 0.8 }}
                      animate={{ r: 48, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-lg pointer-events-none select-none"
                    fill="white"
                  >
                    {cat.icon}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + (i < 2 ? -42 : i < 4 ? 48 : -42)}
                    textAnchor="middle"
                    fill={isActive ? "#22d3ee" : "#94a3b8"}
                    className="text-[10px] font-medium pointer-events-none select-none"
                  >
                    {cat.shortTitle}
                  </text>
                </g>
              );
            })}

            {/* Center label */}
            <text x="200" y="195" textAnchor="middle" fill="#64748b" className="text-[9px] font-medium">
              AI Taxonomy
            </text>
            <text x="200" y="210" textAnchor="middle" fill="#475569" className="text-[8px]">
              Click a node to explore
            </text>
          </svg>
        </motion.div>

        {/* ========== CATEGORY SELECTOR CARDS (Grid) ========== */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          {categories.map((cat) => {
            const isActive = active?.id === cat.id;
            return (
              <motion.button
                key={cat.id}
                variants={scaleIn}
                onClick={() => handleSelect(cat.id)}
                className={`group relative glass rounded-2xl p-4 text-center transition-all duration-300 border ${
                  isActive
                    ? `border-accent/60 shadow-lg shadow-accent/10`
                    : "border-white/5 hover:border-white/20"
                }`}
                whileHover={{
                  rotateX: -4,
                  rotateY: 4,
                  scale: 1.04,
                  transition: { duration: 0.25 },
                }}
                style={{ transformStyle: "preserve-3d", perspective: "800px" }}
              >
                {/* Active glow backdrop */}
                {isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-10`}
                    layoutId="categoryGlow"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  />
                )}
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <span
                  className={`text-sm font-semibold block ${
                    isActive ? "text-white" : "text-white/70 group-hover:text-white"
                  }`}
                >
                  {cat.shortTitle}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ========== SELECTED CATEGORY DETAIL ========== */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="mb-20"
            >
              {/* --- Header --- */}
              <div className={`glass-dark rounded-3xl p-8 md:p-10 border border-white/5 mb-8`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{active.icon}</span>
                  <h3
                    className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${active.gradientText} bg-clip-text text-transparent`}
                  >
                    {active.title}
                  </h3>
                </div>
                <p className="text-white/70 leading-relaxed mb-3">{active.description}</p>
                <p className="text-white/50 text-sm leading-relaxed italic">{active.value}</p>
              </div>

              {/* --- Key Capabilities --- */}
              <div className="mb-10">
                <h4 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Key Capabilities
                </h4>
                <motion.div
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {active.capabilities.map((cap, i) => (
                    <motion.div
                      key={cap.name}
                      variants={fadeUp}
                      className="glass rounded-2xl p-5 border border-white/5 hover:border-white/15 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${active.gradient} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <h5 className="text-white font-semibold text-sm mb-1">{cap.name}</h5>
                          <p className="text-white/50 text-xs leading-relaxed">{cap.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* --- Technology Stack --- */}
              <div className="mb-10">
                <h4 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Technology Stack
                </h4>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {active.techStack.map((tech) => (
                    <motion.span
                      key={tech}
                      variants={scaleIn}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition-colors`}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* --- Industry Applications --- */}
              <div className="mb-10">
                <h4 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Industry Applications
                </h4>
                <motion.div
                  className="grid md:grid-cols-2 gap-4"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {active.useCases.map((uc) => {
                    const ucKey = `${active.id}-${uc.title}`;
                    const isExpanded = expandedUseCase === ucKey;
                    return (
                      <motion.div
                        key={ucKey}
                        variants={fadeUp}
                        className="glass rounded-2xl border border-white/5 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedUseCase(isExpanded ? null : ucKey)}
                          className="w-full text-left p-5 flex items-start justify-between gap-3"
                        >
                          <div>
                            <span
                              className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${active.gradient} text-white mb-2`}
                            >
                              {uc.industry}
                            </span>
                            <h5 className="text-white font-semibold text-sm">{uc.title}</h5>
                          </div>
                          <motion.svg
                            className="w-5 h-5 text-white/40 flex-shrink-0 mt-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5">
                                <p className="text-white/50 text-xs leading-relaxed">{uc.outcome}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              {/* --- Integration Points --- */}
              <div className="mb-10">
                <h4 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Integration Points
                </h4>
                <motion.div
                  className="grid md:grid-cols-2 gap-3"
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                >
                  {active.integrationPoints.map((pt, i) => (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="flex items-start gap-3 glass rounded-xl p-4 border border-white/5"
                    >
                      <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="text-white/60 text-sm leading-relaxed">{pt}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* --- Maturity Indicators --- */}
              <div>
                <h4 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Maturity Indicators
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {(["basic", "intermediate", "advanced"] as const).map((level, i) => (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="glass-dark rounded-2xl p-5 border border-white/5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            level === "basic"
                              ? "bg-slate-500/20 text-slate-300"
                              : level === "intermediate"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {level}
                        </span>
                      </div>
                      {/* Visual maturity bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/5 mb-4 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            level === "basic"
                              ? "bg-slate-400"
                              : level === "intermediate"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          initial={{ width: 0 }}
                          animate={{
                            width: level === "basic" ? "33%" : level === "intermediate" ? "66%" : "100%",
                          }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                        />
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{active.maturity[level]}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SUMMARY STATS ========== */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          {[
            { label: "AI Categories", value: categories.length, suffix: "" },
            { label: "Key Capabilities", value: totalCapabilities, suffix: "+" },
            { label: "Industry Use Cases", value: totalUseCases, suffix: "+" },
            { label: "Technologies", value: totalTech, suffix: "+" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass rounded-2xl p-6 text-center border border-white/5"
            >
              <p className="text-3xl md:text-4xl font-bold text-accent mb-1">
                {stat.value}
                {stat.suffix}
              </p>
              <p className="text-white/50 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
