// Registry mapping `${moduleKey}:${reportType}` to a resolver that
// fetches the real, current report data for a share token. Each module
// built against the 2026-09-14 Use-Case Build Standard registers its own
// resolver here rather than the public route special-casing every module.
export interface ShareableReport {
  title: string;
  generatedAt: string;
  data: unknown;
}

type ReportResolver = (entityId: string | null) => Promise<ShareableReport | null>;

const resolvers = new Map<string, ReportResolver>();

export function registerReportResolver(moduleKey: string, reportType: string, resolver: ReportResolver) {
  resolvers.set(`${moduleKey}:${reportType}`, resolver);
}

export async function resolveShareableReport(moduleKey: string, reportType: string, entityId: string | null): Promise<ShareableReport | null> {
  const resolver = resolvers.get(`${moduleKey}:${reportType}`);
  if (!resolver) return null;
  return resolver(entityId);
}
