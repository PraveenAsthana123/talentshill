import { randomUUID } from 'crypto';
import { db, schema } from './index';

const { featureFlags } = schema;

const DEFAULT_FLAGS = [
  { key: 'blog', label: 'Blog', module: 'content', description: 'Blog publishing and management', sortOrder: 1 },
  { key: 'careers', label: 'Careers', module: 'content', description: 'Job listings and applications', sortOrder: 2 },
  { key: 'demos', label: 'Demos', module: 'content', description: 'Demo booking and showcase', sortOrder: 3 },
  { key: 'videos', label: 'Videos', module: 'content', description: 'Video gallery management', sortOrder: 4 },
  { key: 'survey', label: 'Survey', module: 'engagement', description: 'AI readiness survey', sortOrder: 5 },
  { key: 'booking', label: 'Booking', module: 'engagement', description: 'Appointment booking system', sortOrder: 6 },
  { key: 'chatbot', label: 'Chatbot', module: 'engagement', description: 'AI chatbot assistant', sortOrder: 7 },
  { key: 'whatsapp', label: 'WhatsApp', module: 'engagement', description: 'WhatsApp integration widget', sortOrder: 8 },
  { key: 'social_links', label: 'Social Links', module: 'engagement', description: 'Social media link display', sortOrder: 9 },
  { key: 'contact', label: 'Contact', module: 'engagement', description: 'Contact form and lead capture', sortOrder: 10 },
  { key: 'newsletter', label: 'Newsletter', module: 'engagement', description: 'Newsletter subscription', sortOrder: 11 },
  { key: 'campaigns', label: 'Campaigns', module: 'marketing', description: 'Email campaign management', sortOrder: 12 },
  { key: 'crm', label: 'CRM', module: 'marketing', description: 'Contact relationship management', sortOrder: 13 },
  { key: 'broadcasts', label: 'Broadcasts', module: 'marketing', description: 'Bulk email broadcasts', sortOrder: 14 },
  { key: 'banners', label: 'Banners', module: 'operations', description: 'Site-wide banner management', sortOrder: 15 },
  { key: 'maintenance', label: 'Maintenance', module: 'operations', description: 'Maintenance mode toggle', sortOrder: 16 },
];

async function seedFlags() {
  console.log('Seeding feature flags...');
  const now = new Date();

  for (const flag of DEFAULT_FLAGS) {
    db.insert(featureFlags)
      .values({
        id: randomUUID(),
        key: flag.key,
        label: flag.label,
        description: flag.description,
        module: flag.module,
        isEnabled: true,
        sortOrder: flag.sortOrder,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .run();
    console.log(`  Created flag: ${flag.label}`);
  }

  console.log('Feature flag seeding complete!');
}

seedFlags();
