import { randomUUID } from 'crypto';
import { db, schema } from './index';
import { eq } from 'drizzle-orm';

const { roles, permissions, rolePermissions, userRoles, users } = schema;

const RESOURCES = [
  'blog', 'leads', 'survey', 'campaigns', 'contacts', 'settings',
  'users', 'roles', 'media', 'banners', 'templates', 'broadcasts',
  'jobs', 'features', 'analytics', 'health', 'videos', 'services',
  'industries', 'appointments',
  // Added: resources for admin API route segments that previously had no
  // RBAC coverage at all (withPermission was defined but never called).
  'analysis', 'chat', 'content', 'content_overrides', 'dashboard',
  'email_compose', 'event_routes', 'integrations', 'links', 'maintenance',
  'rag', 'runs', 'smtp_configs', 'workflows', 'activity', 'webhooks', 'assets',
  // Added beyond the originally requested list: needed for correctness.
  // 'lists' was already referenced by the Marketing role's resource array
  // below (a pre-existing latent bug -- those grants silently no-op without
  // a matching permission row) and 'email_profiles' is a distinct route
  // segment (SMTP sender identities) from 'smtp_configs' (SMTP server
  // configs) so it needs its own resource rather than being folded in.
  'lists', 'email_profiles',
  // Admin-only market-research intelligence -- never exposed on any public
  // route. Restricted deliberately: this holds competitive research, not
  // content meant for customers.
  'competitor_analysis',
  // The 8 new module concepts (module_registry built_status='not_built'
  // as of 2026-09-09), scaffolded with real local CRUD + the Operational
  // Portal 10-tab standard; third-party integrations (Adobe/CapCut/HeyGen,
  // YouTube Data API, ad-platform APIs, voice-cloning APIs) disclosed as
  // not-yet-wired per module rather than faked.
  'ads_management', 'video_editing', 'voice_ai', 'market_research',
  'branding', 'influencer_video', 'reels_management', 'youtube',
  // Customer Occasion Messaging (birthday/anniversary/festival/custom),
  // added 2026-09-14 -- admin-level, so scoped like broadcasts/
  // competitor_analysis rather than exposed to a lower-privilege role.
  'occasions',
  // Self-generated gap-analysis backlog (docs/audits/2026-09-14_self-generated-gap-analysis-and-backlog.md),
  // added 2026-09-14 -- admin-level throughout, same reasoning as
  // 'occasions' above. One resource per genuinely new admin-facing
  // capability; items that extend an existing surface (competitor
  // numeric scoring, lead-scoring next-best-action, video script
  // generation) reuse their existing resource instead of adding one.
  'evidence', 'kpi_engine', 'opportunities', 'growth_readiness',
  'business_diagnostic', 'geo_visibility', 'cro_friction', 'channel_attribution',
  'presales_brief', 'research_router', 'demo_recommendation', 'sales_copilot',
  'growth_scenario', 'vertical_pack', 'case_studies', 'golden_paths',
  'partner_ecosystem', 'positioning', 'pmf', 'pr_media', 'abm',
];

const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];

const ROLE_DEFS: { name: string; description: string; resources: string[] | '*'; actions: string[] | '*' }[] = [
  { name: 'SuperAdmin', description: 'Full system access', resources: '*', actions: '*' },
  { name: 'Admin', description: 'Full access, including role management', resources: '*', actions: ['read', 'create', 'update', 'delete', 'manage'] },
  { name: 'Marketing', description: 'Marketing and campaign management', resources: ['campaigns', 'contacts', 'templates', 'broadcasts', 'analytics', 'leads', 'lists', 'media'], actions: '*' },
  { name: 'HR', description: 'HR and recruitment', resources: ['blog', 'leads', 'analytics'], actions: ['read', 'create', 'update'] },
  { name: 'Support', description: 'Customer support', resources: ['leads', 'contacts', 'appointments', 'survey', 'analytics'], actions: ['read', 'update'] },
  { name: 'Editor', description: 'Content management', resources: ['blog', 'videos', 'services', 'industries', 'media'], actions: ['read', 'create', 'update', 'delete'] },
  { name: 'Viewer', description: 'Read-only access', resources: '*', actions: ['read'] },
];

function seed() {
  console.log('Seeding RBAC...');

  // Create permissions
  const permMap = new Map<string, string>();
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const existing = db.select().from(permissions)
        .where(eq(permissions.resource, resource))
        .all()
        .find(p => p.action === action);

      if (existing) {
        permMap.set(`${resource}:${action}`, existing.id);
      } else {
        const id = randomUUID();
        db.insert(permissions).values({
          id,
          resource,
          action,
          description: `${action} ${resource}`,
        }).run();
        permMap.set(`${resource}:${action}`, id);
      }
    }
  }
  console.log(`  Created ${permMap.size} permissions`);

  // Create roles and assign permissions
  for (const def of ROLE_DEFS) {
    let role = db.select().from(roles).where(eq(roles.name, def.name)).get();

    if (!role) {
      role = db.insert(roles).values({
        id: randomUUID(),
        name: def.name,
        description: def.description,
        isSystem: true,
        createdAt: new Date(),
      }).returning().get();
      console.log(`  Created role: ${def.name}`);
    } else {
      console.log(`  Role exists: ${def.name}`);
    }

    // Clear existing permissions for this role
    db.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id)).run();

    // Assign permissions
    const targetResources = def.resources === '*' ? RESOURCES : def.resources;
    const targetActions = def.actions === '*' ? ACTIONS : def.actions;

    let assignedCount = 0;
    for (const resource of targetResources) {
      for (const action of targetActions) {
        const permId = permMap.get(`${resource}:${action}`);
        if (permId) {
          db.insert(rolePermissions).values({ roleId: role.id, permissionId: permId }).run();
          assignedCount++;
        }
      }
    }
    console.log(`    Assigned ${assignedCount} permissions`);
  }

  // Assign SuperAdmin to existing admin user
  const adminUser = db.select().from(users).where(eq(users.email, 'admin@talentshill.com')).get();
  const superAdminRole = db.select().from(roles).where(eq(roles.name, 'SuperAdmin')).get();

  if (adminUser && superAdminRole) {
    db.delete(userRoles).where(eq(userRoles.userId, adminUser.id)).run();
    db.insert(userRoles).values({
      userId: adminUser.id,
      roleId: superAdminRole.id,
      assignedAt: new Date(),
    }).run();
    console.log(`  Assigned SuperAdmin role to ${adminUser.email}`);
  }

  console.log('RBAC seeding complete!');
}

seed();
