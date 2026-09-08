import type { ServiceData, ContactData, RequirementsData } from '@/store/booking-store';

/* ── Service Catalog ── */

export interface ServiceOption {
  id: string;
  name: string;
  description: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  services: ServiceOption[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'strategy',
    name: 'AI Strategy',
    icon: '🎯',
    services: [
      { id: 'readiness', name: 'AI Readiness Assessment', description: 'Evaluate your organization\'s AI maturity and roadmap' },
      { id: 'roadmap', name: 'AI Roadmap Planning', description: 'Build a phased AI adoption strategy aligned to business goals' },
      { id: 'governance', name: 'AI Governance Setup', description: 'Establish ethical AI frameworks and compliance protocols' },
    ],
  },
  {
    id: 'genai',
    name: 'GenAI Solutions',
    icon: '🤖',
    services: [
      { id: 'llm-integration', name: 'LLM Integration', description: 'Embed large language models into your workflows' },
      { id: 'rag-pipeline', name: 'RAG Pipeline', description: 'Build retrieval-augmented generation for enterprise knowledge' },
      { id: 'ai-copilot', name: 'AI Copilot Development', description: 'Custom AI assistants for your domain' },
      { id: 'fine-tuning', name: 'Model Fine-Tuning', description: 'Optimize foundation models on your proprietary data' },
    ],
  },
  {
    id: 'robotics',
    name: 'Robotics & Automation',
    icon: '⚙️',
    services: [
      { id: 'rpa', name: 'Robotic Process Automation', description: 'Automate repetitive business processes end-to-end' },
      { id: 'computer-vision', name: 'Computer Vision', description: 'Visual inspection, object detection, and image analysis' },
      { id: 'warehouse', name: 'Warehouse Automation', description: 'Smart logistics and robotic fulfillment systems' },
    ],
  },
  {
    id: 'iot',
    name: 'IoT & Smart Systems',
    icon: '📡',
    services: [
      { id: 'predictive', name: 'Predictive Maintenance', description: 'AI-powered equipment health monitoring and failure prediction' },
      { id: 'digital-twin', name: 'Digital Twin', description: 'Virtual replicas of physical assets for simulation' },
      { id: 'edge-ai', name: 'Edge AI Deployment', description: 'Run ML models on IoT devices for real-time decisions' },
    ],
  },
  {
    id: 'quantum',
    name: 'Quantum Computing',
    icon: '🔮',
    services: [
      { id: 'quantum-readiness', name: 'Quantum Readiness', description: 'Assess your use cases for quantum advantage' },
      { id: 'optimization', name: 'Quantum Optimization', description: 'Solve combinatorial problems with quantum algorithms' },
      { id: 'quantum-ml', name: 'Quantum ML', description: 'Hybrid quantum-classical machine learning approaches' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Development',
    icon: '🛠️',
    services: [
      { id: 'mvp', name: 'AI MVP Build', description: 'Rapid prototype to validate your AI product idea' },
      { id: 'platform', name: 'ML Platform Engineering', description: 'End-to-end MLOps infrastructure and CI/CD' },
      { id: 'migration', name: 'Cloud AI Migration', description: 'Move on-premise ML workloads to cloud-native platforms' },
    ],
  },
];

/* ── Time Slots ── */

export const DURATION_OPTIONS = [
  { value: '30', label: '30 min — Quick Call', description: 'Brief overview and Q&A' },
  { value: '60', label: '60 min — Standard Demo', description: 'Full walkthrough with live examples' },
  { value: '90', label: '90 min — Deep Dive', description: 'Comprehensive session with technical deep-dive' },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Europe/London', label: 'GMT/UTC' },
  { value: 'Europe/Berlin', label: 'Central European (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Australia/Sydney', label: 'Australia (AEST)' },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: 'startup', label: '1-10 employees' },
  { value: 'smb', label: '11-50 employees' },
  { value: 'mid', label: '51-200 employees' },
  { value: 'midlarge', label: '201-1000 employees' },
  { value: 'enterprise', label: '1000+ employees' },
];

export const BUDGET_OPTIONS = [
  { value: 'under-10k', label: 'Under $10K', description: 'Proof of concept or assessment' },
  { value: '10k-50k', label: '$10K - $50K', description: 'Pilot project or MVP' },
  { value: '50k-100k', label: '$50K - $100K', description: 'Production implementation' },
  { value: '100k-plus', label: '$100K+', description: 'Enterprise-scale deployment' },
  { value: 'not-sure', label: 'Not sure yet', description: 'Need help scoping' },
];

export const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate', description: 'Need to start ASAP' },
  { value: '1-3mo', label: '1-3 Months', description: 'Planning to kick off soon' },
  { value: '3-6mo', label: '3-6 Months', description: 'Evaluating options' },
  { value: 'exploring', label: 'Just Exploring', description: 'Early research phase' },
];

export const GOAL_OPTIONS = [
  'Reduce operational costs',
  'Improve customer experience',
  'Automate manual processes',
  'Gain competitive advantage',
  'Enhance decision-making',
  'Scale existing AI initiatives',
  'Comply with regulations',
  'Build internal AI capability',
];

/* ── Lead Scoring ── */

export function calculateLeadScore(
  service: ServiceData,
  contact: ContactData,
  requirements: RequirementsData
): number {
  let score = 10; // base

  // Company size
  const sizeScores: Record<string, number> = {
    startup: 5, smb: 10, mid: 15, midlarge: 20, enterprise: 25,
  };
  score += sizeScores[contact.companySize] || 5;

  // Budget
  const budgetScores: Record<string, number> = {
    'under-10k': 5, '10k-50k': 10, '50k-100k': 20, '100k-plus': 30, 'not-sure': 8,
  };
  score += budgetScores[requirements.budget] || 5;

  // Timeline urgency
  const timelineScores: Record<string, number> = {
    immediate: 30, '1-3mo': 20, '3-6mo': 10, exploring: 5,
  };
  score += timelineScores[requirements.timeline] || 5;

  // Service type
  const categoryScores: Record<string, number> = {
    strategy: 10, genai: 15, robotics: 15, iot: 12, quantum: 20, custom: 15,
  };
  score += categoryScores[service.category] || 10;

  // Bonus points
  if (contact.phone.trim().length > 0) score += 5;
  if (requirements.useCase.length > 100) score += 5;

  return Math.min(100, score);
}

export function getLeadTier(score: number): 'hot' | 'warm' | 'cool' | 'cold' {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 25) return 'cool';
  return 'cold';
}

/* ── ICS Calendar Generation ── */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toICSDate(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function generateICS(opts: {
  date: string;
  time: string;
  duration: string;
  service: string;
  category: string;
  name: string;
  email: string;
  company: string;
  appointmentId: string;
}): string {
  const start = toICSDate(opts.date, opts.time);
  const durationMin = parseInt(opts.duration, 10);
  const startDate = new Date(`${opts.date}T${opts.time}:00`);
  const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
  const end = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TalentsHill//Appointment//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${stamp}`,
    `UID:${opts.appointmentId}@talentshill.com`,
    `SUMMARY:TalentsHill Demo - ${opts.service}`,
    `DESCRIPTION:Service: ${opts.service} (${opts.category})\\nContact: ${opts.name} (${opts.company})\\nEmail: ${opts.email}\\nDuration: ${opts.duration} minutes\\n\\nJoin via link provided in confirmation email.`,
    'LOCATION:Virtual (Link to be shared)',
    `ORGANIZER;CN=TalentsHill:mailto:bookings@talentshill.com`,
    `ATTENDEE;CN=${opts.name}:mailto:${opts.email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/* ── Date Helpers ── */

export function getAvailableDates(days: number = 30): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setDate(today.getDate() + 1); // start from tomorrow

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const day = d.getDay();
    if (day !== 0 && day !== 6) { // skip weekends
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
}

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${pad(h)}:00`);
    slots.push(`${pad(h)}:30`);
  }
  return slots;
}

export function formatTimeSlot(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${pad(m)} ${period}`;
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
