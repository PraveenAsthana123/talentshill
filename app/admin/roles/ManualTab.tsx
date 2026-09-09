'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminRoles.module.css';
import sharedStyles from './RolesShared.module.css';

interface Permission { id: string; resource: string; action: string; description: string | null }
interface Role { id: string; name: string; description: string | null; isSystem: boolean; permissionCount?: number; createdAt: string; permissions?: Permission[] }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];

export default function ManualTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes, rRes] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/roles?permissions=true'),
        fetch('/api/admin/operation-runs/?moduleKey=roles&executionMode=manual&limit=20'),
      ]);
      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setRoles(rolesData.roles || []);
      setAllPerms(permsData.permissions || []);
      setRuns(rData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Derived from the real permissions the API actually returns, not a
  // hardcoded list -- found live 2026-09-09 that the previous hardcoded
  // RESOURCES array only covered 20 of the real 38 RBAC resources, so an
  // admin could never grant/revoke permissions on the other 18 through
  // this UI even though those permission rows exist in the DB.
  const resources = Array.from(new Set(allPerms.map((p) => p.resource))).sort();

  const handleEdit = async (roleId: string) => {
    const res = await fetch(`/api/admin/roles/${roleId}`);
    const data = await res.json();
    if (data.role) { setEditingRole(data.role); setEditPerms(new Set((data.role.permissions || []).map((p: Permission) => p.id))); }
  };

  const handleSavePerms = async () => {
    if (!editingRole) return;
    await fetch(`/api/admin/roles/${editingRole.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editingRole.name, description: editingRole.description, permissions: Array.from(editPerms) }) });
    setEditingRole(null);
    fetchData();
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await fetch('/api/admin/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, description: newDesc }) });
    setNewName(''); setNewDesc(''); setShowCreate(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const togglePerm = (permId: string) => setEditPerms((prev) => { const next = new Set(prev); if (next.has(permId)) next.delete(permId); else next.add(permId); return next; });
  const getPermId = (resource: string, action: string) => allPerms.find((p) => p.resource === resource && p.action === action)?.id;

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage RBAC roles and their permission sets — real create/edit/delete control over the portal&apos;s entire access-control system.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Every role should have 1+ permission assigned (a zero-permission role is a dead role)</li><li>Custom roles should be assigned to 1+ user or pruned</li><li>Run Pipeline or Agentic hygiene checks to catch stale roles</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.statsRow}>
          <div className={styles.statBadge}><span className={styles.statValue}>{roles.length}</span><span className={styles.statLabel}>Roles</span></div>
          <div className={styles.statBadge}><span className={styles.statValue}>{allPerms.length}</span><span className={styles.statLabel}>Permissions</span></div>
          <div className={styles.statBadge}><span className={styles.statValue}>{resources.length}</span><span className={styles.statLabel}>Resources</span></div>
        </div>

        {!showCreate && !editingRole && <div style={{ marginBottom: 'var(--space-6)' }}><Button size="sm" onClick={() => setShowCreate(true)}>Create Role</Button></div>}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Create New Role</div>
            <div className={styles.formGrid}>
              <div><label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Name</label><input style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', marginTop: 'var(--space-1)' }} value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
              <div><label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Description</label><input style={{ width: '100%', padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', marginTop: 'var(--space-1)' }} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} /></div>
            </div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button><Button size="sm" onClick={handleCreate}>Create</Button></div>
          </div>
        )}

        {editingRole && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Edit Permissions: {editingRole.name}</div>
            <div className={styles.permSection}>
              <div className={styles.permGrid}>
                <div className={styles.permHeader}><span>Resource</span>{ACTIONS.map((a) => <span key={a}>{a}</span>)}</div>
                {resources.map((resource) => (
                  <div key={resource} className={styles.permRow}>
                    <span className={styles.permResourceName}>{resource}</span>
                    {ACTIONS.map((action) => {
                      const permId = getPermId(resource, action);
                      return <div key={action} className={styles.permCheck}>{permId && <input type="checkbox" checked={editPerms.has(permId)} onChange={() => togglePerm(permId)} />}</div>;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}>Cancel</Button><Button size="sm" onClick={handleSavePerms}>Save Permissions</Button></div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : roles.length === 0 ? <div className={styles.empty}>No roles found.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Description</th><th>System</th><th>Permissions</th><th>Actions</th></tr></thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className={styles.nameCell}>{role.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{role.description || '—'}</td>
                    <td><span className={cn(styles.systemBadge, role.isSystem ? styles.systemYes : styles.systemNo)}>{role.isSystem ? 'System' : 'Custom'}</span></td>
                    <td><span className={styles.permCount}>{role.permissionCount || 0}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(role.id)}>Edit</button>
                        <button className={styles.deleteBtn} disabled={role.isSystem} onClick={() => handleDelete(role.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={sharedStyles.empty}>No manual operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.operationName}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
