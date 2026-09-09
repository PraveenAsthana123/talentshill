import { db, schema } from '@/lib/db/index';
import { sql, eq, like, gt, lt, and, or } from 'drizzle-orm';

const { contacts } = schema;

interface RuleCondition {
  field: string;
  operator: string;
  value: string | number | string[];
}

interface RuleGroup {
  logic: 'AND' | 'OR';
  conditions: (RuleCondition | RuleGroup)[];
}

function isRuleGroup(item: RuleCondition | RuleGroup): item is RuleGroup {
  return 'logic' in item && 'conditions' in item;
}

function buildCondition(condition: RuleCondition) {
  const col = sql.raw(`"${condition.field.replace(/[^a-zA-Z0-9_]/g, '')}"`);
  switch (condition.operator) {
    case 'equals':
      return sql`${col} = ${condition.value}`;
    case 'not_equals':
      return sql`${col} != ${condition.value}`;
    case 'contains':
      return sql`${col} LIKE ${'%' + condition.value + '%'}`;
    case 'starts_with':
      return sql`${col} LIKE ${condition.value + '%'}`;
    case 'greater_than':
      return sql`${col} > ${condition.value}`;
    case 'less_than':
      return sql`${col} < ${condition.value}`;
    case 'is_empty':
      return sql`(${col} IS NULL OR ${col} = '')`;
    case 'is_not_empty':
      return sql`(${col} IS NOT NULL AND ${col} != '')`;
    default:
      return sql`1=1`;
  }
}

function buildGroupCondition(group: RuleGroup): ReturnType<typeof sql> {
  if (group.conditions.length === 0) return sql`1=1`;

  const parts = group.conditions.map(item => {
    if (isRuleGroup(item)) return buildGroupCondition(item);
    return buildCondition(item);
  });

  if (group.logic === 'OR') {
    return sql.join(parts, sql` OR `);
  }
  return sql.join(parts, sql` AND `);
}

export function evaluateSegmentRules(rules: RuleGroup): { count: number; sampleIds: string[] } {
  const condition = buildGroupCondition(rules);

  const countResult = db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(contacts)
    .where(condition)
    .get();

  const sampleResults = db
    .select({ id: contacts.id })
    .from(contacts)
    .where(condition)
    .limit(10)
    .all();

  return {
    count: countResult?.cnt ?? 0,
    sampleIds: sampleResults.map(r => r.id),
  };
}

// Full (unlimited) match resolution -- evaluateSegmentRules() above caps
// at a 10-row preview sample, which is correct for the UI preview but
// cannot be used to materialize real list membership. Reuses the same
// condition-building logic so preview and real sync always agree.
export function getMatchingContactIds(rules: RuleGroup): string[] {
  const condition = buildGroupCondition(rules);
  const results = db.select({ id: contacts.id }).from(contacts).where(condition).all();
  return results.map(r => r.id);
}
