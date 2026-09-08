interface ContactAdminData {
  fullName: string;
  email: string;
  phone?: string | null;
  company: string;
  role?: string | null;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange?: string | null;
  timeline: string;
  message: string;
  leadScore: number;
  leadTier: string;
}

export function buildContactAdminTemplate(data: ContactAdminData): { subject: string; html: string } {
  const tierColors: Record<string, string> = {
    hot: '#ef4444',
    warm: '#f59e0b',
    cool: '#3b82f6',
    cold: '#6b7280',
  };

  const tierColor = tierColors[data.leadTier] || '#6b7280';

  return {
    subject: `[New Lead - ${data.leadTier.toUpperCase()}] ${data.fullName} from ${data.company}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="background: #1a1a2e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Submission</h1>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; background: ${tierColor}; color: white; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
      ${data.leadTier.toUpperCase()} LEAD — Score: ${data.leadScore}/100
    </div>

    <h2 style="font-size: 16px; color: #1e40af; margin: 16px 0 8px;">Contact Info</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 130px;">Name</td><td style="padding: 6px 0; font-weight: 500;">${data.fullName}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
      ${data.phone ? `<tr><td style="padding: 6px 0; color: #64748b;">Phone</td><td style="padding: 6px 0;">${data.phone}</td></tr>` : ''}
      <tr><td style="padding: 6px 0; color: #64748b;">Company</td><td style="padding: 6px 0; font-weight: 500;">${data.company}</td></tr>
      ${data.role ? `<tr><td style="padding: 6px 0; color: #64748b;">Role</td><td style="padding: 6px 0;">${data.role}</td></tr>` : ''}
      <tr><td style="padding: 6px 0; color: #64748b;">Industry</td><td style="padding: 6px 0;">${data.industry}</td></tr>
    </table>

    <h2 style="font-size: 16px; color: #1e40af; margin: 16px 0 8px;">Project Details</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; color: #64748b; width: 130px;">Interest Areas</td><td style="padding: 6px 0;">${data.interestAreas.join(', ')}</td></tr>
      <tr><td style="padding: 6px 0; color: #64748b;">Project Stage</td><td style="padding: 6px 0;">${data.projectStage}</td></tr>
      ${data.budgetRange ? `<tr><td style="padding: 6px 0; color: #64748b;">Budget</td><td style="padding: 6px 0;">${data.budgetRange}</td></tr>` : ''}
      <tr><td style="padding: 6px 0; color: #64748b;">Timeline</td><td style="padding: 6px 0;">${data.timeline}</td></tr>
    </table>

    <h2 style="font-size: 16px; color: #1e40af; margin: 16px 0 8px;">Message</h2>
    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${data.message}</div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
      Talents Hill Inc — Lead Management System
    </div>
  </div>
</body></html>`,
  };
}
