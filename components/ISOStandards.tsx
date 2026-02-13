"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Domain = "ai" | "software" | "data" | "iot" | "robotics" | "medical" | "security" | "quality" | "agile";

const domains: { key: Domain; label: string; icon: string; color: string }[] = [
  { key: "ai", label: "AI & Machine Learning", icon: "🧠", color: "from-violet-500 to-purple-600" },
  { key: "software", label: "Software Engineering", icon: "💻", color: "from-blue-500 to-indigo-600" },
  { key: "data", label: "Data Management", icon: "📊", color: "from-cyan-500 to-teal-600" },
  { key: "iot", label: "IoT & Embedded", icon: "📡", color: "from-emerald-500 to-green-600" },
  { key: "robotics", label: "Robotics & Automation", icon: "🤖", color: "from-red-500 to-rose-600" },
  { key: "medical", label: "Medical Devices & BCI", icon: "🏥", color: "from-pink-500 to-fuchsia-600" },
  { key: "security", label: "Cybersecurity & Privacy", icon: "🔒", color: "from-amber-500 to-orange-600" },
  { key: "quality", label: "Quality & Governance", icon: "🛡️", color: "from-indigo-500 to-blue-600" },
  { key: "agile", label: "Project & Agile", icon: "📋", color: "from-teal-500 to-cyan-600" },
];

interface Standard {
  code: string;
  title: string;
  scope: string;
  applicableTo: string;
  documents: string[];
  process: string[];
}

const standards: Record<Domain, Standard[]> = {
  ai: [
    {
      code: "ISO/IEC 42001:2023",
      title: "AI Management System (AIMS)",
      scope: "Requirements for establishing, implementing, maintaining and improving an AI management system within organizations.",
      applicableTo: "AI/ML projects, GenAI deployment, LLM fine-tuning, RAG pipelines",
      documents: [
        "AI Policy & Objectives Statement",
        "AI Risk Assessment Register",
        "AI Impact Assessment Report",
        "Roles & Responsibilities Matrix (AI Governance Board)",
        "AI System Inventory & Classification",
        "Statement of Applicability (SoA)",
        "Management Review Minutes",
        "Internal Audit Report (AIMS)",
        "Continual Improvement Log",
      ],
      process: ["Context analysis", "Leadership commitment", "AI risk assessment", "Controls implementation", "Performance monitoring", "Internal audit", "Management review", "Continual improvement"],
    },
    {
      code: "ISO/IEC 23894:2023",
      title: "AI Risk Management",
      scope: "Guidance on managing risk specifically related to AI systems throughout the lifecycle.",
      applicableTo: "AI risk assessment, model governance, bias mitigation",
      documents: [
        "AI Risk Management Framework Document",
        "Risk Identification & Analysis Worksheets",
        "Risk Treatment Plan (per AI system)",
        "Residual Risk Acceptance Record",
        "Risk Monitoring Dashboard Specification",
        "Stakeholder Communication Plan (Risk)",
      ],
      process: ["Risk context establishment", "Risk identification", "Risk analysis", "Risk evaluation", "Risk treatment", "Risk monitoring & review"],
    },
    {
      code: "ISO/IEC 38507:2022",
      title: "Governance of IT — AI",
      scope: "Guidance for governing bodies on the governance implications of AI within organizations.",
      applicableTo: "Board-level AI governance, C-suite AI strategy",
      documents: [
        "AI Governance Charter",
        "Board AI Oversight Framework",
        "AI Ethics Policy",
        "AI Investment & Prioritization Criteria",
        "Accountability & Decision Matrix",
        "AI Governance KPI Dashboard",
      ],
      process: ["Evaluate AI opportunities", "Direct AI strategy", "Monitor AI outcomes", "Ensure accountability", "Stakeholder engagement"],
    },
    {
      code: "ISO/IEC 5338:2023",
      title: "AI System Lifecycle Processes",
      scope: "Framework of processes for AI system development, deployment, operation, and retirement.",
      applicableTo: "AI project lifecycle, MLOps, model deployment",
      documents: [
        "AI System Lifecycle Plan",
        "Data Management Plan",
        "Model Development Report",
        "Model Validation & Verification Report",
        "Deployment & Operations Runbook",
        "Model Retirement / Decommission Plan",
        "Change Management Log",
      ],
      process: ["Concept & feasibility", "Data preparation", "Model development", "Model verification", "System validation", "Deployment", "Operation & monitoring", "Retirement"],
    },
    {
      code: "ISO/IEC 25059:2023",
      title: "AI System Quality Model",
      scope: "Quality model for AI systems extending ISO 25010 with AI-specific quality characteristics.",
      applicableTo: "AI quality assurance, model evaluation, acceptance testing",
      documents: [
        "AI Quality Requirements Specification",
        "Quality Characteristics Matrix (per AI system)",
        "Functional Correctness Test Report",
        "Robustness & Resilience Test Report",
        "Fairness & Bias Evaluation Report",
        "Transparency & Explainability Assessment",
        "AI Quality Metrics Dashboard",
      ],
      process: ["Quality requirements definition", "Quality model selection", "Quality measurement", "Quality evaluation", "Quality improvement"],
    },
    {
      code: "ISO/IEC TR 24028:2020",
      title: "AI Trustworthiness Overview",
      scope: "Overview of trustworthiness in AI — transparency, explainability, controllability, robustness, bias.",
      applicableTo: "Responsible AI, ethical AI frameworks, XAI",
      documents: [
        "Trustworthiness Assessment Report",
        "Explainability Documentation (XAI)",
        "Bias & Fairness Audit Report",
        "Human Oversight & Controllability Plan",
        "Robustness Testing Report",
        "Transparency Disclosure Document",
      ],
      process: ["Trustworthiness requirements", "Threat/vulnerability analysis", "Mitigation measures", "Transparency reporting", "Ongoing assessment"],
    },
    {
      code: "ISO/IEC TR 24027:2021",
      title: "AI Bias in AI Systems",
      scope: "Bias identification, measurement, and mitigation in AI and automated decision-making.",
      applicableTo: "Fairness testing, bias audits, model evaluation",
      documents: [
        "Bias Risk Assessment Report",
        "Data Bias Analysis Report",
        "Algorithmic Fairness Metrics Report",
        "Bias Mitigation Strategy Document",
        "Post-Deployment Bias Monitoring Plan",
      ],
      process: ["Bias source identification", "Bias measurement", "Bias mitigation", "Bias monitoring", "Reporting & disclosure"],
    },
  ],
  software: [
    {
      code: "ISO/IEC 12207:2017",
      title: "Software Lifecycle Processes",
      scope: "Framework for software lifecycle processes — acquisition, supply, development, operation, maintenance.",
      applicableTo: "All software projects, custom development, SaaS",
      documents: [
        "Software Development Plan (SDP)",
        "Software Requirements Specification (SRS)",
        "Software Architecture Document (SAD)",
        "Detailed Design Document (LLD)",
        "Software Test Plan & Test Cases",
        "Software Verification & Validation Report",
        "Configuration Management Plan",
        "Software Maintenance Plan",
        "Release Notes & Change Log",
      ],
      process: ["Acquisition", "Supply", "Development", "Operation", "Maintenance", "Configuration management", "Quality assurance", "Verification & validation"],
    },
    {
      code: "ISO/IEC 15288:2023",
      title: "Systems Lifecycle Processes",
      scope: "Lifecycle management of systems including hardware, software, people, and processes.",
      applicableTo: "System engineering, embedded systems, complex projects",
      documents: [
        "System Requirements Document (SyRS)",
        "System Architecture Description",
        "Interface Control Document (ICD)",
        "Integration Test Plan",
        "System Validation Report",
        "Transition & Handover Plan",
        "Disposal / Decommission Plan",
      ],
      process: ["Stakeholder needs", "Requirements analysis", "Architecture design", "Implementation", "Integration", "Verification", "Transition", "Operation", "Disposal"],
    },
    {
      code: "ISO/IEC 25010:2023",
      title: "Software Quality Model (SQuaRE)",
      scope: "Quality model defining product quality characteristics — functionality, reliability, usability, efficiency, security, etc.",
      applicableTo: "Software quality assurance, acceptance criteria, NFRs",
      documents: [
        "Quality Requirements Specification",
        "Quality Metrics Definition Document",
        "Usability Test Report",
        "Performance Test Report",
        "Reliability Test Report",
        "Security Assessment Report",
        "Compatibility Test Report",
        "Maintainability Assessment",
      ],
      process: ["Quality requirements", "Quality measurement", "Quality evaluation", "Quality improvement"],
    },
    {
      code: "ISO/IEC 27034:2011+",
      title: "Application Security",
      scope: "Framework for integrating security into the application lifecycle.",
      applicableTo: "Secure SDLC, DevSecOps, web/mobile application security",
      documents: [
        "Application Security Policy",
        "Threat Modeling Report (STRIDE/DREAD)",
        "Secure Coding Guidelines",
        "SAST / DAST Scan Reports",
        "Penetration Test Report",
        "Application Security Controls Matrix",
        "Security Training Records",
      ],
      process: ["Threat modeling", "Security requirements", "Secure design", "Secure coding", "Security testing", "Security deployment", "Security operation"],
    },
    {
      code: "ISO/IEC 20000-1:2018",
      title: "IT Service Management (ITSM)",
      scope: "Requirements for planning, establishing, implementing, operating, monitoring, and improving an SMS.",
      applicableTo: "IT operations, DevOps, SRE, managed services",
      documents: [
        "Service Management Policy",
        "Service Catalogue",
        "Service Level Agreements (SLAs)",
        "Incident Management Procedure",
        "Problem Management Procedure",
        "Change Management Procedure",
        "Capacity Management Plan",
        "Availability & Continuity Plan",
        "Service Improvement Plan",
      ],
      process: ["Service design", "Service transition", "Service delivery", "Incident management", "Problem management", "Change management", "Continual improvement"],
    },
  ],
  data: [
    {
      code: "ISO 8000:2011+",
      title: "Data Quality",
      scope: "Master data quality management — characteristics, measurement, and improvement.",
      applicableTo: "Data engineering, ETL pipelines, data governance",
      documents: [
        "Data Quality Policy",
        "Data Quality Dimensions & Metrics",
        "Data Profiling Report",
        "Data Cleansing Procedures",
        "Data Quality Scorecard",
        "Data Quality Improvement Plan",
        "Master Data Management (MDM) Plan",
      ],
      process: ["Data profiling", "Quality dimension definition", "Quality measurement", "Root cause analysis", "Data cleansing", "Quality monitoring"],
    },
    {
      code: "ISO/IEC 20546:2019",
      title: "Big Data — Overview & Vocabulary",
      scope: "Overview of big data — reference architecture, vocabulary, and use cases.",
      applicableTo: "Data lakes, data platforms, big data analytics",
      documents: [
        "Big Data Reference Architecture Document",
        "Data Platform Design Document",
        "Data Pipeline Architecture",
        "Scalability & Performance Design",
        "Data Catalog / Metadata Repository",
      ],
      process: ["Data collection", "Data storage", "Data processing", "Data analysis", "Data visualization", "Data governance"],
    },
    {
      code: "ISO/IEC 20547:2020",
      title: "Big Data Reference Architecture",
      scope: "Reference architecture framework for big data systems.",
      applicableTo: "Data platform architecture, cloud data engineering",
      documents: [
        "Big Data Architecture Blueprint",
        "Component Interaction Diagrams",
        "Data Flow Diagrams",
        "Technology Stack Decision Record",
        "Security & Privacy Architecture",
      ],
      process: ["Architecture framework selection", "Component design", "Interface design", "Security integration", "Deployment topology"],
    },
    {
      code: "ISO/IEC 38505-1:2017",
      title: "Governance of Data",
      scope: "Governance principles for data — accountability, strategy, compliance, and quality.",
      applicableTo: "Data governance, CDO office, data strategy",
      documents: [
        "Data Governance Charter",
        "Data Governance Policy",
        "Data Stewardship Roles & Responsibilities",
        "Data Classification Standard",
        "Data Retention & Disposal Policy",
        "Data Governance KPIs",
        "Data Governance Board Minutes",
      ],
      process: ["Evaluate data needs", "Direct data strategy", "Monitor data management", "Ensure accountability"],
    },
  ],
  iot: [
    {
      code: "ISO/IEC 30141:2018",
      title: "IoT Reference Architecture",
      scope: "Reference architecture for IoT systems — domains, entities, and interactions.",
      applicableTo: "IoT solution design, edge computing, smart systems",
      documents: [
        "IoT Reference Architecture Document",
        "Device Domain Specification",
        "Edge/Gateway Design Document",
        "Cloud Platform Architecture",
        "Data Flow & Protocol Specification",
        "Interoperability Requirements",
      ],
      process: ["Domain analysis", "Entity identification", "Interaction design", "Protocol selection", "Security design", "Deployment planning"],
    },
    {
      code: "ISO/IEC 27400:2022",
      title: "IoT Security & Privacy",
      scope: "Security and privacy guidelines for IoT systems and their ecosystems.",
      applicableTo: "IoT security, device authentication, data privacy",
      documents: [
        "IoT Security Policy",
        "Device Authentication & Identity Management Plan",
        "IoT Threat Model & Risk Assessment",
        "Firmware Integrity & Secure Boot Design",
        "Data Encryption & Privacy Design",
        "Incident Response Plan (IoT-specific)",
        "IoT Security Testing Report",
      ],
      process: ["Threat modeling", "Security requirements", "Secure design", "Device provisioning", "Security monitoring", "Incident response", "Firmware updates"],
    },
    {
      code: "IEC 62443:2018+",
      title: "Industrial Cybersecurity (OT/ICS)",
      scope: "Security for industrial automation and control systems (IACS) — zones, conduits, and security levels.",
      applicableTo: "SCADA, PLC, ICS, OT security, smart factories",
      documents: [
        "OT Security Policy & Procedures",
        "Zone & Conduit Diagram",
        "Security Level Assignment Matrix",
        "Risk Assessment (per zone)",
        "System Security Plan (SSP)",
        "Patch Management Procedure (OT)",
        "Incident Response Plan (OT)",
        "Security Acceptance Test Report",
      ],
      process: ["Security risk assessment", "Zone/conduit design", "Security level assignment", "Security controls implementation", "Verification & validation", "Patch management", "Monitoring & incident response"],
    },
    {
      code: "ISO/IEC 21823-1:2019",
      title: "IoT Interoperability",
      scope: "Framework for IoT system interoperability — transport, syntactic, semantic, and behavioral.",
      applicableTo: "Multi-vendor IoT, smart city, Matter/Thread",
      documents: [
        "Interoperability Requirements Document",
        "Protocol Mapping Specification",
        "Semantic Data Model (ontology)",
        "Interoperability Test Plan",
        "Conformance Test Report",
      ],
      process: ["Interoperability requirements", "Protocol analysis", "Semantic alignment", "Testing", "Certification"],
    },
  ],
  robotics: [
    {
      code: "ISO 10218-1/2:2011",
      title: "Industrial Robot Safety",
      scope: "Safety requirements for industrial robots (Part 1: Robot) and robot systems / integration (Part 2: System).",
      applicableTo: "Robot cell design, installation, commissioning (ABB, FANUC, KUKA)",
      documents: [
        "Robot System Risk Assessment (per ISO 12100)",
        "Safety Layout Drawing (with safeguarding zones)",
        "Safety Circuit Design & Diagrams",
        "Safety PLC / Safety Controller Program Documentation",
        "Emergency Stop Test Protocol",
        "Safety Validation Report",
        "Safeguarding Device Selection Justification",
        "Robot System User Manual",
        "Declaration of Conformity",
      ],
      process: ["Hazard identification", "Risk estimation", "Risk evaluation", "Risk reduction (safeguarding)", "Verification", "Validation", "Documentation"],
    },
    {
      code: "ISO/TS 15066:2016",
      title: "Collaborative Robot Safety",
      scope: "Safety requirements for collaborative robot systems operating without traditional guarding.",
      applicableTo: "Cobot deployment (UR, KUKA LBR iiwa, ABB GoFa), human-robot collaboration",
      documents: [
        "Collaborative Application Risk Assessment",
        "Force & Pressure Limit Calculations (per body region)",
        "Speed & Separation Monitoring Design",
        "Power & Force Limiting Configuration",
        "Hand Guiding Procedure",
        "Collaborative Workspace Layout",
        "Biomechanical Force Measurement Report",
        "Operator Training Records",
      ],
      process: ["Task analysis", "Hazard identification", "Collaborative mode selection", "Force/speed limit design", "Validation testing", "Operator training"],
    },
    {
      code: "ISO 9283:1998",
      title: "Robot Performance & Calibration",
      scope: "Performance criteria and testing methods for robot pose accuracy, repeatability, and path performance.",
      applicableTo: "Robot calibration service, acceptance testing, performance benchmarking",
      documents: [
        "Calibration Test Plan (per ISO 9283)",
        "Pose Accuracy & Repeatability Test Report",
        "Path Accuracy & Path Repeatability Report",
        "Settling Time & Overshoot Measurements",
        "TCP Calibration Certificate",
        "Measurement Equipment Calibration Certificates",
        "Before/After Performance Comparison",
      ],
      process: ["Test setup & fixture", "Measurement equipment calibration", "Pose accuracy test", "Pose repeatability test", "Path accuracy test", "Data analysis & reporting"],
    },
    {
      code: "ISO 13849-1:2023",
      title: "Safety of Machinery — Control Systems",
      scope: "Safety-related parts of control systems — Performance Levels (PL a-e) and categories.",
      applicableTo: "Safety PLC programming, e-stop circuits, light curtains, safety interlocks",
      documents: [
        "Safety Function Specification",
        "Performance Level (PL) Determination",
        "Category Assignment (B, 1, 2, 3, 4)",
        "Block Diagram (SRP/CS)",
        "MTTF, DC, CCF Calculation Sheet",
        "Safety Circuit Schematic",
        "Verification & Validation Test Report",
        "SISTEMA Project File",
      ],
      process: ["Safety function definition", "Required PL determination", "Category selection", "Circuit design", "MTTF/DC/CCF calculation", "Verification", "Validation"],
    },
  ],
  medical: [
    {
      code: "IEC 62304:2006/A1:2015",
      title: "Medical Device Software Lifecycle",
      scope: "Software lifecycle processes for medical device software — planning, development, maintenance.",
      applicableTo: "Medical wearables, BCI devices, digital therapeutics, SaMD",
      documents: [
        "Software Development Plan (SDP)",
        "Software Requirements Specification (SRS)",
        "Software Architecture Document",
        "Software Detailed Design",
        "Software Unit Test Report",
        "Software Integration Test Report",
        "Software System Test Report",
        "Traceability Matrix (requirements → tests)",
        "Software Anomaly / Bug Report Log",
        "Software Configuration Management Plan",
        "Software Maintenance Plan",
        "Software Release Notes",
      ],
      process: ["Planning", "Requirements analysis", "Architecture design", "Detailed design", "Unit implementation", "Integration testing", "System testing", "Release", "Maintenance"],
    },
    {
      code: "ISO 13485:2016",
      title: "Medical Device QMS",
      scope: "Quality management system requirements specific to medical devices and related services.",
      applicableTo: "All medical device development and manufacturing, including BCI, wearables",
      documents: [
        "Quality Manual",
        "Quality Policy & Objectives",
        "Management Review Records",
        "Design & Development Plan (Design History File)",
        "Design Input / Design Output Records",
        "Design Verification & Validation Reports",
        "Design Transfer Plan",
        "Supplier Qualification Records",
        "CAPA (Corrective/Preventive Action) Procedure",
        "Document Control Procedure",
        "Training Records",
        "Internal Audit Reports",
      ],
      process: ["QMS planning", "Design control", "Purchasing control", "Production control", "Monitoring & measurement", "CAPA", "Internal audit", "Management review"],
    },
    {
      code: "ISO 14971:2019",
      title: "Medical Device Risk Management",
      scope: "Application of risk management to medical devices throughout the lifecycle.",
      applicableTo: "Risk assessment for BCI, medical wearables, EEG devices",
      documents: [
        "Risk Management Plan",
        "Risk Management File",
        "Hazard Identification Worksheet",
        "Risk Estimation Worksheet (severity × probability)",
        "Risk Evaluation & Acceptability Matrix",
        "Risk Control Measures Document",
        "Residual Risk Evaluation",
        "Risk-Benefit Analysis",
        "Risk Management Report",
        "Post-Production Monitoring Plan",
      ],
      process: ["Risk analysis", "Risk evaluation", "Risk control", "Residual risk evaluation", "Risk management review", "Production & post-production information"],
    },
    {
      code: "IEC 60601-1:2005/A2:2020",
      title: "Medical Electrical Equipment Safety",
      scope: "General requirements for basic safety and essential performance of medical electrical equipment.",
      applicableTo: "EEG headsets, medical wearables, BCI hardware, fNIRS devices",
      documents: [
        "Essential Performance Requirements Document",
        "Electrical Safety Test Report",
        "Biocompatibility Assessment (ISO 10993)",
        "EMC Test Report (IEC 60601-1-2)",
        "Labeling & Marking Specification",
        "Instruction for Use (IFU)",
        "Risk Management File (per ISO 14971)",
        "Declaration of Conformity",
      ],
      process: ["Classification (Type B/BF/CF)", "Safety requirements analysis", "Design for safety", "Electrical testing", "EMC testing", "Biocompatibility testing", "Risk management", "Labeling"],
    },
    {
      code: "FDA 21 CFR Part 820",
      title: "Quality System Regulation (US FDA)",
      scope: "Current Good Manufacturing Practice (cGMP) for medical devices in the US market.",
      applicableTo: "US market medical devices, 510(k) submissions, FDA clearance",
      documents: [
        "Design History File (DHF)",
        "Device Master Record (DMR)",
        "Device History Record (DHR)",
        "Quality System Record (QSR)",
        "Complaint Handling Procedure",
        "MDR (Medical Device Reporting) Procedure",
        "510(k) / PMA Submission Package",
        "Predicate Device Comparison",
      ],
      process: ["Design controls", "Document controls", "Purchasing controls", "Production controls", "CAPA", "Complaint handling", "Medical device reporting"],
    },
  ],
  security: [
    {
      code: "ISO/IEC 27001:2022",
      title: "Information Security Management (ISMS)",
      scope: "Requirements for establishing, implementing, maintaining and improving an ISMS.",
      applicableTo: "All projects handling sensitive data, cloud services, SaaS",
      documents: [
        "ISMS Policy & Scope Statement",
        "Information Security Risk Assessment",
        "Risk Treatment Plan",
        "Statement of Applicability (SoA)",
        "Access Control Policy",
        "Incident Management Procedure",
        "Business Continuity Plan",
        "Internal Audit Report (ISMS)",
        "Management Review Minutes",
        "Asset Inventory & Classification",
      ],
      process: ["Context establishment", "Risk assessment", "Risk treatment", "Controls implementation", "Awareness & training", "Monitoring & measurement", "Internal audit", "Management review", "Continual improvement"],
    },
    {
      code: "ISO/IEC 27701:2019",
      title: "Privacy Information Management (PIMS)",
      scope: "Extension to ISO 27001 for managing privacy — PII controllers and processors.",
      applicableTo: "GDPR compliance, healthcare data, consumer wearables, BCI data",
      documents: [
        "Privacy Policy (external & internal)",
        "PII Inventory & Data Flow Map",
        "Data Protection Impact Assessment (DPIA)",
        "Consent Management Procedure",
        "Data Subject Rights Procedure",
        "Data Processing Agreements (DPAs)",
        "Data Breach Notification Procedure",
        "Privacy by Design Checklist",
        "Records of Processing Activities (RoPA)",
      ],
      process: ["PII identification", "Lawful basis determination", "Privacy risk assessment", "Privacy controls", "Consent management", "Data subject requests", "Breach management", "Audit"],
    },
    {
      code: "ISO/IEC 27017:2015",
      title: "Cloud Security Controls",
      scope: "Security controls for cloud services — guidelines for cloud service providers and customers.",
      applicableTo: "Cloud-deployed AI, SaaS platforms, cloud data pipelines",
      documents: [
        "Cloud Security Policy",
        "Shared Responsibility Matrix",
        "Cloud Risk Assessment",
        "Cloud Architecture Security Review",
        "Data Residency & Sovereignty Plan",
        "Cloud Incident Response Plan",
        "Cloud Security Monitoring Plan",
      ],
      process: ["Cloud risk assessment", "Shared responsibility definition", "Control implementation", "Monitoring", "Incident response", "Audit"],
    },
    {
      code: "SOC 2 Type II",
      title: "Service Organization Controls",
      scope: "Trust Services Criteria — security, availability, processing integrity, confidentiality, privacy.",
      applicableTo: "SaaS platforms, managed services, data processing services",
      documents: [
        "SOC 2 Readiness Assessment",
        "Control Description Document",
        "Control Evidence Package",
        "Auditor Report (Type I / Type II)",
        "Management Assertion Letter",
        "Gap Remediation Plan",
        "Continuous Monitoring Dashboard",
      ],
      process: ["Scope definition", "Control design", "Control implementation", "Evidence collection", "External audit", "Remediation", "Continuous monitoring"],
    },
  ],
  quality: [
    {
      code: "ISO 9001:2015",
      title: "Quality Management System (QMS)",
      scope: "Requirements for a QMS that demonstrates consistent delivery of products/services meeting requirements.",
      applicableTo: "All project delivery, manufacturing, services",
      documents: [
        "Quality Manual",
        "Quality Policy & Objectives",
        "Process Maps & Procedures",
        "Work Instructions",
        "Quality Records (inspection, test, review)",
        "Non-Conformance Reports (NCR)",
        "CAPA Log",
        "Supplier Evaluation Records",
        "Customer Satisfaction Surveys",
        "Internal Audit Schedule & Reports",
        "Management Review Minutes",
      ],
      process: ["Context of organization", "Leadership", "Planning", "Support", "Operation", "Performance evaluation", "Improvement"],
    },
    {
      code: "ISO/IEC 33001:2015",
      title: "Process Assessment & Capability",
      scope: "Framework for process assessment — determining process capability levels.",
      applicableTo: "Process improvement, CMMI-like assessments, maturity evaluation",
      documents: [
        "Process Assessment Plan",
        "Process Reference Model",
        "Assessment Instrument / Checklist",
        "Process Assessment Report",
        "Capability Level Determination",
        "Process Improvement Plan",
        "Gap Analysis Report",
      ],
      process: ["Planning", "Data collection", "Data validation", "Process rating", "Reporting", "Improvement planning"],
    },
    {
      code: "ISO 31000:2018",
      title: "Risk Management",
      scope: "Principles, framework, and process for managing risk — applicable to any type of risk.",
      applicableTo: "Project risk, operational risk, strategic risk management",
      documents: [
        "Risk Management Policy",
        "Risk Management Framework",
        "Risk Register",
        "Risk Assessment Report",
        "Risk Treatment Plan",
        "Risk Monitoring & Review Report",
        "Risk Communication Plan",
      ],
      process: ["Scope & context", "Risk identification", "Risk analysis", "Risk evaluation", "Risk treatment", "Monitoring & review", "Communication & consultation"],
    },
  ],
  agile: [
    {
      code: "ISO/IEC/IEEE 12207:2017",
      title: "Software Lifecycle (Agile Annex)",
      scope: "Tailoring guidance for applying lifecycle processes in agile and iterative development.",
      applicableTo: "Scrum, Kanban, SAFe, sprint-based delivery",
      documents: [
        "Agile Tailoring Plan",
        "Product Backlog (with acceptance criteria)",
        "Sprint Backlog & Burndown",
        "Sprint Review & Retrospective Notes",
        "Definition of Done (DoD)",
        "Definition of Ready (DoR)",
        "Release Plan & Velocity Tracking",
        "Impediment Log",
      ],
      process: ["Backlog refinement", "Sprint planning", "Daily standup", "Development & testing", "Sprint review", "Sprint retrospective", "Release"],
    },
    {
      code: "ISO 21500:2021",
      title: "Project Management — Guidance",
      scope: "High-level guidance on concepts and processes of project management.",
      applicableTo: "All project types — waterfall, agile, hybrid",
      documents: [
        "Project Charter",
        "Project Management Plan",
        "Scope Statement & WBS",
        "Schedule (Gantt / Roadmap)",
        "Budget & Cost Baseline",
        "Stakeholder Register",
        "Communication Plan",
        "Risk Register",
        "Lessons Learned Report",
        "Project Closure Report",
      ],
      process: ["Initiating", "Planning", "Implementing", "Controlling", "Closing"],
    },
    {
      code: "ISO/IEC/IEEE 29148:2018",
      title: "Requirements Engineering",
      scope: "Processes and products for requirements engineering — stakeholder needs, requirements, specifications.",
      applicableTo: "BRD, SRS, user stories, acceptance criteria",
      documents: [
        "Stakeholder Needs & Requirements Document",
        "Business Requirements Document (BRD)",
        "Software Requirements Specification (SRS)",
        "System Requirements Specification (SyRS)",
        "Requirements Traceability Matrix",
        "Requirements Validation Report",
        "Change Request Log",
      ],
      process: ["Stakeholder identification", "Needs analysis", "Requirements definition", "Requirements analysis", "Requirements validation", "Requirements management"],
    },
    {
      code: "ISO/IEC/IEEE 29119:2022",
      title: "Software Testing",
      scope: "Comprehensive testing standard — test processes, documentation, techniques, and test management.",
      applicableTo: "QA process, test strategy, test plans, automation",
      documents: [
        "Test Policy",
        "Test Strategy",
        "Test Plan",
        "Test Design Specification",
        "Test Case Specification",
        "Test Execution Log",
        "Test Incident Report",
        "Test Completion Report",
        "Test Environment Specification",
      ],
      process: ["Test planning", "Test monitoring & control", "Test design", "Test execution", "Test completion", "Defect management"],
    },
  ],
};

export default function ISOStandards() {
  const [activeDomain, setActiveDomain] = useState<Domain>("ai");
  const [expandedStandard, setExpandedStandard] = useState<number | null>(null);
  const domainStandards = standards[activeDomain];
  const domainInfo = domains.find((d) => d.key === activeDomain)!;

  return (
    <section id="iso-standards" className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

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
            Standards & Compliance Framework
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            ISO Standard <span className="text-accent">Documents</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto text-lg">
            Every process backed by international standards — with the exact documents,
            processes, and compliance artifacts required for each domain.
          </p>
        </motion.div>

        {/* Domain tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/5 rounded-2xl p-1.5 gap-1 flex-wrap justify-center border border-white/10">
            {domains.map((d) => (
              <button
                key={d.key}
                onClick={() => { setActiveDomain(d.key); setExpandedStandard(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeDomain === d.key
                    ? `bg-gradient-to-r ${d.color} text-white shadow-lg`
                    : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{d.icon}</span>
                <span className="hidden md:inline">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Standards list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDomain}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {domainStandards.map((std, i) => {
              const isExpanded = expandedStandard === i;
              return (
                <motion.div
                  key={std.code}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <div
                    onClick={() => setExpandedStandard(isExpanded ? null : i)}
                    className={`cursor-pointer rounded-2xl border transition-all ${
                      isExpanded
                        ? "bg-white/[0.08] border-accent/40 shadow-lg shadow-accent/10"
                        : "bg-white/[0.04] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    {/* Header row */}
                    <div className="p-5 flex items-center gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${domainInfo.color} flex items-center justify-center text-white shadow-md`}>
                        <span className="text-lg">{domainInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                            {std.code}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-sm sm:text-base">{std.title}</h3>
                        <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{std.scope}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                          {std.documents.length} docs
                        </span>
                        <span className="text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                          {std.process.length} steps
                        </span>
                      </div>
                      <motion.svg
                        className="w-5 h-5 text-white/25 flex-shrink-0"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </div>

                    {/* Expanded detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-white/10 pt-5">
                            {/* Scope & applicability */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-5">
                              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Scope</h4>
                                <p className="text-xs text-white/50 leading-relaxed">{std.scope}</p>
                              </div>
                              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2">Applicable To</h4>
                                <p className="text-xs text-white/50 leading-relaxed">{std.applicableTo}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                              {/* Required Documents */}
                              <div>
                                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Required Documents ({std.documents.length})
                                </h4>
                                <div className="space-y-1.5">
                                  {std.documents.map((doc, j) => (
                                    <motion.div
                                      key={j}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.03, duration: 0.2 }}
                                      className="flex items-start gap-2"
                                    >
                                      <svg className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                      </svg>
                                      <span className="text-[11px] text-white/55">{doc}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Process Steps */}
                              <div>
                                <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Process Steps ({std.process.length})
                                </h4>
                                <div className="space-y-2">
                                  {std.process.map((step, j) => (
                                    <motion.div
                                      key={j}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: j * 0.04, duration: 0.2 }}
                                      className="flex items-center gap-3"
                                    >
                                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${domainInfo.color} text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0`}>
                                        {j + 1}
                                      </div>
                                      <span className="text-[11px] text-white/55">{step}</span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
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
            { value: domains.length.toString(), label: "Domains" },
            { value: Object.values(standards).reduce((a, s) => a + s.length, 0).toString(), label: "ISO Standards" },
            { value: Object.values(standards).reduce((a, s) => a + s.reduce((b, st) => b + st.documents.length, 0), 0).toString(), label: "Documents" },
            { value: Object.values(standards).reduce((a, s) => a + s.reduce((b, st) => b + st.process.length, 0), 0).toString(), label: "Process Steps" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center hover:bg-white/[0.08] transition-colors">
              <p className="text-xl font-bold text-accent">{stat.value}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
