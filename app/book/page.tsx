import type { Metadata } from 'next';
import { SectionHeader } from '@/components/ui';
import { BookingWizard } from '@/features/booking';

export const metadata: Metadata = {
  title: 'Book an Appointment — TalentsHill',
  description: 'Schedule a personalized demo or consultation with our AI engineering team. Choose your service, pick a time, and get expert guidance.',
};

export default function BookPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader
          label="Schedule a Session"
          title="Book Your Appointment"
          subtitle="Get a personalized consultation with our AI experts. Select a service, choose your time, and we'll handle the rest."
        />
        <BookingWizard />
      </div>
    </div>
  );
}
