import { NextRequest, NextResponse } from 'next/server';
import { createContact, getContactByEmail } from '@/lib/db/contact-crm-queries';
import { sendEmail } from '@/lib/email/mailer';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, linkedin, portfolio, coverLetter, jobId, jobTitle } = data;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Ensure the applicant exists as a contact
    let contact = getContactByEmail(email);
    if (!contact) {
      createContact({
        email,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
        source: 'careers',
        tags: ['applicant'],
        customFields: { linkedin, portfolio, jobId, jobTitle },
      });
    }

    // Send confirmation email to applicant
    await sendEmail({
      to: email,
      subject: `Application Received — ${jobTitle || jobId}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px;">
          <h2 style="color: #15803d;">Thank you for applying, ${name || 'Applicant'}!</h2>
          <p>We have received your application for <strong>${jobTitle || jobId}</strong> at Talents Hill Inc.</p>
          <p>Our hiring team will review your application and get back to you within 5-7 business days.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">Talents Hill Inc. — Intelligent Analytics. Intelligently Delivered.</p>
        </div>
      `,
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_FROM;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `New Job Application: ${jobTitle || jobId}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px;">
            <h2>New Application Received</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${name || 'N/A'}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Position:</td><td style="padding: 8px;">${jobTitle || jobId}</td></tr>
              ${linkedin ? `<tr><td style="padding: 8px; font-weight: bold;">LinkedIn:</td><td style="padding: 8px;">${linkedin}</td></tr>` : ''}
              ${portfolio ? `<tr><td style="padding: 8px; font-weight: bold;">Portfolio:</td><td style="padding: 8px;">${portfolio}</td></tr>` : ''}
            </table>
            ${coverLetter ? `<h3>Cover Letter</h3><p>${coverLetter}</p>` : ''}
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, message: 'Application submitted successfully' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
