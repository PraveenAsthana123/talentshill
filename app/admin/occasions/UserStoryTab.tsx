import styles from './OccasionsShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'the system to detect today\'s real birthdays, anniversaries, and location-relevant festivals among my contacts', so: 'I never have to manually track occasion dates across a growing contact list', status: 'Built — Pipeline tab, deterministic scan, verified live' },
  { role: 'Admin', want: 'a standard template library for each occasion type (and per-festival where relevant)', so: 'birthday/anniversary/festival messages stay consistent without retyping them each time', status: 'Built — Pipeline tab template management' },
  { role: 'Admin', want: 'to send a one-off custom message to a specific contact outside the standard templates', so: 'I can personally acknowledge a specific customer for a specific reason', status: 'Built — Manual tab' },
  { role: 'Admin', want: 'the festival calendar to respect a contact\'s real country so a Diwali message doesn\'t go to someone who doesn\'t celebrate it', so: 'occasion messages stay relevant and not spammy', status: 'Built — festival_calendar.country matching, verified live' },
  { role: 'Admin', want: 'every send honestly logged as "logged" rather than falsely claimed as delivered', so: 'I know this module records intent, not proof of actual transmission (no real gateway exists yet)', status: 'Built — disclosed in Governance' },
];

export default function UserStoryTab() {
  return (
    <div className={styles.subSection}>
      <h4>User stories</h4>
      {STORIES.map((s, i) => (
        <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
          <p><strong>As an</strong> {s.role}, <strong>I want</strong> {s.want}, <strong>so that</strong> {s.so}.</p>
          <p className={styles.empty}>{s.status}</p>
        </div>
      ))}
    </div>
  );
}
