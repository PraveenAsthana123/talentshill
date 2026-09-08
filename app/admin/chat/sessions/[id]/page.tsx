'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminChatSession.module.css';

export default function ChatSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/admin/chat/sessions/${id}`).then(r => r.json()).then(setData);
  }, [id]);

  if (!data) return <div className={styles.loading}>Loading...</div>;
  const { session, messages, requests } = data;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat Session</h1>

      <div className={styles.infoCard}>
        <div className={styles.infoRow}><span className={styles.infoLabel}>Visitor</span><span>{session.visitorEmail || 'Anonymous'}</span></div>
        <div className={styles.infoRow}><span className={styles.infoLabel}>Status</span><span className={`${styles.badge} ${session.status === 'active' ? styles.badgeActive : ''}`}>{session.status}</span></div>
        <div className={styles.infoRow}><span className={styles.infoLabel}>Started</span><span>{new Date(session.startedAt).toLocaleString()}</span></div>
        {session.visitorName && <div className={styles.infoRow}><span className={styles.infoLabel}>Name</span><span>{session.visitorName}</span></div>}
        {session.emailCapturedAt && <div className={styles.infoRow}><span className={styles.infoLabel}>Email Captured</span><span>{new Date(session.emailCapturedAt).toLocaleString()}</span></div>}
      </div>

      <h2 className={styles.sectionTitle}>Conversation</h2>
      <div className={styles.conversation}>
        {messages.map((msg: any) => (
          <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
            <div className={styles.messageHeader}>
              <span className={styles.messageRole}>{msg.role}</span>
              <span className={styles.messageTime}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className={styles.messageContent}>{msg.content}</div>
            {msg.evals && msg.evals.length > 0 && (
              <div className={styles.evalsRow}>
                {msg.evals.map((ev: any) => (
                  <span key={ev.id} className={`${styles.evalBadge} ${ev.passed ? styles.evalPass : styles.evalFail}`}>
                    {ev.evalType}: {ev.passed ? 'Pass' : 'Fail'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && <p className={styles.empty}>No messages</p>}
      </div>

      {requests && requests.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Related Requests</h2>
          <div className={styles.requestsList}>
            {requests.map((r: any) => (
              <div key={r.id} className={styles.requestItem}>
                <span>{r.subject || 'No subject'}</span>
                <span className={styles.badge}>{r.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
