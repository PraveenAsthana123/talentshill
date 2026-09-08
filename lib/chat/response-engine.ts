import { evaluateMessage } from './evaluators';
import { createEval } from '@/lib/db/chat-eval-queries';
import { createMessage, getMessages } from '@/lib/db/chat-queries';
import { sendEmail } from '@/lib/email/mailer';

interface ResponseContext {
  sessionId: string;
  requestId?: string;
  visitorEmail?: string;
  visitorName?: string;
}

// Enhanced response generation with context awareness
export function generateResponse(message: string, context: ResponseContext): string {
  const lower = message.toLowerCase();

  // Greeting responses
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))/i.test(lower)) {
    return "Hello! Welcome to TalentsHill. I'm here to help you with any questions about our AI solutions and services. How can I assist you today?";
  }

  // Pricing inquiries
  if (lower.includes('pricing') || lower.includes('cost') || lower.includes('price') || lower.includes('quote')) {
    return "I'd be happy to help with pricing information! Our solutions are customized based on your specific needs. Could you tell me more about your project requirements? I can connect you with our team for a detailed quote.";
  }

  // Demo requests
  if (lower.includes('demo') || lower.includes('trial') || lower.includes('try')) {
    return "Great! We'd love to show you a demo. You can schedule one through our Demo page, or I can have our team reach out to arrange a personalized demonstration. What specific capabilities are you most interested in?";
  }

  // Services questions
  if (lower.includes('service') || lower.includes('solution') || lower.includes('offer') || lower.includes('what do you')) {
    return "TalentsHill offers enterprise AI solutions including Generative AI, Quantum AI, and Robotics AI. We provide end-to-end services from strategy consulting to implementation and ongoing support. Which area interests you the most?";
  }

  // Support
  if (lower.includes('support') || lower.includes('help') || lower.includes('issue') || lower.includes('problem')) {
    return "I'm sorry to hear you're experiencing issues. Could you describe the problem in more detail? I'll make sure your request gets to the right team member who can help resolve it quickly.";
  }

  // Contact
  if (lower.includes('contact') || lower.includes('email') || lower.includes('phone') || lower.includes('reach')) {
    return "You can reach us through our Contact page, or I can have a team member reach out to you directly. Would you like me to arrange that?";
  }

  // Thank you
  if (lower.includes('thank') || lower.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  // Goodbye
  if (lower.includes('bye') || lower.includes('goodbye') || lower.includes('see you')) {
    return "Thank you for chatting with us! If you have any more questions in the future, don't hesitate to reach out. Have a great day!";
  }

  // Default response
  return "Thank you for your message. I want to make sure I give you the most helpful response. Could you tell me a bit more about what you're looking for? Whether it's about our AI solutions, pricing, or getting in touch with our team, I'm here to help!";
}

// Process a user message: evaluate, generate response, evaluate response, persist, optionally email
export async function processMessage(
  userMessage: string,
  context: ResponseContext
): Promise<{
  responseText: string;
  userMessageId: string;
  responseMessageId: string;
  userEvals: Record<string, { passed: boolean; score: number }>;
  responseEvals: Record<string, { passed: boolean; score: number }>;
}> {
  // 1. Persist user message
  const userMessageId = createMessage({
    sessionId: context.sessionId,
    requestId: context.requestId,
    role: 'user',
    content: userMessage,
  });

  // 2. Evaluate user message
  const userEvalResults = evaluateMessage(userMessage);
  const userEvals: Record<string, { passed: boolean; score: number }> = {};
  for (const [type, result] of Object.entries(userEvalResults.results)) {
    createEval({
      messageId: userMessageId,
      evalType: type,
      score: result.score,
      passed: result.passed,
      details: result.details,
    });
    userEvals[type] = { passed: result.passed, score: result.score };
  }

  // 3. Generate response
  const responseText = generateResponse(userMessage, context);

  // 4. Persist response
  const responseMessageId = createMessage({
    sessionId: context.sessionId,
    requestId: context.requestId,
    role: 'assistant',
    content: responseText,
  });

  // 5. Evaluate response
  const responseEvalResults = evaluateMessage(responseText);
  const responseEvals: Record<string, { passed: boolean; score: number }> = {};
  for (const [type, result] of Object.entries(responseEvalResults.results)) {
    createEval({
      messageId: responseMessageId,
      evalType: type,
      score: result.score,
      passed: result.passed,
      details: result.details,
    });
    responseEvals[type] = { passed: result.passed, score: result.score };
  }

  // 6. Dual response — send email if visitor email is captured
  if (context.visitorEmail) {
    try {
      await sendEmail({
        to: context.visitorEmail,
        subject: 'TalentsHill Chat Response',
        html: `<p>Hi ${context.visitorName || 'there'},</p><p>${responseText}</p><p style="color:#999;font-size:12px;">This is an automated response from your chat conversation with TalentsHill.</p>`,
      });
    } catch {
      // Silent fail for email — don't break chat
    }
  }

  return { responseText, userMessageId, responseMessageId, userEvals, responseEvals };
}
