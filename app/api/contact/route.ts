import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/features/forms/types/schemas';
import { createSubmission } from '@/lib/db/contact-queries';
import { calculateLeadScore } from '@/lib/contact/lead-scoring';
import { contactLimiter, getClientIp } from '@/lib/security/rate-limiter';
import { sanitizeText, normalizeEmail, hashIp } from '@/lib/security/sanitize';
import { sendEmail } from '@/lib/email/mailer';
import { buildContactAdminTemplate } from '@/lib/email/templates/contact-admin';
import { buildContactUserTemplate } from '@/lib/email/templates/contact-user';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateResult = contactLimiter.check(ip);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateResult.retryAfter || 60) } }
      );
    }

    const body = await request.json();

    // Server-side validation
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Sanitize
    const sanitized = {
      fullName: sanitizeText(data.fullName),
      email: normalizeEmail(data.email),
      phone: data.phone || undefined,
      company: sanitizeText(data.company),
      role: data.role || undefined,
      industry: data.industry,
      interestAreas: data.interestAreas,
      projectStage: data.projectStage,
      budgetRange: data.budgetRange || undefined,
      timeline: data.timeline,
      message: sanitizeText(data.message),
      consent: data.consent,
    };

    // Lead scoring
    const { score, tier } = calculateLeadScore({
      budgetRange: sanitized.budgetRange,
      timeline: sanitized.timeline,
      company: sanitized.company,
      message: sanitized.message,
      interestAreas: sanitized.interestAreas,
      projectStage: sanitized.projectStage,
      industry: sanitized.industry,
    });

    // Save to DB
    const submission = createSubmission({
      ...sanitized,
      leadScore: score,
      leadTier: tier,
      ipHash: hashIp(ip),
      userAgent: request.headers.get('user-agent') || undefined,
      sourcePage: request.headers.get('referer') || '/contact',
    });

    // Send emails (fire and forget — don't block response)
    const adminTemplate = buildContactAdminTemplate({
      ...sanitized,
      leadScore: score,
      leadTier: tier,
    });
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@talentshill.com',
      subject: adminTemplate.subject,
      html: adminTemplate.html,
    });

    const userTemplate = buildContactUserTemplate({
      fullName: sanitized.fullName,
      company: sanitized.company,
    });
    sendEmail({
      to: sanitized.email,
      subject: userTemplate.subject,
      html: userTemplate.html,
    });

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent. We will get back to you within 24 hours.',
      id: submission.id,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process contact form' }, { status: 500 });
  }
}
