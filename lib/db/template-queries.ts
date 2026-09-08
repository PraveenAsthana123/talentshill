import { randomUUID } from 'crypto';
import { eq, desc } from 'drizzle-orm';
import { db, schema } from './index';

const { emailTemplates, emailTemplateVersions } = schema;

export function getAllTemplates() {
  return db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt)).all();
}

export function getTemplateById(id: string) {
  return db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).get();
}

export function createTemplate(data: {
  name: string;
  description?: string;
  category?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: string[];
  createdBy?: string;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(emailTemplates)
    .values({
      id,
      name: data.name,
      description: data.description,
      category: data.category,
      subject: data.subject,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      variables: data.variables ? JSON.stringify(data.variables) : undefined,
      isActive: true,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function updateTemplate(id: string, data: {
  name?: string;
  description?: string;
  category?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  variables?: string[];
  isActive?: boolean;
}) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.subject !== undefined) updateData.subject = data.subject;
  if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent;
  if (data.textContent !== undefined) updateData.textContent = data.textContent;
  if (data.variables !== undefined) updateData.variables = JSON.stringify(data.variables);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  db.update(emailTemplates).set(updateData).where(eq(emailTemplates.id, id)).run();
}

export function deleteTemplate(id: string) {
  db.delete(emailTemplates).where(eq(emailTemplates.id, id)).run();
}

export function getTemplateVersions(templateId: string) {
  return db
    .select()
    .from(emailTemplateVersions)
    .where(eq(emailTemplateVersions.templateId, templateId))
    .orderBy(desc(emailTemplateVersions.version))
    .all();
}

export function createTemplateVersion(templateId: string, data: {
  subject: string;
  htmlContent: string;
  textContent?: string;
  changedBy?: string;
}) {
  const existing = getTemplateVersions(templateId);
  const id = randomUUID();
  db.insert(emailTemplateVersions)
    .values({
      id,
      templateId,
      version: existing.length + 1,
      subject: data.subject,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      changedBy: data.changedBy,
      changedAt: new Date(),
    })
    .run();
  return id;
}

export function renderTemplate(htmlContent: string, variables: Record<string, string>): string {
  let result = htmlContent;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}
