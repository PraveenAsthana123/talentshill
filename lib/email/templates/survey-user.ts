interface SurveyUserData {
  contactName: string;
  totalScore: number;
  maturityLevel: string;
  recommendedPath: string;
  segmentationTags: string[];
}

export function buildSurveyUserTemplate(data: SurveyUserData): { subject: string; html: string } {
  const levelColors: Record<string, string> = {
    beginner: '#6b7280',
    developing: '#3b82f6',
    advanced: '#10b981',
    leader: '#8b5cf6',
  };

  const levelColor = levelColors[data.maturityLevel] || '#6b7280';
  const levelLabel = data.maturityLevel.charAt(0).toUpperCase() + data.maturityLevel.slice(1);

  return {
    subject: `Your AI Readiness Assessment Results — ${levelLabel} Level`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="background: #1a1a2e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">AI Readiness Assessment Results</h1>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <h2 style="font-size: 18px; margin: 0 0 16px;">Hi ${data.contactName},</h2>
    <p style="line-height: 1.6; color: #334155;">
      Thank you for completing the AI Readiness Assessment. Here are your results:
    </p>

    <div style="text-align: center; padding: 24px; background: #f8fafc; border-radius: 12px; margin: 20px 0;">
      <div style="font-size: 48px; font-weight: 700; color: ${levelColor};">${data.totalScore}</div>
      <div style="font-size: 14px; color: #64748b;">out of 100</div>
      <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: ${levelColor}; color: white; font-size: 14px; font-weight: 600; margin-top: 12px;">
        ${levelLabel}
      </div>
    </div>

    ${data.recommendedPath ? `
    <h3 style="font-size: 16px; color: #1e40af; margin: 20px 0 8px;">Recommended Path</h3>
    <p style="line-height: 1.6; color: #334155;">${data.recommendedPath}</p>
    ` : ''}

    ${data.segmentationTags.length > 0 ? `
    <h3 style="font-size: 16px; color: #1e40af; margin: 20px 0 8px;">Your Profile Tags</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      ${data.segmentationTags.map(tag => `<span style="display: inline-block; padding: 4px 12px; background: #eef2ff; color: #4338ca; border-radius: 16px; font-size: 12px;">${tag}</span>`).join('')}
    </div>
    ` : ''}

    <div style="margin-top: 24px; text-align: center;">
      <a href="https://talentshill.com/contact" style="display: inline-block; padding: 12px 32px; background: #1e40af; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Talk to Our Experts
      </a>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #64748b; margin: 0;">
        Best regards,<br>
        <strong style="color: #1a1a2e;">The Talents Hill Team</strong>
      </p>
    </div>
  </div>
</body></html>`,
  };
}
