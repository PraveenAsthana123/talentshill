import styles from './Maintenance.module.css';

export default function MaintenancePage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>&#9888;</div>
        <h1 className={styles.title}>Under Maintenance</h1>
        <p className={styles.message}>
          We are currently performing scheduled maintenance to improve our services.
          Please check back shortly.
        </p>
        <p className={styles.hint}>We apologize for any inconvenience.</p>
      </div>
    </div>
  );
}
