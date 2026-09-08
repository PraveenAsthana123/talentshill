import type { ChatMessage } from '@/types';
import { sanitizePrompt } from '@/lib/utils';

// Rate limit tracking (placeholder)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

// Analytics stub
export function trackChatEvent(event: string, data?: Record<string, unknown>) {
  console.log(`[ChatAnalytics] ${event}`, data);
}

// Simulated streaming response
async function* simulateStream(text: string): AsyncGenerator<string> {
  const words = text.split(' ');
  for (const word of words) {
    yield word + ' ';
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
  }
}

// Placeholder AI responses based on keywords
function generateResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('genai') || lower.includes('generative') || lower.includes('llm'))
    return 'Our Generative AI practice delivers custom LLM solutions including RAG pipelines, AI copilots, fine-tuned models, and conversational AI systems. We work with OpenAI, Azure AI, and open-source models to build production-grade GenAI applications. Would you like to learn more about a specific use case?';
  if (lower.includes('robot') || lower.includes('automation'))
    return 'Our Robotics & Automation solutions include industrial robotics integration, RPA implementations, autonomous navigation systems, and computer vision pipelines. We serve manufacturing, logistics, and healthcare sectors. Shall I share details about our robotics demos?';
  if (lower.includes('iot') || lower.includes('smart'))
    return 'We build IoT and Smart Systems solutions: edge computing architectures, sensor networks, digital twins, and predictive maintenance platforms. Our smart building solutions reduce energy costs by up to 30%.';
  if (lower.includes('quantum'))
    return 'Our Quantum AI team explores quantum optimization (QAOA, VQE), quantum machine learning, and post-quantum cryptography. We have PoCs for portfolio optimization and supply chain routing. Want to see our quantum demo?';
  if (lower.includes('demo') || lower.includes('book') || lower.includes('meeting'))
    return 'Great! You can book a demo directly at /demo or contact us at /contact. Our team typically responds within 24 hours to schedule a personalized walkthrough of our solutions.';
  if (lower.includes('career') || lower.includes('job') || lower.includes('hiring'))
    return 'We are always looking for talented people! Check out our open positions at /careers. We offer roles in AI/ML engineering, data science, robotics, and consulting.';
  return 'Thank you for your interest in Talents Hill! We specialize in AI, Robotics, IoT, and Quantum consulting for enterprises. How can I help you? You can ask about our services, solutions, demos, or careers.';
}

export async function sendMessage(userMessage: string): Promise<{ stream: AsyncGenerator<string>; fullText: string }> {
  const sanitized = sanitizePrompt(userMessage);
  trackChatEvent('message_sent', { length: sanitized.length });

  // In production, replace with actual API call:
  // const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: sanitized }) });

  const fullText = generateResponse(sanitized);
  return { stream: simulateStream(fullText), fullText };
}
