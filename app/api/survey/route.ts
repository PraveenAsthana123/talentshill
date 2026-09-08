import { NextRequest, NextResponse } from 'next/server';
import { saveSurveyResponse } from '@/lib/db/survey-queries';
import { calculateSurveyScore, generateSegmentationTags } from '@/lib/survey/scoring';
import { surveyLimiter, getClientIp } from '@/lib/security/rate-limiter';
import { sanitizeText, normalizeEmail } from '@/lib/security/sanitize';
import { sendEmail } from '@/lib/email/mailer';
import { buildSurveyUserTemplate } from '@/lib/email/templates/survey-user';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateResult = surveyLimiter.check(ip);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateResult.retryAfter || 60) } }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.answers || !Array.isArray(body.answers) || body.answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // Build answer objects with scores
    const answers = body.answers.map((a: { questionId: string; value: string | string[]; scoreValue?: number }) => ({
      questionId: a.questionId,
      answerValue: Array.isArray(a.value) ? a.value.join(', ') : String(a.value),
      scoreValue: a.scoreValue || 0,
    }));

    // Calculate score
    const scoreResult = calculateSurveyScore(answers);

    // Generate segmentation tags
    const segmentationTags = generateSegmentationTags({
      industry: body.industry || null,
      companySize: body.companySize || null,
      totalScore: scoreResult.totalScore,
      maturityLevel: scoreResult.maturityLevel,
      answers,
    });

    // Sanitize optional contact info
    const contactName = body.contactName ? sanitizeText(body.contactName) : undefined;
    const email = body.email ? normalizeEmail(body.email) : undefined;
    const company = body.company ? sanitizeText(body.company) : undefined;

    // Save to DB
    const response = saveSurveyResponse({
      contactName,
      email,
      company,
      industry: body.industry || undefined,
      companySize: body.companySize || undefined,
      role: body.role || undefined,
      totalScore: scoreResult.totalScore,
      maturityLevel: scoreResult.maturityLevel,
      recommendedPath: scoreResult.recommendedPath,
      segmentationTags,
      answers,
    });

    // Send email if contact provided
    if (email && contactName) {
      const template = buildSurveyUserTemplate({
        contactName,
        totalScore: scoreResult.totalScore,
        maturityLevel: scoreResult.maturityLevel,
        recommendedPath: scoreResult.recommendedPath,
        segmentationTags,
      });
      sendEmail({ to: email, subject: template.subject, html: template.html });
    }

    return NextResponse.json({
      success: true,
      id: response.id,
      score: scoreResult.totalScore,
      level: scoreResult.maturityLevel,
      recommendedPath: scoreResult.recommendedPath,
      segmentationTags,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process survey' }, { status: 500 });
  }
}
