'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminEmailProfiles.module.css';

interface Profile { id: string; name: string; fromName: string; fromEmail: string; replyTo: string | null; signature: string | null; isDefault: boolean; isActive: boolean; }
interface SmtpConfig { id: string; name: string; host: string; port: number; secure: boolean; username: string; password: string; isActive: boolean; }
interface EventRoute { id: string; eventType: string; profileId: string; description: string | null; isActive: boolean; }

const EVENT_TYPES = ['contact_admin', 'contact_user', 'survey_user', 'booking_admin', 'booking_user', 'campaign', 'broadcast', 'newsletter'];

type TabType = 'profiles' | 'smtp' | 'routes';

export default function AdminEmailProfilesPage() {
  const [tab, setTab] = useState<TabType>('profiles');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
  const [eventRoutes, setEventRoutes] = useState<EventRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showCreateSmtp, setShowCreateSmtp] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', fromName: '', fromEmail: '', replyTo: '', signature: '', isDefault: false });
  const [smtpForm, setSmtpForm] = useState({ name: '', host: '', port: '587', secure: false, username: '', password: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, rRes] = await Promise.all([
        fetch('/api/admin/email-profiles'),
        fetch('/api/admin/smtp-configs'),
        fetch('/api/admin/event-routes'),
      ]);
      const pData = await pRes.json();
      const sData = await sRes.json();
      const rData = await rRes.json();
      setProfiles(pData.profiles || []);
      setSmtpConfigs(sData.configs || []);
      setEventRoutes(rData.routes || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateProfile = async () => {
    if (!profileForm.name || !profileForm.fromName || !profileForm.fromEmail) return;
    await fetch('/api/admin/email-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm),
    });
    setProfileForm({ name: '', fromName: '', fromEmail: '', replyTo: '', signature: '', isDefault: false });
    setShowCreateProfile(false);
    fetchAll();
  };

  const handleCreateSmtp = async () => {
    if (!smtpForm.name || !smtpForm.host || !smtpForm.username || !smtpForm.password) return;
    await fetch('/api/admin/smtp-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...smtpForm, port: parseInt(smtpForm.port, 10) }),
    });
    setSmtpForm({ name: '', host: '', port: '587', secure: false, username: '', password: '' });
    setShowCreateSmtp(false);
    fetchAll();
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Delete this profile?')) return;
    await fetch(`/api/admin/email-profiles/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleDeleteSmtp = async (id: string) => {
    if (!confirm('Delete this SMTP config?')) return;
    await fetch(`/api/admin/smtp-configs/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleAssignSmtp = async (profileId: string, smtpConfigId: string) => {
    await fetch(`/api/admin/email-profiles/${profileId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smtpConfigId }),
    });
    fetchAll();
  };

  const handleRouteChange = async (eventType: string, profileId: string) => {
    await fetch('/api/admin/event-routes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routes: [{ eventType, profileId }] }),
    });
    fetchAll();
  };

  const handleTestSmtp = async (config: SmtpConfig) => {
    const res = await fetch('/api/admin/smtp-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test', host: config.host, port: config.port, secure: config.secure, username: config.username, password: config.password }),
    });
    const data = await res.json();
    alert(data.success ? 'Connection successful!' : `Connection failed: ${data.message}`);
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Settings" title="Email Profiles" subtitle="Manage email sending profiles, SMTP configs, and event routing." />

      <div className={styles.tabs}>
        <button className={cn(styles.tab, tab === 'profiles' && styles.tabActive)} onClick={() => setTab('profiles')}>Profiles</button>
        <button className={cn(styles.tab, tab === 'smtp' && styles.tabActive)} onClick={() => setTab('smtp')}>SMTP Configs</button>
        <button className={cn(styles.tab, tab === 'routes' && styles.tabActive)} onClick={() => setTab('routes')}>Event Routing</button>
      </div>

      {/* Profiles Tab */}
      {tab === 'profiles' && (
        <>
          {!showCreateProfile && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <Button size="sm" onClick={() => setShowCreateProfile(true)}>Create Profile</Button>
            </div>
          )}

          {showCreateProfile && (
            <div className={styles.formCard}>
              <div className={styles.formTitle}>Create Email Profile</div>
              <div className={styles.formGrid}>
                <div><label className={styles.formLabel}>Profile Name</label><input className={styles.formInput} value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>From Name</label><input className={styles.formInput} value={profileForm.fromName} onChange={e => setProfileForm(p => ({ ...p, fromName: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>From Email</label><input className={styles.formInput} type="email" value={profileForm.fromEmail} onChange={e => setProfileForm(p => ({ ...p, fromEmail: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>Reply-To</label><input className={styles.formInput} value={profileForm.replyTo} onChange={e => setProfileForm(p => ({ ...p, replyTo: e.target.value }))} /></div>
                <div style={{ gridColumn: '1 / -1' }}><label className={styles.formLabel}>Signature (HTML)</label><textarea className={styles.formTextarea} value={profileForm.signature} onChange={e => setProfileForm(p => ({ ...p, signature: e.target.value }))} /></div>
                <div><label className={styles.formCheckLabel}><input type="checkbox" checked={profileForm.isDefault} onChange={e => setProfileForm(p => ({ ...p, isDefault: e.target.checked }))} /> Set as default profile</label></div>
              </div>
              <div className={styles.formActions}>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateProfile(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreateProfile}>Create</Button>
              </div>
            </div>
          )}

          <div className={styles.tableWrap}>
            {loading ? <div className={styles.empty}>Loading...</div> : profiles.length === 0 ? <div className={styles.empty}>No profiles.</div> : (
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>From</th><th>Reply-To</th><th>SMTP</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {profiles.map(p => (
                    <tr key={p.id}>
                      <td>{p.name}{p.isDefault && <span className={styles.defaultBadge}>Default</span>}</td>
                      <td>{p.fromName} &lt;{p.fromEmail}&gt;</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{p.replyTo || '—'}</td>
                      <td>
                        <select className={styles.formSelect} style={{ width: 'auto', minWidth: '120px' }} onChange={e => handleAssignSmtp(p.id, e.target.value)} defaultValue="">
                          <option value="">Assign SMTP</option>
                          {smtpConfigs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </td>
                      <td><span className={p.isActive ? styles.activeBadge : styles.inactiveBadge}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><div className={styles.actions}><button className={styles.deleteBtn} onClick={() => handleDeleteProfile(p.id)}>Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* SMTP Tab */}
      {tab === 'smtp' && (
        <>
          {!showCreateSmtp && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <Button size="sm" onClick={() => setShowCreateSmtp(true)}>Add SMTP Config</Button>
            </div>
          )}

          {showCreateSmtp && (
            <div className={styles.formCard}>
              <div className={styles.formTitle}>Add SMTP Configuration</div>
              <div className={styles.formGrid}>
                <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={smtpForm.name} onChange={e => setSmtpForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>Host</label><input className={styles.formInput} value={smtpForm.host} onChange={e => setSmtpForm(p => ({ ...p, host: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>Port</label><input className={styles.formInput} type="number" value={smtpForm.port} onChange={e => setSmtpForm(p => ({ ...p, port: e.target.value }))} /></div>
                <div><label className={styles.formCheckLabel}><input type="checkbox" checked={smtpForm.secure} onChange={e => setSmtpForm(p => ({ ...p, secure: e.target.checked }))} /> Use SSL/TLS</label></div>
                <div><label className={styles.formLabel}>Username</label><input className={styles.formInput} value={smtpForm.username} onChange={e => setSmtpForm(p => ({ ...p, username: e.target.value }))} /></div>
                <div><label className={styles.formLabel}>Password</label><input className={styles.formInput} type="password" value={smtpForm.password} onChange={e => setSmtpForm(p => ({ ...p, password: e.target.value }))} /></div>
              </div>
              <div className={styles.formActions}>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateSmtp(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreateSmtp}>Create</Button>
              </div>
            </div>
          )}

          <div className={styles.tableWrap}>
            {loading ? <div className={styles.empty}>Loading...</div> : smtpConfigs.length === 0 ? <div className={styles.empty}>No SMTP configs.</div> : (
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>Host</th><th>Port</th><th>Username</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {smtpConfigs.map(s => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.host}</td>
                      <td>{s.port}{s.secure ? ' (SSL)' : ''}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{s.username}</td>
                      <td><span className={s.isActive ? styles.activeBadge : styles.inactiveBadge}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => handleTestSmtp(s)}>Test</button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteSmtp(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Event Routes Tab */}
      {tab === 'routes' && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Event Routing</div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Map email event types to sending profiles. When an email event fires, it will use the assigned profile.
          </p>
          <div className={styles.routeGrid}>
            {EVENT_TYPES.map(evt => {
              const currentRoute = eventRoutes.find(r => r.eventType === evt);
              return (
                <div key={evt} className={styles.routeItem}>
                  <div className={styles.routeEventName}>{evt.replace(/_/g, ' ')}</div>
                  <select
                    className={styles.formSelect}
                    value={currentRoute?.profileId || ''}
                    onChange={e => handleRouteChange(evt, e.target.value)}
                  >
                    <option value="">No profile assigned</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
