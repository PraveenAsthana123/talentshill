import { randomUUID } from 'crypto';
import { eq, desc, and, count, sql, inArray } from 'drizzle-orm';
import { db, schema } from './index';

const { roles, permissions, rolePermissions, userRoles, groups, groupMembers, users } = schema;

// ── Roles ──

export function getAllRoles() {
  const rows = db.select().from(roles).orderBy(desc(roles.createdAt)).all();
  return rows.map((role) => {
    const permCount = db.select({ cnt: count() }).from(rolePermissions)
      .where(eq(rolePermissions.roleId, role.id)).get()?.cnt || 0;
    return { ...role, permissionCount: permCount };
  });
}

export function getRoleById(id: string) {
  const role = db.select().from(roles).where(eq(roles.id, id)).get();
  if (!role) return null;

  const perms = db.select({ id: permissions.id, resource: permissions.resource, action: permissions.action, description: permissions.description })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, id))
    .all();

  return { ...role, permissions: perms };
}

export function createRole(data: { name: string; description?: string; isSystem?: boolean }) {
  const id = randomUUID();
  return db.insert(roles).values({
    id,
    name: data.name,
    description: data.description || null,
    isSystem: data.isSystem || false,
    createdAt: new Date(),
  }).returning().get();
}

export function updateRole(id: string, data: { name?: string; description?: string }) {
  const existing = db.select().from(roles).where(eq(roles.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;

  if (Object.keys(updates).length === 0) return existing;
  return db.update(roles).set(updates).where(eq(roles.id, id)).returning().get();
}

export function deleteRole(id: string): boolean {
  const role = db.select().from(roles).where(eq(roles.id, id)).get();
  if (!role || role.isSystem) return false;

  const result = db.delete(roles).where(eq(roles.id, id)).run();
  return result.changes > 0;
}

// ── Permissions ──

export function getAllPermissions() {
  return db.select().from(permissions).orderBy(permissions.resource, permissions.action).all();
}

export function createPermission(data: { resource: string; action: string; description?: string }) {
  const id = randomUUID();
  return db.insert(permissions).values({
    id,
    resource: data.resource,
    action: data.action,
    description: data.description || null,
  }).returning().get();
}

// ── Role-Permission Mapping ──

export function getRolePermissions(roleId: string) {
  return db.select({ id: permissions.id, resource: permissions.resource, action: permissions.action, description: permissions.description })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
    .all();
}

export function setRolePermissions(roleId: string, permissionIds: string[]) {
  db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId)).run();

  for (const permissionId of permissionIds) {
    db.insert(rolePermissions).values({ roleId, permissionId }).run();
  }
}

// ── User-Role Mapping ──

export function getUserRoles(userId: string) {
  return db.select({
    id: roles.id,
    name: roles.name,
    description: roles.description,
    isSystem: roles.isSystem,
    createdAt: roles.createdAt,
  })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .all();
}

export function setUserRoles(userId: string, roleIds: string[]) {
  db.delete(userRoles).where(eq(userRoles.userId, userId)).run();
  const now = new Date();

  for (const roleId of roleIds) {
    db.insert(userRoles).values({ userId, roleId, assignedAt: now }).run();
  }
}

// ── Permission Check ──

export function getUserPermissions(userId: string) {
  const rows = db.select({
    resource: permissions.resource,
    action: permissions.action,
  })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId))
    .all();

  // Deduplicate
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = `${r.resource}:${r.action}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function hasPermission(userId: string, resource: string, action: string): boolean {
  const row = db.select({ cnt: count() })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(
      eq(userRoles.userId, userId),
      eq(permissions.resource, resource),
      eq(permissions.action, action),
    ))
    .get();

  return (row?.cnt || 0) > 0;
}

// ── Groups ──

export function getAllGroups() {
  const rows = db.select().from(groups).orderBy(desc(groups.createdAt)).all();
  return rows.map((group) => {
    const memberCount = db.select({ cnt: count() }).from(groupMembers)
      .where(eq(groupMembers.groupId, group.id)).get()?.cnt || 0;
    return { ...group, memberCount };
  });
}

export function createGroup(data: { name: string; description?: string }) {
  const id = randomUUID();
  return db.insert(groups).values({
    id,
    name: data.name,
    description: data.description || null,
    createdAt: new Date(),
  }).returning().get();
}

export function updateGroup(id: string, data: { name?: string; description?: string }) {
  const existing = db.select().from(groups).where(eq(groups.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;

  if (Object.keys(updates).length === 0) return existing;
  return db.update(groups).set(updates).where(eq(groups.id, id)).returning().get();
}

export function deleteGroup(id: string): boolean {
  const result = db.delete(groups).where(eq(groups.id, id)).run();
  return result.changes > 0;
}

export function getGroupMembers(groupId: string) {
  return db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
  })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .all();
}

export function setGroupMembers(groupId: string, userIds: string[]) {
  db.delete(groupMembers).where(eq(groupMembers.groupId, groupId)).run();
  const now = new Date();

  for (const userId of userIds) {
    db.insert(groupMembers).values({ groupId, userId, addedAt: now }).run();
  }
}
