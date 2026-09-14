// Side-effect imports: each module's resolver file registers itself with
// lib/report-share/registry.ts. Import this file (not the individual
// resolver files) from anywhere that needs the registry populated.
import '@/lib/report-share/resolvers/ads-management';
import '@/lib/report-share/resolvers/leads';
