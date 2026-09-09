'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminUsers.module.css';
import sharedStyles from './UsersShared.module.css';

interface RoleInfo { id: string; name: string }
interface UserRow { id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; roles: RoleInfo[] }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [allRoles, setAllRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: '', email: '', password: '', roleIds: new Set<string>() });
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, rRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/operation-runs/?moduleKey=users&executionMode=manual&limit=20'),
      ]);
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setUsers(usersData.users || []);
      setAllRoles(rolesData.roles || []);
      setRuns(rData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return;
    await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, password: form.password, roleIds: Array.from(form.roleIds) }) });
    setForm({ name: '', email: '', password: '', roleIds: new Set() });
    setShowCreate(false);
    fetchData();
  };

  const handleEdit = (user: UserRow) => { setEditingUser(user); setEditRoleIds(new Set(user.roles.map((r) => r.id))); };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    await fetch(`/api/admin/users/${editingUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roleIds: Array.from(editRoleIds) }) });
    setEditingUser(null);
    fetchData();
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleActivate = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: true }) });
    fetchData();
  };

  const toggleFormRole = (roleId: string) => setForm((prev) => { const next = new Set(prev.roleIds); if (next.has(roleId)) next.delete(roleId); else next.add(roleId); return { ...prev, roleIds: next }; });
  const toggleEditRole = (roleId: string) => setEditRoleIds((prev) => { const next = new Set(prev); if (next.has(roleId)) next.delete(roleId); else next.add(roleId); return next; });

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage admin user accounts and their RBAC role assignments — real create, role-edit, and soft-deactivate control.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Every active user should have 1+ RBAC role assigned</li><li>Run Pipeline or Agentic security checks to catch roleless or dead-end accounts</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {!showCreate && !editingUser && <div style={{ marginBottom: 'var(--space-6)' }}><Button size="sm" onClick={() => setShowCreate(true)}>Create User</Button></div>}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Create New User</div>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Email</label><input className={styles.formInput} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Password</label><input className={styles.formInput} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Roles</label>
                <div className={styles.roleCheckboxes}>{allRoles.map((role) => (<label key={role.id} className={styles.roleCheckbox}><input type="checkbox" checked={form.roleIds.has(role.id)} onChange={() => toggleFormRole(role.id)} />{role.name}</label>))}</div>
              </div>
            </div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button><Button size="sm" onClick={handleCreate}>Create</Button></div>
          </div>
        )}

        {editingUser && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Edit Roles: {editingUser.name}</div>
            <div className={styles.roleCheckboxes}>{allRoles.map((role) => (<label key={role.id} className={styles.roleCheckbox}><input type="checkbox" checked={editRoleIds.has(role.id)} onChange={() => toggleEditRole(role.id)} />{role.name}</label>))}</div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button><Button size="sm" onClick={handleSaveEdit}>Save Roles</Button></div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : users.length === 0 ? <div className={styles.empty}>No users found.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className={styles.nameCell}>{user.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{user.email}</td>
                    <td>{user.roles.length > 0 ? user.roles.map((r) => <span key={r.id} className={styles.roleBadge}>{r.name}</span>) : <span style={{ color: 'var(--color-text-muted)' }}>No roles</span>}</td>
                    <td><span className={user.isActive ? styles.statusActive : styles.statusInactive}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(user)}>Roles</button>
                        {user.isActive ? <button className={styles.deactivateBtn} onClick={() => handleDeactivate(user.id)}>Deactivate</button> : <button className={styles.actionBtn} onClick={() => handleActivate(user.id)}>Activate</button>}
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
