import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissionsForExport } from '@/lib/db/contact-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || undefined) as
      | 'new'
      | 'contacted'
      | 'qualified'
      | 'closed'
      | 'all'
      | undefined;
    const industry = searchParams.get('industry') || undefined;

    const submissions = getAllSubmissionsForExport({ status, industry });

    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Company',
      'Role',
      'Industry',
      'Interest Areas',
      'Project Stage',
      'Budget',
      'Timeline',
      'Message',
      'Lead Score',
      'Lead Tier',
      'Status',
      'Created At',
    ];

    const rows = submissions.map((s) =>
      [
        s.id,
        s.fullName,
        s.email,
        s.phone || '',
        s.company,
        s.role || '',
        s.industry,
        (s.interestAreas || []).join('; '),
        s.projectStage,
        s.budgetRange || '',
        s.timeline,
        `"${(s.message || '').replace(/"/g, '""')}"`,
        s.leadScore,
        s.leadTier,
        s.status,
        s.createdAt,
      ].join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
