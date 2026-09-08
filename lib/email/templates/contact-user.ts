interface ContactUserData {
  fullName: string;
  company: string;
}

export function buildContactUserTemplate(data: ContactUserData): { subject: string; html: string } {
  return {
    subject: `Thank you for contacting Talents Hill, ${data.fullName}!`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a2e;">
  <div style="background: #1a1a2e; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 20px;">Talents Hill Inc</h1>
  </div>
  <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <h2 style="font-size: 18px; margin: 0 0 16px;">Hi ${data.fullName},</h2>
    <p style="line-height: 1.6; color: #334155;">
      Thank you for reaching out to Talents Hill! We've received your inquiry and our team is already reviewing it.
    </p>
    <p style="line-height: 1.6; color: #334155;">
      <strong>What happens next:</strong>
    </p>
    <ul style="color: #334155; line-height: 1.8;">
      <li>Our team will review your submission within 24 hours</li>
      <li>A solution specialist will reach out to discuss your needs</li>
      <li>We'll prepare a tailored proposal based on your requirements</li>
    </ul>
    <p style="line-height: 1.6; color: #334155;">
      In the meantime, feel free to explore our <a href="https://talentshill.com/blog" style="color: #1e40af;">blog</a> or check out our <a href="https://talentshill.com/demo" style="color: #1e40af;">live demos</a>.
    </p>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 14px; color: #64748b; margin: 0;">
        Best regards,<br>
        <strong style="color: #1a1a2e;">The Talents Hill Team</strong><br>
        <a href="mailto:info@talentshill.com" style="color: #1e40af;">info@talentshill.com</a>
      </p>
    </div>
  </div>
</body></html>`,
  };
}
