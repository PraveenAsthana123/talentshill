import type { NavItem, SocialLinks, VideoItem, DemoItem } from '@/types';

export const SITE_NAME = 'Talents Hill Inc';
export const SITE_DESCRIPTION =
  'Intelligent Analytics. Intelligently Delivered. AI, Robotics, IoT, and Quantum consulting for the enterprise.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://talentshill.com';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Marketing Analytics', href: '/services#marketing-analytics' },
      { label: 'Customer Analytics', href: '/services#customer-analytics' },
      { label: 'Data Integration', href: '/services#data-integration' },
    ],
  },
  { label: 'Industries', href: '/industries' },
  {
    label: 'Solutions',
    href: '#',
    children: [
      { label: 'Robotics & AI', href: '/solutions/robotics-ai' },
      { label: 'Generative AI', href: '/solutions/genai' },
      { label: 'Quantum AI', href: '/solutions/quantum-ai' },
    ],
  },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Demos', href: '/demo' },
  { label: 'Book', href: '/book' },
  { label: 'Contact', href: '/contact' },
];

export const SOCIAL_LINKS: SocialLinks = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+1234567890',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '#',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#',
};

export const INDUSTRIES = [
  { id: 'banking', name: 'Banking & Finance', icon: '🏦', description: 'Risk analytics, fraud detection, credit scoring, and regulatory compliance powered by AI.' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Patient analytics, clinical decision support, drug discovery, and medical imaging AI.' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏢', description: 'Property valuation, market prediction, smart building IoT, and investment analytics.' },
  { id: 'agritech', name: 'AgriTech', icon: '🌾', description: 'Precision farming, crop monitoring, yield prediction, and supply chain optimization.' },
  { id: 'retail', name: 'Retail & E-commerce', icon: '🛒', description: 'Customer segmentation, demand forecasting, recommendation engines, and pricing optimization.' },
  { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Predictive maintenance, quality control, robotics automation, and digital twin technology.' },
];

export const SERVICES = [
  {
    category: 'Analytics',
    items: [
      { id: 'marketing-analytics', name: 'Marketing Analytics', description: 'Attribution modeling, campaign optimization, CLV prediction, and marketing mix analysis.', useCases: ['Multi-touch attribution', 'Churn prediction', 'A/B test analysis'] },
      { id: 'customer-analytics', name: 'Customer Analytics', description: 'Segmentation, lifetime value, sentiment analysis, and customer journey mapping.', useCases: ['360° customer view', 'Next-best-action', 'Retention modeling'] },
      { id: 'data-integration', name: 'Data Integration', description: 'ETL pipelines, data warehousing, real-time streaming, and master data management.', useCases: ['Cloud migration', 'Data lake architecture', 'API integration'] },
    ],
  },
  {
    category: 'AI Solutions',
    items: [
      { id: 'genai', name: 'Generative AI', description: 'Custom LLM fine-tuning, RAG pipelines, AI copilots, and conversational AI.', useCases: ['Enterprise chatbot', 'Document intelligence', 'Code generation'] },
      { id: 'robotics', name: 'Robotics & Automation', description: 'Industrial robotics, RPA, autonomous systems, and computer vision.', useCases: ['Warehouse automation', 'Quality inspection', 'Autonomous navigation'] },
      { id: 'iot', name: 'IoT & Smart Systems', description: 'Edge computing, sensor networks, digital twins, and predictive maintenance.', useCases: ['Smart buildings', 'Fleet management', 'Environmental monitoring'] },
      { id: 'quantum', name: 'Quantum Computing', description: 'Quantum optimization, quantum ML, cryptography, and simulation.', useCases: ['Portfolio optimization', 'Drug discovery', 'Supply chain'] },
    ],
  },
];

export const DEMO_ITEMS: DemoItem[] = [
  {
    id: 'genai-copilot',
    title: 'GenAI Copilot',
    description: 'Experience our enterprise AI copilot with RAG-powered document intelligence, multi-turn reasoning, and domain-specific knowledge retrieval.',
    category: 'Generative AI',
    tags: ['LLM', 'RAG', 'Copilot', 'NLP'],
    image: '/images/demo-genai.svg',
    status: 'live',
  },
  {
    id: 'robotics-predictive',
    title: 'Robotics Predictive Maintenance',
    description: 'Real-time anomaly detection and failure prediction for industrial robotics using sensor fusion and time-series ML models.',
    category: 'Robotics',
    tags: ['IoT', 'ML', 'Sensors', 'Anomaly Detection'],
    image: '/images/demo-robotics.svg',
    status: 'beta',
  },
  {
    id: 'quantum-optimization',
    title: 'Quantum Optimization PoC',
    description: 'Explore quantum-enhanced combinatorial optimization for logistics routing and financial portfolio balancing.',
    category: 'Quantum',
    tags: ['Quantum', 'Optimization', 'QAOA', 'VQE'],
    image: '/images/demo-quantum.svg',
    status: 'coming-soon',
  },
];

export const VIDEO_ITEMS: VideoItem[] = [
  {
    id: 'intro-ai',
    title: 'Introduction to Enterprise AI',
    summary: 'An overview of how Talents Hill delivers AI-powered analytics and automation solutions to enterprises.',
    tags: ['AI', 'Enterprise', 'Overview'],
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '12:30',
  },
  {
    id: 'genai-demo',
    title: 'GenAI RAG Pipeline Demo',
    summary: 'See how our Retrieval-Augmented Generation pipeline ingests enterprise documents and answers complex queries.',
    tags: ['GenAI', 'RAG', 'Demo'],
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '8:45',
  },
  {
    id: 'robotics-overview',
    title: 'Industrial Robotics & IoT',
    summary: 'Walkthrough of our robotics automation and IoT monitoring solutions for manufacturing and logistics.',
    tags: ['Robotics', 'IoT', 'Manufacturing'],
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15:20',
  },
];

export const SURVEY_CATEGORIES = [
  'AI Readiness',
  'GenAI Adoption',
  'Robotics Readiness',
  'Quantum Exploration',
] as const;
