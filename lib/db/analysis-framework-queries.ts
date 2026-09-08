import { eq, asc } from 'drizzle-orm';
import { db, schema } from './index';

const { analysisFrameworks } = schema;

export function getAllFrameworks() {
  return db
    .select()
    .from(analysisFrameworks)
    .orderBy(asc(analysisFrameworks.sortOrder))
    .all();
}

export function getFrameworkByKey(categoryKey: string) {
  return db
    .select()
    .from(analysisFrameworks)
    .where(eq(analysisFrameworks.categoryKey, categoryKey))
    .get();
}

export function getFrameworkById(id: string) {
  return db
    .select()
    .from(analysisFrameworks)
    .where(eq(analysisFrameworks.id, id))
    .get();
}
