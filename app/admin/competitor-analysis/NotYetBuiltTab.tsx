import styles from './AdminCompetitorAnalysis.module.css';

// Honest placeholder for tabs required by the Operational Portal Page &
// Tab Standard that are not yet built for this module. Never fabricate
// content here -- an empty, clearly-labeled tab is correct; a
// plausible-looking fake one is not.
export default function NotYetBuiltTab({ tabName }: { tabName: string }) {
  return (
    <div className={styles.notYetBuilt}>
      <p><strong>{tabName}</strong> is not yet built for this module.</p>
      <p>Per the Operational Portal Page &amp; Tab Standard, this tab is required but honestly
        marked pending rather than filled with placeholder content.</p>
    </div>
  );
}
