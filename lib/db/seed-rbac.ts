import { randomUUID } from 'crypto';
import { db, schema } from './index';
import { eq } from 'drizzle-orm';

const { roles, permissions, rolePermissions, userRoles, users } = schema;

const RESOURCES = [
  'blog', 'leads', 'survey', 'campaigns', 'contacts', 'settings',
  'users', 'roles', 'media', 'banners', 'templates', 'broadcasts',
  'jobs', 'features', 'analytics', 'health', 'videos', 'services',
  'industries', 'appointments',
];

const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];

const ROLE_DEFS: { name: string; description: string; resources: string[] | '*'; actions: string[] | '*' }[] = [
  { name: 'SuperAdmin', description: 'Full system access', resources: '*', actions: '*' },
  { name: 'Admin', description: 'Full access except role management', resources: '*', actions: ['read', 'create', 'update', 'delete'] },
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
