const knowledgeBase: Record<string, string> = {
  // AI Solutions
  robotics: `**Robotics Solutions at Talents Hill Inc**

We offer end-to-end robotics consulting and implementation:

• **Robotic Process Automation (RPA)** — Automate repetitive business processes to reduce costs and errors.
• **Industrial Robotics Analytics** — Monitor, optimize, and predict maintenance needs for robotic systems.
• **Collaborative Robots (Cobots)** — Design and deploy human-robot collaboration workflows.
• **Computer Vision for Robotics** — Enable robots to perceive and interact with their environment using AI-powered vision systems.

Our robotics solutions span manufacturing, logistics, healthcare, and agriculture. We help businesses identify automation opportunities and implement scalable robotic systems.`,

  iot: `**IoT (Internet of Things) Services**

Talents Hill Inc delivers comprehensive IoT solutions:

• **IoT Platform Development** — Build scalable platforms to connect, manage, and analyze IoT device data.
• **Predictive Maintenance** — Use sensor data and ML models to predict equipment failures before they occur.
• **Smart Infrastructure** — Deploy connected solutions for buildings, cities, and industrial facilities.
• **Edge Computing & Analytics** — Process data at the edge for real-time decision-making with reduced latency.
• **IoT Security** — End-to-end security frameworks to protect connected devices and data pipelines.

We work across industries including manufacturing, agriculture, healthcare, and smart cities to deliver IoT solutions that generate actionable insights.`,

  genai: `**Generative AI (GenAI) Capabilities**

Talents Hill Inc is at the forefront of Generative AI:

• **Custom LLM Solutions** — Fine-tune and deploy large language models tailored to your business domain.
• **AI-Powered Content Generation** — Automate content creation for marketing, documentation, and reports.
• **Conversational AI** — Build intelligent chatbots and virtual assistants for customer engagement.
• **Code Generation & Automation** — Accelerate software development with AI-assisted coding tools.
• **Document Intelligence** — Extract, summarize, and analyze information from unstructured documents.
• **AI Strategy Consulting** — Roadmap development for responsible and effective GenAI adoption.

We help organizations harness the power of GenAI while ensuring ethical use, data privacy, and measurable ROI.`,

  // Domains
  banking: `**Banking & Financial Services**

Our banking solutions leverage AI and analytics to transform financial services:

• **Fraud Detection & Prevention** — Real-time ML models to identify and prevent fraudulent transactions.
• **Credit Risk Analytics** — Advanced scoring models for better lending decisions.
• **Customer 360** — Unified customer profiles for personalized banking experiences.
• **Regulatory Compliance** — Automated compliance monitoring and reporting (KYC, AML, Basel).
• **Algorithmic Trading Analytics** — Data-driven strategies for trading optimization.
• **Process Automation** — RPA and AI to streamline loan processing, account opening, and back-office operations.

We serve retail banks, investment firms, insurance companies, and fintech startups.`,

  healthcare: `**Healthcare AI Solutions**

Talents Hill Inc delivers AI-powered healthcare solutions:

• **Clinical Analytics** — Analyze patient data to improve outcomes and reduce readmissions.
• **Drug Discovery Support** — ML models to accelerate pharmaceutical research and compound screening.
• **Medical Imaging AI** — Computer vision for radiology, pathology, and diagnostic imaging.
• **Patient Journey Analytics** — Map and optimize the complete patient experience.
• **Healthcare IoT** — Connected medical devices and remote patient monitoring systems.
• **Health Data Integration** — Unify EHR, claims, and genomic data for comprehensive insights.

We work with hospitals, pharma companies, health insurers, and digital health startups to improve care delivery and operational efficiency.`,

  "real estate": `**Real Estate AI & Analytics**

Transform property markets with data-driven intelligence:

• **Property Valuation Models** — AI-powered automated valuation for accurate pricing.
• **Market Trend Analysis** — Predictive analytics for real estate market movements and investment opportunities.
• **Tenant Analytics** — Customer segmentation and churn prediction for property managers.
• **Smart Building Solutions** — IoT-enabled building management for energy efficiency and tenant comfort.
• **Document Automation** — GenAI for lease analysis, contract generation, and compliance documentation.
• **Location Intelligence** — Geospatial analytics for site selection and development planning.

We serve real estate developers, property management firms, REITs, and PropTech companies.`,

  agritech: `**AgriTech Solutions**

Precision agriculture powered by AI and IoT:

• **Precision Farming** — Satellite imagery and sensor data analytics for crop monitoring and yield optimization.
• **IoT-Enabled Smart Farming** — Connected sensors for soil moisture, weather, and crop health monitoring.
• **Supply Chain Optimization** — End-to-end visibility and analytics for agricultural supply chains.
• **Crop Disease Detection** — Computer vision models to identify plant diseases and pest infestations early.
• **Market Price Prediction** — ML models to forecast commodity prices and optimize selling strategies.
• **Farm Management Platforms** — Integrated dashboards for farm operations, inventory, and financials.

We help agribusinesses, cooperatives, and AgriTech startups leverage technology for sustainable and profitable farming.`,

  // Analytics services
  "marketing analytics": `**Marketing Analytics Services**

Drive marketing effectiveness with data:

• **Campaign Analytics** — Measure and optimize marketing campaigns across channels.
• **Attribution Modeling** — Understand which touchpoints drive conversions.
• **Customer Segmentation** — Data-driven audience segmentation for targeted marketing.
• **Marketing Mix Modeling** — Optimize budget allocation across marketing channels.
• **Social Media Analytics** — Track sentiment, engagement, and ROI across social platforms.
• **AI-Powered Personalization** — Deliver personalized content and offers at scale using GenAI.`,

  "customer analytics": `**Customer Analytics Services**

Maximize customer lifetime value:

• **Customer 360 Profiles** — Unified view of customer behavior across all touchpoints.
• **Churn Prediction** — ML models to identify at-risk customers and retention strategies.
• **Lifetime Value Modeling** — Predict and maximize customer value over time.
• **Behavioral Analytics** — Deep analysis of customer behavior patterns and preferences.
• **Voice of Customer** — NLP-powered analysis of feedback, reviews, and support interactions.
• **Next-Best-Action** — AI recommendations for the optimal customer engagement.`,

  "data integration": `**Data Integration Services**

Build a unified data foundation:

• **ETL/ELT Pipelines** — Design and implement scalable data pipelines.
• **Data Lake & Warehouse** — Cloud-native data platforms on AWS, Azure, or GCP.
• **Real-Time Streaming** — Process and analyze data streams in real time.
• **API Integration** — Connect disparate systems through modern API architectures.
• **Data Quality & Governance** — Ensure data accuracy, consistency, and compliance.
• **Master Data Management** — Single source of truth across the organization.`,
};

export function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Check for greetings
  if (/^(hi|hello|hey|good morning|good evening)/i.test(lower)) {
    return `Hello! Welcome to the Talents Hill Inc AI Portal. I'm here to help you explore our AI solutions and services.

You can ask me about:
• **AI Solutions** — Robotics, IoT, GenAI
• **Industry Domains** — Banking, Healthcare, Real Estate, AgriTech
• **Analytics Services** — Marketing, Customer, and Data Integration

What would you like to know more about?`;
  }

  // Check knowledge base
  for (const [key, response] of Object.entries(knowledgeBase)) {
    if (lower.includes(key)) {
      return response;
    }
  }

  // Check for related keywords
  if (lower.includes("robot") || lower.includes("rpa") || lower.includes("automation")) {
    return knowledgeBase.robotics;
  }
  if (lower.includes("internet of things") || lower.includes("sensor") || lower.includes("connected")) {
    return knowledgeBase.iot;
  }
  if (lower.includes("generative") || lower.includes("llm") || lower.includes("chatbot") || lower.includes("gpt")) {
    return knowledgeBase.genai;
  }
  if (lower.includes("bank") || lower.includes("financial") || lower.includes("fintech") || lower.includes("fraud")) {
    return knowledgeBase.banking;
  }
  if (lower.includes("health") || lower.includes("medical") || lower.includes("hospital") || lower.includes("pharma") || lower.includes("clinical")) {
    return knowledgeBase.healthcare;
  }
  if (lower.includes("real estate") || lower.includes("property") || lower.includes("proptech")) {
    return knowledgeBase["real estate"];
  }
  if (lower.includes("agri") || lower.includes("farm") || lower.includes("crop") || lower.includes("agriculture")) {
    return knowledgeBase.agritech;
  }
  if (lower.includes("marketing") || lower.includes("campaign") || lower.includes("attribution")) {
    return knowledgeBase["marketing analytics"];
  }
  if (lower.includes("customer") || lower.includes("churn") || lower.includes("retention")) {
    return knowledgeBase["customer analytics"];
  }
  if (lower.includes("data") || lower.includes("integration") || lower.includes("pipeline") || lower.includes("etl")) {
    return knowledgeBase["data integration"];
  }

  // Check for service/capabilities questions
  if (lower.includes("service") || lower.includes("offer") || lower.includes("what do you")) {
    return `**Talents Hill Inc Services Overview**

We offer comprehensive AI-powered solutions across three pillars:

**AI Solutions:**
• 🤖 Robotics — RPA, industrial robotics, cobots, computer vision
• 📡 IoT — Platform development, predictive maintenance, edge computing
• 🧠 GenAI — Custom LLMs, conversational AI, document intelligence

**Industry Domains:**
• 🏦 Banking — Fraud detection, credit risk, compliance
• 🏥 Healthcare — Clinical analytics, medical imaging, drug discovery
• 🏠 Real Estate — Property valuation, smart buildings, market analytics
• 🌾 AgriTech — Precision farming, crop monitoring, supply chain

**Analytics:**
• 📊 Marketing Analytics
• 👥 Customer Analytics
• 🔗 Data Integration

Ask about any specific area to learn more!`;
  }

  // Default response
  return `Thank you for your question. I can help you with information about our services:

• **AI Solutions** — Robotics, IoT, GenAI
• **Industry Domains** — Banking, Healthcare, Real Estate, AgriTech
• **Analytics** — Marketing, Customer, and Data Integration

Could you rephrase your question or select a topic from the sidebar? I'll provide detailed information about our capabilities in that area.`;
}
