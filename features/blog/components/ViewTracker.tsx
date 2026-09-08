'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
  postId: string;
}

function getSessionId(): string {
  const key = 'blog_session_id';
  let sid = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, sid);
    }
  }
  return sid;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    const sessionId = getSessionId();
    fetch('/api/blog/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, sessionId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
