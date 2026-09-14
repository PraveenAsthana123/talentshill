// Side-effect imports: each module's resolver file registers itself with
// lib/report-share/registry.ts. Import this file (not the individual
// resolver files) from anywhere that needs the registry populated.
import '@/lib/report-share/resolvers/ads-management';
import '@/lib/report-share/resolvers/leads';
import '@/lib/report-share/resolvers/influencer-video';
import '@/lib/report-share/resolvers/content';
import '@/lib/report-share/resolvers/campaigns';
import '@/lib/report-share/resolvers/contacts';
import '@/lib/report-share/resolvers/branding';
import '@/lib/report-share/resolvers/market-research';
import '@/lib/report-share/resolvers/chat';
import '@/lib/report-share/resolvers/voice-ai';
import '@/lib/report-share/resolvers/broadcasts';
import '@/lib/report-share/resolvers/appointments';
import '@/lib/report-share/resolvers/video-editing';
import '@/lib/report-share/resolvers/youtube';
