"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const industries = [
  {
    id: "healthcare",
    label: "Healthcare",
    icon: "🏥",
    color: "from-teal-500 to-cyan-600",
    tagColor: "bg-teal-100 text-teal-700",
    intro:
      "AI is transforming healthcare delivery, drug discovery, and patient outcomes across the entire value chain.",
    services: [
      "GenAI & RAG",
      "Computer Vision",
      "IoT & Wearables",
      "Robotics",
      "Cloud (AWS/Azure/GCP)",
      "Voice AI",
      "Automation",
      "Data Analytics",
    ],
    departments: [
      {
        name: "Clinical Operations",
        useCases: [
          "AI-powered clinical decision support systems",
          "Automated medical image analysis (X-ray, MRI, CT scans)",
          "Predictive patient deterioration and early warning systems",
          "NLP-based clinical documentation and coding automation",
          "Surgical planning with AI simulation and 3D modeling",
        ],
      },
      {
        name: "Patient Care",
        useCases: [
          "Remote patient monitoring with wearable IoT devices",
          "AI chatbots for patient triage and appointment scheduling",
          "Personalized treatment recommendation engines",
          "Readmission risk prediction and prevention",
          "Mental health monitoring and intervention via AI",
        ],
      },
      {
        name: "Drug Discovery & R&D",
        useCases: [
          "ML-accelerated compound screening and drug design",
          "Clinical trial optimization and patient matching",
          "Genomics and precision medicine analytics",
          "Adverse drug reaction prediction models",
          "Real-world evidence analytics from EHR data",
        ],
      },
      {
        name: "Administration & Revenue",
        useCases: [
          "Claims processing automation and fraud detection",
          "Revenue cycle optimization with predictive analytics",
          "AI-driven staffing and resource allocation",
          "Supply chain demand forecasting for medical supplies",
          "Regulatory compliance monitoring and reporting",
        ],
      },
    ],
  },
  {
    id: "banking",
    label: "Banking",
    icon: "🏦",
    color: "from-blue-500 to-indigo-600",
    tagColor: "bg-blue-100 text-blue-700",
    intro:
      "AI is reshaping banking with smarter risk management, personalized services, and operational efficiency across every department.",
    services: [
      "GenAI & RAG",
      "Automation & RPA",
      "Computer Vision",
      "Voice AI",
      "Cloud (AWS/Azure/GCP)",
      "Data Analytics",
      "Quantum Security",
      "AI Governance",
    ],
    departments: [
      {
        name: "Retail Banking",
        useCases: [
          "AI-powered personalized product recommendations",
          "Intelligent virtual assistants for customer service",
          "Automated loan origination and credit scoring",
          "Customer churn prediction and retention campaigns",
          "Hyper-personalized marketing with GenAI content",
        ],
      },
      {
        name: "Risk & Compliance",
        useCases: [
          "Real-time fraud detection and prevention (transactions, cards)",
          "Anti-money laundering (AML) pattern detection",
          "Know Your Customer (KYC) automation with document AI",
          "Credit risk modeling and portfolio stress testing",
          "Regulatory reporting automation (Basel, IFRS)",
        ],
      },
      {
        name: "Investment & Trading",
        useCases: [
          "Algorithmic trading strategy optimization",
          "Sentiment analysis from news and social media",
          "Portfolio optimization with ML models",
          "Market risk forecasting and scenario analysis",
          "AI-driven robo-advisory platforms",
        ],
      },
      {
        name: "Operations & IT",
        useCases: [
          "Intelligent document processing (checks, forms, contracts)",
          "RPA for back-office process automation",
          "Cybersecurity threat detection with AI",
          "IT infrastructure anomaly detection and auto-remediation",
          "GenAI-powered knowledge management for employees",
        ],
      },
      {
        name: "Wealth Management",
        useCases: [
          "Client 360 analytics for relationship managers",
          "Next-best-action recommendations for advisors",
          "Estate planning and tax optimization models",
          "Alternative investment analytics and due diligence",
          "Client communication personalization with GenAI",
        ],
      },
    ],
  },
  {
    id: "realestate",
    label: "Real Estate",
    icon: "🏠",
    color: "from-emerald-500 to-green-600",
    tagColor: "bg-emerald-100 text-emerald-700",
    intro:
      "AI is revolutionizing real estate with intelligent valuation, smart buildings, and data-driven investment decisions.",
    services: [
      "IoT & Smart Building",
      "Computer Vision",
      "GenAI & RAG",
      "Data Analytics",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Energy AI",
      "Digital Marketing AI",
    ],
    departments: [
      {
        name: "Property Valuation & Investment",
        useCases: [
          "Automated property valuation models (AVM) using ML",
          "Investment opportunity scoring and risk assessment",
          "Market trend prediction and price forecasting",
          "Comparable property analysis with computer vision",
          "Portfolio performance analytics and optimization",
        ],
      },
      {
        name: "Property Management",
        useCases: [
          "IoT-enabled smart building management systems",
          "Predictive maintenance for building equipment",
          "Energy optimization with AI-driven HVAC control",
          "Tenant satisfaction analysis and churn prediction",
          "Automated lease management and renewal prediction",
        ],
      },
      {
        name: "Sales & Marketing",
        useCases: [
          "AI-powered lead scoring and buyer matching",
          "Virtual property tours with GenAI descriptions",
          "Dynamic pricing optimization for listings",
          "Personalized property recommendation engines",
          "GenAI-generated marketing content and listings",
        ],
      },
      {
        name: "Construction & Development",
        useCases: [
          "Construction progress monitoring with drone + AI",
          "Site selection optimization with geospatial analytics",
          "Building design optimization using generative AI",
          "Supply chain and cost prediction for projects",
          "Safety compliance monitoring with computer vision",
        ],
      },
    ],
  },
  {
    id: "oilandgas",
    label: "Oil & Gas",
    icon: "🛢️",
    color: "from-amber-500 to-orange-600",
    tagColor: "bg-amber-100 text-amber-700",
    intro:
      "AI optimizes exploration, production, safety, and sustainability across the oil and gas value chain.",
    services: [
      "IoT & Edge AI",
      "Computer Vision",
      "Robotics",
      "Data Analytics",
      "GenAI & RAG",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Energy AI",
    ],
    departments: [
      {
        name: "Exploration & Production",
        useCases: [
          "Seismic data interpretation with deep learning",
          "Reservoir simulation and production forecasting",
          "Drilling optimization with real-time sensor analytics",
          "Well performance prediction and optimization",
          "Automated geological feature detection from imagery",
        ],
      },
      {
        name: "Operations & Maintenance",
        useCases: [
          "Predictive maintenance for pumps, turbines, and pipelines",
          "IoT-based real-time equipment health monitoring",
          "Corrosion detection with computer vision and drones",
          "Supply chain optimization for parts and materials",
          "Robotic inspection of hazardous environments",
        ],
      },
      {
        name: "Safety & Environment",
        useCases: [
          "AI-powered safety incident prediction and prevention",
          "Emissions monitoring and carbon footprint optimization",
          "Leak detection using IoT sensors and ML models",
          "Worker safety compliance monitoring with computer vision",
          "Environmental impact assessment automation",
        ],
      },
      {
        name: "Trading & Distribution",
        useCases: [
          "Commodity price prediction with ML models",
          "Demand forecasting for downstream distribution",
          "Pipeline flow optimization and scheduling",
          "Energy trading strategy optimization",
          "Customer demand analytics for fuel retailers",
        ],
      },
    ],
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: "🛡️",
    color: "from-violet-500 to-purple-600",
    tagColor: "bg-violet-100 text-violet-700",
    intro:
      "AI enables smarter underwriting, faster claims, and personalized insurance products across all lines of business.",
    services: [
      "GenAI & RAG",
      "Computer Vision",
      "Automation & RPA",
      "Voice AI",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "IoT & Wearables",
      "AI Governance",
    ],
    departments: [
      {
        name: "Underwriting",
        useCases: [
          "AI-powered risk assessment and pricing models",
          "Automated underwriting decision support",
          "Medical and property data extraction with NLP",
          "IoT-based usage-based insurance (UBI) for auto",
          "Wearable data integration for life/health underwriting",
        ],
      },
      {
        name: "Claims Management",
        useCases: [
          "Automated claims intake and triage with AI",
          "Fraud detection and investigation prioritization",
          "Damage assessment from photos using computer vision",
          "Claims outcome prediction and reserve estimation",
          "GenAI-powered claims correspondence and summaries",
        ],
      },
      {
        name: "Customer Experience",
        useCases: [
          "AI chatbots for policy inquiries and self-service",
          "Personalized policy recommendation engines",
          "Customer lifetime value prediction and cross-sell",
          "Churn prediction and proactive retention",
          "Omnichannel sentiment analysis and feedback",
        ],
      },
      {
        name: "Actuarial & Analytics",
        useCases: [
          "Advanced loss modeling with machine learning",
          "Climate risk and catastrophe modeling",
          "Telematics data analytics for auto insurance",
          "Regulatory capital optimization models",
          "Portfolio risk aggregation and visualization",
        ],
      },
    ],
  },
  {
    id: "hr",
    label: "HR",
    icon: "👥",
    color: "from-pink-500 to-rose-600",
    tagColor: "bg-pink-100 text-pink-700",
    intro:
      "AI transforms human resources with smarter hiring, personalized employee experiences, and data-driven workforce planning.",
    services: [
      "GenAI & RAG",
      "Automation & RPA",
      "Voice AI",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "AI Recruitment",
      "Digital Marketing AI",
      "AI Governance",
    ],
    departments: [
      {
        name: "Talent Acquisition",
        useCases: [
          "AI-powered resume screening and candidate ranking",
          "GenAI-generated job descriptions and outreach",
          "Interview scheduling and chatbot pre-screening",
          "Candidate-job fit prediction models",
          "Diversity hiring analytics and bias detection",
        ],
      },
      {
        name: "Employee Experience",
        useCases: [
          "AI-driven employee engagement pulse surveys",
          "Personalized learning and development recommendations",
          "Internal career path suggestion engine",
          "Employee sentiment analysis from feedback channels",
          "GenAI-powered HR knowledge base and self-service",
        ],
      },
      {
        name: "Workforce Planning",
        useCases: [
          "Attrition prediction and retention risk scoring",
          "Skills gap analysis and workforce forecasting",
          "Succession planning with AI-driven talent mapping",
          "Demand-based staffing and scheduling optimization",
          "Compensation benchmarking with market analytics",
        ],
      },
      {
        name: "HR Operations",
        useCases: [
          "Automated payroll processing and anomaly detection",
          "Benefits optimization recommendation engine",
          "Compliance monitoring and policy enforcement",
          "Document automation (offer letters, contracts) with GenAI",
          "HR chatbot for employee queries and ticket routing",
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: "📋",
    color: "from-cyan-500 to-blue-600",
    tagColor: "bg-cyan-100 text-cyan-700",
    intro:
      "AI supercharges CRM systems with intelligent automation, predictive insights, and personalized customer engagement at scale.",
    services: [
      "GenAI & RAG",
      "Automation & RPA",
      "Voice AI",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "Digital Marketing AI",
      "Computer Vision",
      "AI Governance",
    ],
    departments: [
      {
        name: "Sales Automation",
        useCases: [
          "AI-powered lead scoring and prioritization",
          "Sales pipeline forecasting with ML models",
          "Automated follow-up email generation with GenAI",
          "Opportunity win/loss prediction and coaching",
          "Intelligent territory and quota planning",
        ],
      },
      {
        name: "Customer Service",
        useCases: [
          "AI chatbots for tier-1 support resolution",
          "Ticket classification and auto-routing",
          "Sentiment analysis on customer interactions",
          "Knowledge base auto-generation from resolved tickets",
          "Escalation prediction and proactive outreach",
        ],
      },
      {
        name: "Marketing Automation",
        useCases: [
          "AI-driven customer segmentation and micro-targeting",
          "Predictive campaign performance optimization",
          "GenAI content creation for emails and social",
          "Customer journey orchestration with ML",
          "Attribution modeling and marketing mix optimization",
        ],
      },
      {
        name: "Customer Intelligence",
        useCases: [
          "Customer 360 profile enrichment with AI",
          "Churn prediction and retention trigger automation",
          "Customer lifetime value forecasting",
          "Next-best-action recommendation engine",
          "Voice of Customer analytics from all channels",
        ],
      },
      {
        name: "Data & Integration",
        useCases: [
          "AI-powered data deduplication and cleansing",
          "Automated CRM data entry from emails and calls",
          "Cross-system data sync and conflict resolution",
          "NLP-based contact and activity extraction",
          "Predictive data quality scoring and alerts",
        ],
      },
    ],
  },
  {
    id: "industrial-robotics",
    label: "Industrial Robotics",
    icon: "🏭",
    color: "from-orange-500 to-red-600",
    tagColor: "bg-orange-100 text-orange-700",
    intro:
      "AI-powered industrial robotics is transforming manufacturing, logistics, and heavy industry with autonomous systems, predictive maintenance, and intelligent quality control.",
    services: [
      "Computer Vision",
      "IoT & Edge AI",
      "Automation & RPA",
      "Digital Twin",
      "Cloud (AWS/Azure/GCP)",
      "Data Analytics",
      "GenAI & RAG",
      "AI Governance",
    ],
    departments: [
      {
        name: "Manufacturing & Assembly",
        useCases: [
          "AI-powered robotic arm pick-and-place optimization",
          "Computer vision defect detection on production lines",
          "Automated welding with real-time seam tracking AI",
          "Collaborative robot (cobot) task planning with ML",
          "Assembly sequence optimization using reinforcement learning",
          "AI-driven quality inspection at line speed",
        ],
      },
      {
        name: "Predictive Maintenance",
        useCases: [
          "Vibration analysis & bearing failure prediction for robots",
          "Motor health monitoring with IoT + AI anomaly detection",
          "Remaining useful life (RUL) prediction for robotic joints",
          "AI-based lubrication & wear pattern analysis",
          "Automated maintenance scheduling with ML optimization",
          "Digital twin simulation for failure scenario planning",
        ],
      },
      {
        name: "Warehouse & Logistics",
        useCases: [
          "Autonomous picking robots with AI vision guidance",
          "Robotic palletizing & depalletizing optimization",
          "AI-driven sortation systems for package routing",
          "Automated guided vehicles (AGV) fleet coordination",
          "Bin packing optimization with ML algorithms",
          "Warehouse layout optimization using simulation AI",
        ],
      },
      {
        name: "Safety & Compliance",
        useCases: [
          "AI-powered human-robot collision avoidance systems",
          "Safety zone monitoring with computer vision",
          "Automated safety compliance auditing & reporting",
          "Worker fatigue detection near robotic cells",
          "AI risk assessment for robotic work cell design",
          "Emergency stop prediction & proactive intervention",
        ],
      },
      {
        name: "Process Optimization",
        useCases: [
          "Cycle time optimization with reinforcement learning",
          "Multi-robot task allocation & scheduling AI",
          "AI-driven paint & coating thickness optimization",
          "Robotic grinding & polishing with force-torque AI control",
          "Energy consumption optimization for robot fleets",
          "GenAI-powered maintenance reports & knowledge base",
        ],
      },
    ],
  },
  {
    id: "mobile-robotics",
    label: "Mobile Robotics",
    icon: "🤖",
    color: "from-blue-500 to-cyan-600",
    tagColor: "bg-blue-100 text-blue-700",
    intro:
      "AI-driven mobile robotics enables autonomous navigation, intelligent delivery, and adaptive exploration across indoor, outdoor, and hazardous environments.",
    services: [
      "Computer Vision",
      "IoT & Edge AI",
      "SLAM & Navigation",
      "Cloud (AWS/Azure/GCP)",
      "Embedded AI",
      "Data Analytics",
      "GenAI & RAG",
      "Automation",
    ],
    departments: [
      {
        name: "Autonomous Navigation",
        useCases: [
          "SLAM-based indoor mapping & real-time localization",
          "AI path planning with dynamic obstacle avoidance",
          "Multi-floor navigation with elevator integration",
          "Outdoor GPS-denied navigation using visual odometry",
          "Semantic map understanding for context-aware routing",
          "Multi-sensor fusion (LiDAR, camera, IMU, ultrasonic)",
        ],
      },
      {
        name: "Last-Mile Delivery",
        useCases: [
          "Autonomous sidewalk delivery robots with AI navigation",
          "Drone delivery route optimization with ML",
          "Multi-stop delivery sequencing & scheduling AI",
          "Pedestrian & traffic interaction prediction models",
          "Weather-adaptive delivery planning with AI",
          "Customer notification & real-time tracking systems",
        ],
      },
      {
        name: "Healthcare & Service Robots",
        useCases: [
          "Hospital logistics robots for medication & supply delivery",
          "Disinfection robots with UV-C & AI coverage planning",
          "Patient companion robots with voice & gesture AI",
          "Autonomous wheelchair navigation assistance",
          "Restaurant & hotel service robots with NLP interaction",
          "Elder care mobile assistants with fall detection AI",
        ],
      },
      {
        name: "Inspection & Surveillance",
        useCases: [
          "Autonomous security patrol robots with anomaly AI",
          "Pipeline & infrastructure inspection with mobile robots",
          "Agricultural crop monitoring with ground robots",
          "Mine exploration & hazardous environment mapping",
          "Solar panel & wind turbine inspection robots",
          "Construction site progress monitoring with mobile AI",
        ],
      },
      {
        name: "Fleet Management & Intelligence",
        useCases: [
          "Multi-robot fleet orchestration & task assignment AI",
          "Centralized fleet monitoring & health dashboard",
          "Battery management & autonomous charging scheduling",
          "Robot-to-robot communication & swarm coordination",
          "Cloud-based OTA firmware & model updates",
          "Performance analytics & continuous learning pipeline",
        ],
      },
    ],
  },
  {
    id: "agritech",
    label: "AgriTech",
    icon: "🌾",
    color: "from-lime-500 to-green-600",
    tagColor: "bg-lime-100 text-lime-700",
    intro:
      "AI is revolutionizing agriculture with precision farming, smart livestock management, and data-driven supply chain optimization for a sustainable future.",
    services: [
      "IoT & Edge AI",
      "Computer Vision",
      "Robotics",
      "Drone AI",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "GenAI & RAG",
      "Automation",
    ],
    departments: [
      {
        name: "Precision Farming",
        useCases: [
          "AI-driven soil health analysis and nutrient recommendation",
          "Satellite and drone imagery for crop health monitoring",
          "Automated irrigation scheduling using IoT soil sensors and ML",
          "Yield prediction models using weather, soil, and crop data",
          "Weed detection and targeted herbicide application with computer vision",
        ],
      },
      {
        name: "Livestock Management",
        useCases: [
          "Computer vision-based animal health monitoring and disease detection",
          "IoT wearables for real-time livestock activity and location tracking",
          "AI-optimized feed formulation and nutrition planning",
          "Automated breeding cycle prediction and fertility analytics",
          "Predictive models for milk yield and livestock productivity",
        ],
      },
      {
        name: "Supply Chain & Post-Harvest",
        useCases: [
          "AI-powered crop grading and quality sorting with computer vision",
          "Cold chain monitoring and spoilage prediction using IoT sensors",
          "Demand forecasting for perishable commodity distribution",
          "Route optimization for farm-to-market logistics",
          "GenAI-assisted traceability and compliance documentation",
        ],
      },
      {
        name: "AgriFinance & Insurance",
        useCases: [
          "Satellite imagery-based crop insurance claim verification",
          "Credit scoring models for smallholder farmers using alternative data",
          "Weather-indexed insurance product design with ML",
          "AI-driven market price prediction for commodity trading",
          "Fraud detection in agricultural subsidy and loan disbursement",
        ],
      },
    ],
  },
  {
    id: "retail",
    label: "Retail & E-Commerce",
    icon: "🛒",
    color: "from-rose-500 to-pink-600",
    tagColor: "bg-rose-100 text-rose-700",
    intro:
      "AI empowers retail and e-commerce with hyper-personalized shopping experiences, intelligent inventory management, and data-driven marketing strategies.",
    services: [
      "GenAI & RAG",
      "Computer Vision",
      "Data Analytics",
      "Automation",
      "Voice AI",
      "Cloud (AWS/Azure/GCP)",
      "Digital Marketing AI",
      "IoT",
    ],
    departments: [
      {
        name: "Personalization & CX",
        useCases: [
          "AI-powered product recommendation engines based on browsing behavior",
          "GenAI-driven personalized email and push notification campaigns",
          "Visual search and shop-the-look with computer vision",
          "AI chatbots for real-time customer support and order tracking",
          "Customer sentiment analysis across reviews and social channels",
        ],
      },
      {
        name: "Inventory & Supply Chain",
        useCases: [
          "Demand forecasting with ML for optimal stock replenishment",
          "Automated reorder point calculation and supplier management",
          "AI-powered warehouse slotting and layout optimization",
          "Real-time inventory tracking across omnichannel touchpoints",
          "Shrinkage and loss prevention analytics with IoT and AI",
        ],
      },
      {
        name: "Store Operations",
        useCases: [
          "Computer vision-based shelf monitoring and planogram compliance",
          "Automated checkout and cashier-less store technology",
          "Foot traffic analysis and store layout optimization with AI",
          "Smart energy management for retail locations using IoT",
          "AI-driven workforce scheduling based on predicted store traffic",
        ],
      },
      {
        name: "Marketing & Pricing",
        useCases: [
          "Dynamic pricing optimization based on demand and competitor data",
          "AI-driven customer segmentation and micro-targeting",
          "GenAI-generated product descriptions and marketing copy",
          "Attribution modeling and marketing spend optimization",
          "Promotion effectiveness prediction and A/B test automation",
        ],
      },
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    icon: "⚙️",
    color: "from-gray-500 to-zinc-700",
    tagColor: "bg-gray-100 text-white/70",
    intro:
      "AI accelerates manufacturing with smart production lines, predictive quality control, and end-to-end supply chain visibility for Industry 4.0.",
    services: [
      "IoT & Edge AI",
      "Computer Vision",
      "Robotics",
      "Digital Twin",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Data Analytics",
      "AI Governance",
    ],
    departments: [
      {
        name: "Production Optimization",
        useCases: [
          "AI-driven production scheduling and throughput maximization",
          "Digital twin simulation for process parameter optimization",
          "Energy consumption optimization across production lines",
          "Predictive maintenance for CNC machines and conveyor systems",
          "Real-time OEE monitoring and bottleneck identification with ML",
        ],
      },
      {
        name: "Quality Control",
        useCases: [
          "Automated visual defect detection with deep learning",
          "Statistical process control enhanced with AI anomaly detection",
          "Root cause analysis for quality deviations using ML",
          "In-line dimensional measurement with computer vision",
          "Predictive quality scoring to reduce scrap and rework rates",
        ],
      },
      {
        name: "Supply Chain",
        useCases: [
          "AI-powered demand sensing and raw material procurement planning",
          "Supplier risk assessment and alternative sourcing recommendations",
          "Logistics route optimization and delivery time prediction",
          "Inventory optimization across multi-tier supply networks",
          "GenAI-assisted contract analysis and supplier negotiation support",
        ],
      },
      {
        name: "Worker Safety",
        useCases: [
          "Computer vision PPE compliance detection on the factory floor",
          "Near-miss incident prediction using IoT sensor and event data",
          "Ergonomic risk assessment with AI-powered motion analysis",
          "Hazardous zone monitoring and automated safety alerts",
          "AI-driven safety training personalization based on incident patterns",
        ],
      },
    ],
  },
  {
    id: "telecom",
    label: "Telecom",
    icon: "📱",
    color: "from-blue-600 to-indigo-700",
    tagColor: "bg-blue-100 text-blue-700",
    intro:
      "AI transforms telecom with intelligent network management, superior customer experience, and new revenue streams powered by 5G and edge computing.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Automation",
      "Voice AI",
      "Cloud (AWS/Azure/GCP)",
      "IoT",
      "Computer Vision",
      "AI Governance",
    ],
    departments: [
      {
        name: "Network Operations",
        useCases: [
          "AI-powered network anomaly detection and self-healing automation",
          "Predictive maintenance for cell towers and network equipment",
          "Traffic forecasting and dynamic bandwidth allocation with ML",
          "Automated root cause analysis for network outages",
          "AI-optimized network planning and capacity expansion",
        ],
      },
      {
        name: "Customer Experience",
        useCases: [
          "GenAI-powered virtual assistants for account and billing queries",
          "Customer churn prediction and proactive retention offers",
          "Personalized plan recommendation based on usage analytics",
          "Sentiment analysis on call center interactions and social media",
          "AI-driven next-best-action for customer service representatives",
        ],
      },
      {
        name: "Revenue & Fraud",
        useCases: [
          "Real-time fraud detection for SIM swap and subscription scams",
          "Revenue assurance analytics to identify billing leakage",
          "AI-powered credit risk scoring for postpaid customers",
          "Dynamic pricing and bundle optimization with ML models",
          "Upsell and cross-sell recommendation engines for retail channels",
        ],
      },
      {
        name: "5G & Edge",
        useCases: [
          "AI-driven network slicing management for enterprise 5G services",
          "Edge computing workload orchestration and resource optimization",
          "Autonomous drone and IoT fleet management over 5G networks",
          "Real-time video analytics at the edge for smart city applications",
          "Latency prediction and SLA compliance monitoring with AI",
        ],
      },
    ],
  },
  {
    id: "supply-chain",
    label: "Supply Chain & Logistics",
    icon: "🚚",
    color: "from-amber-500 to-yellow-600",
    tagColor: "bg-amber-100 text-amber-700",
    intro:
      "AI optimizes supply chain and logistics with end-to-end visibility, intelligent warehousing, and predictive decision-making across global networks.",
    services: [
      "IoT & Edge AI",
      "Automation",
      "Data Analytics",
      "Computer Vision",
      "Robotics",
      "Cloud (AWS/Azure/GCP)",
      "GenAI & RAG",
      "AI Governance",
    ],
    departments: [
      {
        name: "Demand Forecasting",
        useCases: [
          "ML-driven demand prediction using sales, weather, and event data",
          "New product demand estimation with transfer learning models",
          "Promotional impact forecasting and cannibalization analysis",
          "Multi-echelon inventory optimization with AI planning",
          "Real-time demand sensing from POS and e-commerce signals",
        ],
      },
      {
        name: "Warehouse Operations",
        useCases: [
          "AI-optimized pick path routing and order batching",
          "Robotic process automation for packing and labeling",
          "Computer vision-based inventory counting and cycle audits",
          "Warehouse slotting optimization based on demand velocity",
          "Labor planning and shift scheduling with ML demand models",
        ],
      },
      {
        name: "Transportation & Fleet",
        useCases: [
          "AI-powered route optimization for multi-stop deliveries",
          "Predictive vehicle maintenance using telematics and IoT data",
          "Real-time ETA prediction and dynamic rerouting",
          "Fuel consumption optimization with driving behavior analytics",
          "Carrier selection and freight rate negotiation with AI models",
        ],
      },
      {
        name: "Procurement & Sourcing",
        useCases: [
          "AI-driven supplier risk monitoring and early warning systems",
          "Spend analytics and cost reduction opportunity identification",
          "Automated purchase order generation and approval workflows",
          "Contract intelligence and clause extraction with NLP",
          "Supplier performance scoring and benchmarking with ML",
        ],
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    icon: "🎓",
    color: "from-indigo-500 to-violet-600",
    tagColor: "bg-indigo-100 text-indigo-700",
    intro:
      "AI is transforming education with personalized learning paths, intelligent tutoring systems, and data-driven institutional decision-making.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Voice AI",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Computer Vision",
      "AI Governance",
      "Digital Marketing AI",
    ],
    departments: [
      {
        name: "Personalized Learning",
        useCases: [
          "Adaptive learning platforms that adjust content to student pace",
          "AI-powered intelligent tutoring systems with real-time feedback",
          "GenAI-generated practice questions and study material",
          "Learning path recommendation engines based on skill gaps",
          "Multimodal content generation (text, audio, video) for diverse learners",
        ],
      },
      {
        name: "Administration & Operations",
        useCases: [
          "AI-driven enrollment forecasting and capacity planning",
          "Automated student support chatbots for admissions and financial aid",
          "Smart timetable scheduling optimization across departments",
          "Predictive models for student dropout risk and early intervention",
          "GenAI-assisted grant writing and compliance reporting",
        ],
      },
      {
        name: "Assessment & Analytics",
        useCases: [
          "AI-powered automated essay and assignment grading",
          "Plagiarism and AI-generated content detection systems",
          "Learning analytics dashboards for instructor insights",
          "Competency-based assessment design with adaptive testing",
          "Student engagement prediction from LMS interaction data",
        ],
      },
      {
        name: "Research & Innovation",
        useCases: [
          "AI-assisted literature review and research gap identification",
          "Automated research data analysis and visualization tools",
          "Collaborative research matching across institutions with ML",
          "GenAI-powered research paper summarization and translation",
          "AI ethics curriculum development and bias auditing tools",
        ],
      },
    ],
  },
  {
    id: "government",
    label: "Government & Public Sector",
    icon: "🏛️",
    color: "from-slate-500 to-gray-700",
    tagColor: "bg-slate-100 text-slate-700",
    intro:
      "AI enhances government services with smarter citizen engagement, data-driven policy making, and efficient public safety and infrastructure management.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Computer Vision",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Voice AI",
      "Cybersecurity AI",
      "AI Governance",
    ],
    departments: [
      {
        name: "Citizen Services",
        useCases: [
          "AI-powered virtual assistants for government service portals",
          "Automated document processing for permits, licenses, and benefits",
          "Multilingual NLP chatbots for citizen inquiry resolution",
          "Personalized service recommendations based on citizen profiles",
          "Wait time prediction and appointment scheduling optimization",
        ],
      },
      {
        name: "Public Safety",
        useCases: [
          "Computer vision-based surveillance and threat detection systems",
          "Predictive policing models for crime hotspot identification",
          "AI-driven emergency response dispatch optimization",
          "Natural disaster prediction and early warning systems",
          "Cybersecurity threat detection for critical government infrastructure",
        ],
      },
      {
        name: "Policy & Governance",
        useCases: [
          "AI-assisted policy impact simulation and scenario analysis",
          "Automated regulatory compliance monitoring across agencies",
          "Public sentiment analysis on proposed legislation and policies",
          "Budget optimization and resource allocation with ML models",
          "GenAI-powered legislative document drafting and summarization",
        ],
      },
      {
        name: "Infrastructure",
        useCases: [
          "Predictive maintenance for roads, bridges, and public utilities",
          "AI-optimized traffic management and smart signal control",
          "Water distribution network leak detection with IoT and ML",
          "Smart grid energy demand forecasting and load balancing",
          "Urban planning optimization using geospatial AI analytics",
        ],
      },
    ],
  },
  {
    id: "project-management",
    label: "Project Management",
    icon: "📊",
    color: "from-cyan-500 to-blue-600",
    tagColor: "bg-cyan-100 text-cyan-700",
    intro:
      "AI transforms project management with intelligent planning, predictive risk analysis, and automated delivery intelligence for complex programs.",
    services: [
      "GenAI & RAG",
      "Automation",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "AI Governance",
    ],
    departments: [
      {
        name: "Planning & Estimation",
        useCases: [
          "AI-driven project risk prediction & early warning systems",
          "Automated resource allocation & capacity planning with ML",
          "Predictive project timeline & milestone forecasting",
          "AI-based budget forecasting & cost overrun detection",
          "Intelligent dependency mapping & critical path optimization",
        ],
      },
      {
        name: "Execution & Reporting",
        useCases: [
          "GenAI-powered status report generation & stakeholder updates",
          "Natural language project querying with LLM agents",
          "Automated retrospective analysis & lessons learned extraction",
          "Real-time project health dashboards with AI anomaly alerts",
          "AI-driven scope change impact analysis & recommendations",
        ],
      },
    ],
  },
  {
    id: "product-management",
    label: "Product Management",
    icon: "🎯",
    color: "from-amber-500 to-orange-600",
    tagColor: "bg-amber-100 text-amber-700",
    intro:
      "AI empowers product managers with data-driven roadmapping, intelligent feature prioritization, and deep user insight analytics.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Digital Marketing AI",
    ],
    departments: [
      {
        name: "Strategy & Roadmap",
        useCases: [
          "AI-powered feature prioritization & impact scoring",
          "Predictive user behavior modeling for roadmap decisions",
          "Automated competitive intelligence & market gap analysis",
          "AI-based product-market fit scoring & validation",
          "GenAI product requirement document (PRD) generation",
        ],
      },
      {
        name: "Analytics & Growth",
        useCases: [
          "ML-driven A/B test design & experiment analysis",
          "Customer feedback clustering & theme extraction with NLP",
          "Predictive churn signals for product retention strategies",
          "User engagement pattern analysis with ML models",
          "GenAI-powered release notes & changelog generation",
        ],
      },
    ],
  },
  {
    id: "agile-management",
    label: "Agile Management",
    icon: "🔄",
    color: "from-lime-500 to-emerald-600",
    tagColor: "bg-lime-100 text-lime-700",
    intro:
      "AI enhances agile practices with sprint intelligence, velocity prediction, and automated ceremony facilitation for high-performing teams.",
    services: [
      "GenAI & RAG",
      "Automation",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
    ],
    departments: [
      {
        name: "Sprint Planning & Execution",
        useCases: [
          "AI sprint planning with story point estimation models",
          "Velocity prediction & sprint capacity optimization",
          "Intelligent backlog grooming & prioritization with ML",
          "Burndown prediction & scope creep early warning",
          "GenAI-powered user story & acceptance criteria generation",
        ],
      },
      {
        name: "Team Intelligence",
        useCases: [
          "Automated standup summarization & blocker detection",
          "Team sentiment analysis from retrospectives & communications",
          "AI-driven agile maturity assessment & coaching recommendations",
          "Cross-team dependency visualization & conflict detection",
          "Sprint retrospective insight extraction with NLP",
        ],
      },
    ],
  },
  {
    id: "delivery-management",
    label: "Delivery Management",
    icon: "🚀",
    color: "from-rose-500 to-pink-600",
    tagColor: "bg-rose-100 text-rose-700",
    intro:
      "AI drives end-to-end delivery excellence with intelligent release management, quality gates, and deployment optimization.",
    services: [
      "GenAI & RAG",
      "Automation",
      "Data Analytics",
      "Cloud (AWS/Azure/GCP)",
      "AI Governance",
    ],
    departments: [
      {
        name: "Release & Deployment",
        useCases: [
          "AI-powered release readiness scoring & risk assessment",
          "Predictive deployment failure analysis & rollback triggers",
          "Intelligent change management & impact analysis",
          "Delivery pipeline bottleneck detection & throughput optimization",
          "AI-based quality gate automation & test coverage optimization",
        ],
      },
      {
        name: "Monitoring & Reporting",
        useCases: [
          "Automated SLA monitoring & escalation with ML anomaly detection",
          "GenAI-driven delivery dashboard & executive reporting",
          "Cross-team dependency resolution with AI scheduling",
          "Post-deployment performance analysis & anomaly detection",
          "Continuous delivery metrics tracking & trend analysis",
        ],
      },
    ],
  },
  {
    id: "market-research",
    label: "Market Research",
    icon: "🔍",
    color: "from-indigo-500 to-violet-600",
    tagColor: "bg-indigo-100 text-indigo-700",
    intro:
      "AI powers market intelligence with automated surveys, trend analysis, competitor tracking, and consumer insight generation at scale.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Automation",
      "Digital Marketing AI",
      "Cloud (AWS/Azure/GCP)",
    ],
    departments: [
      {
        name: "Research & Analysis",
        useCases: [
          "AI-driven survey design, distribution & response analysis",
          "Automated competitor monitoring & strategic intelligence",
          "NLP-powered social listening & consumer sentiment tracking",
          "Predictive market trend forecasting with ML models",
          "Customer persona generation from behavioral data clustering",
        ],
      },
      {
        name: "Strategy & Insights",
        useCases: [
          "GenAI-generated market research reports & executive briefs",
          "Price elasticity modeling & dynamic pricing optimization",
          "AI-based brand perception analysis & positioning insights",
          "Market sizing & opportunity scoring with ML models",
          "Competitive landscape mapping & whitespace identification",
        ],
      },
    ],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: "🔒",
    color: "from-red-600 to-rose-700",
    tagColor: "bg-red-100 text-red-700",
    intro:
      "AI strengthens cybersecurity with proactive threat detection, automated incident response, and intelligent security operations at scale.",
    services: [
      "GenAI & RAG",
      "Data Analytics",
      "Automation",
      "Cloud (AWS/Azure/GCP)",
      "Quantum Security",
      "AI Governance",
      "Computer Vision",
      "Voice AI",
    ],
    departments: [
      {
        name: "Threat Detection & Response",
        useCases: [
          "AI-powered real-time network intrusion detection and alerting",
          "Behavioral analytics for advanced persistent threat (APT) identification",
          "Automated malware classification and zero-day exploit detection",
          "ML-driven phishing email and URL detection systems",
          "Automated incident triage and response playbook orchestration",
        ],
      },
      {
        name: "Identity & Access",
        useCases: [
          "AI-based adaptive authentication and continuous identity verification",
          "User and entity behavior analytics (UEBA) for insider threat detection",
          "Automated access review and least-privilege policy enforcement",
          "Deepfake and voice spoofing detection for identity assurance",
          "Privileged access anomaly detection and session monitoring",
        ],
      },
      {
        name: "Application Security",
        useCases: [
          "AI-assisted source code vulnerability scanning and remediation",
          "Automated penetration testing with ML-driven attack simulation",
          "API security monitoring and anomalous usage pattern detection",
          "Container and cloud workload security posture management with AI",
          "Software supply chain risk scoring and dependency analysis",
        ],
      },
      {
        name: "Security Operations",
        useCases: [
          "GenAI-powered threat intelligence summarization and enrichment",
          "SOAR platform automation with AI-driven decision support",
          "Security log correlation and false positive reduction with ML",
          "Attack surface management and vulnerability prioritization",
          "Compliance audit automation and continuous security posture reporting",
        ],
      },
    ],
  },
];

export default function IndustryUseCases() {
  const [activeTab, setActiveTab] = useState(0);
  const industry = industries[activeTab];

  return (
    <section id="industry-usecases" className="py-24 bg-primary dot-pattern relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-3">
            Industry Solutions
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            AI Use Cases by Industry
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Explore how AI transforms operations across industries — from
            healthcare to oil &amp; gas, banking to HR.
          </p>
        </motion.div>

        {/* Industry tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/10 rounded-2xl p-2 shadow-sm gap-1 flex-wrap justify-center">
            {industries.map((ind, i) => (
              <button
                key={ind.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  i === activeTab
                    ? "bg-primary text-white shadow-md"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-lg">{ind.icon}</span>
                <span className="hidden sm:inline">{ind.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Industry content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={industry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Industry header */}
            <div className={`bg-gradient-to-r ${industry.color} rounded-2xl p-8 mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">{industry.icon}</span>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">
                      AI in {industry.label}
                    </h3>
                    <p className="text-white/80 mt-2 max-w-2xl">
                      {industry.intro}
                    </p>
                  </div>
                </div>
                {/* Services applicable to this industry */}
                {"services" in industry && industry.services && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-2">
                      Services We Offer
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {industry.services.map((svc: string) => (
                        <span
                          key={svc}
                          className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Department use cases grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {industry.departments.map((dept, i) => (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 overflow-hidden card-hover"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${industry.tagColor}`}>
                        {dept.name}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {dept.useCases.map((uc, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 + j * 0.03, duration: 0.2 }}
                          className="flex items-start gap-2.5"
                        >
                          <svg
                            className="w-4 h-4 text-accent flex-shrink-0 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4"
                            />
                          </svg>
                          <span className="text-sm text-white/60">{uc}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
