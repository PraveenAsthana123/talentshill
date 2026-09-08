import type { Metadata } from 'next';
import { QueryProvider } from '@/store/query-provider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ui/Toast';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import BackToTop from '@/components/BackToTop';
import CookieConsent from '@/components/CookieConsent';
import { ChatWidget } from '@/features/chatbot';
import ThemeProvider from '@/components/ThemeProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Talents Hill Inc — Intelligent Analytics. Intelligently Delivered.',
    template: '%s | Talents Hill Inc',
  },
  description:
    'Enterprise AI, Robotics, IoT, and Quantum consulting. Marketing analytics, customer analytics, data integration, and GenAI solutions.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Talents Hill Inc',
    title: 'Talents Hill Inc — Intelligent Analytics. Intelligently Delivered.',
    description: 'Enterprise AI, Robotics, IoT, and Quantum consulting for the modern enterprise.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ToastContainer />
            <ChatWidget />
            <WhatsAppWidget />
            <BackToTop />
            <CookieConsent />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
