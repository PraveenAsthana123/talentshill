/**
 * Seed script for admin user + default site settings.
 * Run: npx tsx lib/db/seed-admin.ts
 */
import { randomUUID } from 'crypto';
import { hashSync } from 'bcryptjs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const DB_PATH = join(process.cwd(), 'data', 'talentshill.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, { schema });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@talentshill.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

function seedAdmin() {
  console.log('--- Seeding Admin User ---');

  const existing = db.select().from(schema.users).where(eq(schema.users.email, ADMIN_EMAIL)).get();

  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
  } else {
    const passwordHash = hashSync(ADMIN_PASSWORD, 12);
    const now = new Date();

    db.insert(schema.users).values({
      id: randomUUID(),
      email: ADMIN_EMAIL,
      passwordHash,
      name: ADMIN_NAME,
      role: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).run();

    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  }
}

function seedSettings() {
  console.log('\n--- Seeding Default Settings ---');

  const defaults: Record<string, unknown> = {
    site_name: 'Talents Hill Inc',
    site_description: 'Intelligent Analytics. Intelligently Delivered.',
    contact_email: 'info@talentshill.com',
    social_linkedin: '#',
    social_facebook: '#',
    social_whatsapp: '+1234567890',
    feature_blog: true,
    feature_survey: true,
    feature_chatbot: true,
    feature_booking: true,
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = db.select().from(schema.siteSettings).where(eq(schema.siteSettings.key, key)).get();
    if (!existing) {
      db.insert(schema.siteSettings).values({
        key,
        value: JSON.stringify(value),
        updatedAt: new Date(),
      }).run();
      console.log(`  Setting: ${key} = ${JSON.stringify(value)}`);
    } else {
      console.log(`  Setting already exists: ${key}`);
    }
  }
}

function seedContentFromConstants() {
  console.log('\n--- Seeding Content from Constants ---');

  // Seed Industries
  const INDUSTRIES = [
    { id: 'banking', name: 'Banking & Finance', icon: '🏦', description: 'Risk analytics, fraud detection, credit scoring, and regulatory compliance powered by AI.' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Patient analytics, clinical decision support, drug discovery, and medical imaging AI.' },
    { id: 'real-estate', name: 'Real Estate', icon: '🏢', description: 'Property valuation, market prediction, smart building IoT, and investment analytics.' },
    { id: 'agritech', name: 'AgriTech', icon: '🌾', description: 'Precision farming, crop monitoring, yield prediction, and supply chain optimization.' },
    { id: 'retail', name: 'Retail & E-commerce', icon: '🛒', description: 'Customer segmentation, demand forecasting, recommendation engines, and pricing optimization.' },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', description: 'Predictive maintenance, quality control, robotics automation, and digital twin technology.' },
  ];

  for (let i = 0; i < INDUSTRIES.length; i++) {
    const ind = INDUSTRIES[i];
    const existing = db.select().from(schema.industries).where(eq(schema.industries.id, ind.id)).get();
    if (!existing) {
      const now = new Date();
      db.insert(schema.industries).values({
        id: ind.id,
        name: ind.name,
        slug: ind.id,
        icon: ind.icon,
        description: ind.description,
        sortOrder: i,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }).run();
      console.log(`  Industry: ${ind.name}`);
    }
  }

  // Seed Services
  const SERVICES = [
    { id: 'marketing-analytics', name: 'Marketing Analytics', category: 'Analytics', shortDesc: 'Attribution modeling, campaign optimization, CLV prediction, and marketing mix analysis.', useCases: ['Multi-touch attribution', 'Churn prediction', 'A/B test analysis'] },
    { id: 'customer-analytics', name: 'Customer Analytics', category: 'Analytics', shortDesc: 'Segmentation, lifetime value, sentiment analysis, and customer journey mapping.', useCases: ['360° customer view', 'Next-best-action', 'Retention modeling'] },
    { id: 'data-integration', name: 'Data Integration', category: 'Analytics', shortDesc: 'ETL pipelines, data warehousing, real-time streaming, and master data management.', useCases: ['Cloud migration', 'Data lake architecture', 'API integration'] },
    { id: 'genai', name: 'Generative AI', category: 'AI Solutions', shortDesc: 'Custom LLM fine-tuning, RAG pipelines, AI copilots, and conversational AI.', useCases: ['Enterprise chatbot', 'Document intelligence', 'Code generation'] },
    { id: 'robotics', name: 'Robotics & Automation', category: 'AI Solutions', shortDesc: 'Industrial robotics, RPA, autonomous systems, and computer vision.', useCases: ['Warehouse automation', 'Quality inspection', 'Autonomous navigation'] },
    { id: 'iot', name: 'IoT & Smart Systems', category: 'AI Solutions', shortDesc: 'Edge computing, sensor networks, digital twins, and predictive maintenance.', useCases: ['Smart buildings', 'Fleet management', 'Environmental monitoring'] },
    { id: 'quantum', name: 'Quantum Computing', category: 'AI Solutions', shortDesc: 'Quantum optimization, quantum ML, cryptography, and simulation.', useCases: ['Portfolio optimization', 'Drug discovery', 'Supply chain'] },
  ];

  for (let i = 0; i < SERVICES.length; i++) {
    const svc = SERVICES[i];
    const existing = db.select().from(schema.services).where(eq(schema.services.id, svc.id)).get();
    if (!existing) {
      const now = new Date();
      db.insert(schema.services).values({
        id: svc.id,
        name: svc.name,
        slug: svc.id,
        category: svc.category,
        shortDesc: svc.shortDesc,
        tags: JSON.stringify([]),
        useCases: JSON.stringify(svc.useCases),
        sortOrder: i,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }).run();
      console.log(`  Service: ${svc.name}`);
    }
  }

  // Seed Videos
  const VIDEOS = [
    { id: 'intro-ai', title: 'Introduction to Enterprise AI', summary: 'An overview of how Talents Hill delivers AI-powered analytics and automation solutions to enterprises.', tags: ['AI', 'Enterprise', 'Overview'], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12:30' },
    { id: 'genai-demo', title: 'GenAI RAG Pipeline Demo', summary: 'See how our Retrieval-Augmented Generation pipeline ingests enterprise documents and answers complex queries.', tags: ['GenAI', 'RAG', 'Demo'], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8:45' },
    { id: 'robotics-overview', title: 'Industrial Robotics & IoT', summary: 'Walkthrough of our robotics automation and IoT monitoring solutions for manufacturing and logistics.', tags: ['Robotics', 'IoT', 'Manufacturing'], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:20' },
  ];

  for (let i = 0; i < VIDEOS.length; i++) {
    const vid = VIDEOS[i];
    const existing = db.select().from(schema.videos).where(eq(schema.videos.id, vid.id)).get();
    if (!existing) {
      const now = new Date();
      db.insert(schema.videos).values({
        id: vid.id,
        title: vid.title,
        summary: vid.summary,
        videoUrl: vid.videoUrl,
        provider: 'youtube',
        tags: JSON.stringify(vid.tags),
        duration: vid.duration,
        sortOrder: i,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }).run();
      console.log(`  Video: ${vid.title}`);
    }
  }
}

// Run
seedAdmin();
seedSettings();
seedContentFromConstants();
sqlite.close();
console.log('\nDone!');
