import { createContact, getContactByEmail } from '@/lib/db/contact-crm-queries';
import { createImportJob, updateImportJob } from '@/lib/db/import-job-queries';

export interface CsvRow {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  tags?: string;
}

export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  errorMessages: string[];
}

/**
 * Parse CSV text into rows. Expects header row.
 */
export function parseCsvText(text: string): CsvRow[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const emailIdx = headers.findIndex(h => h === 'email' || h === 'e-mail');
  if (emailIdx === -1) throw new Error('CSV must have an "email" column');

  const firstNameIdx = headers.findIndex(h => h === 'firstname' || h === 'first_name' || h === 'first name');
  const lastNameIdx = headers.findIndex(h => h === 'lastname' || h === 'last_name' || h === 'last name');
  const companyIdx = headers.findIndex(h => h === 'company' || h === 'organization');
  const phoneIdx = headers.findIndex(h => h === 'phone' || h === 'telephone');
  const tagsIdx = headers.findIndex(h => h === 'tags');

  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    const email = cells[emailIdx]?.trim();
    if (!email || !email.includes('@')) continue;

    rows.push({
      email,
      firstName: firstNameIdx >= 0 ? cells[firstNameIdx] : undefined,
      lastName: lastNameIdx >= 0 ? cells[lastNameIdx] : undefined,
      company: companyIdx >= 0 ? cells[companyIdx] : undefined,
      phone: phoneIdx >= 0 ? cells[phoneIdx] : undefined,
      tags: tagsIdx >= 0 ? cells[tagsIdx] : undefined,
    });
  }

  return rows;
}

/**
 * Import parsed CSV rows into contacts table.
 */
export function importContacts(rows: CsvRow[]): ImportResult {
  const result: ImportResult = { total: rows.length, imported: 0, duplicates: 0, errors: 0, errorMessages: [] };

  for (const row of rows) {
    try {
      const existing = getContactByEmail(row.email);
      if (existing) {
        result.duplicates++;
        continue;
      }

      const tags = row.tags ? row.tags.split(';').map(t => t.trim()).filter(Boolean) : undefined;

      createContact({
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        company: row.company,
        phone: row.phone,
        source: 'import',
        tags,
      });

      result.imported++;
    } catch (err) {
      result.errors++;
      result.errorMessages.push(`Row ${row.email}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return result;
}

/**
 * Import contacts with job tracking.
 */
export function importContactsWithTracking(
  rows: CsvRow[],
  options: {
    fileName: string;
    columnMapping?: Record<string, string>;
    createdBy?: string;
  }
): { jobId: string; result: ImportResult } {
  const jobId = createImportJob({
    fileName: options.fileName,
    totalRows: rows.length,
    columnMapping: options.columnMapping,
    createdBy: options.createdBy,
  });

  updateImportJob(jobId, { status: 'processing' });

  const result = importContacts(rows);

  updateImportJob(jobId, {
    status: result.errors > 0 && result.imported === 0 ? 'failed' : 'completed',
    processedRows: result.total,
    importedCount: result.imported,
    duplicateCount: result.duplicates,
    errorCount: result.errors,
    errors: result.errorMessages.length > 0 ? result.errorMessages : undefined,
  });

  return { jobId, result };
}
