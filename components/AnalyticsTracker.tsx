'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getSessionInfo() {
  let id = window.sessionStorage.getItem('mb_session_id');
  let isNew = window.sessionStorage.getItem('mb_is_new_visitor');

  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem('mb_session_id', id);

    const seenBefore = window.localStorage.getItem('mb_returning_visitor');
    isNew = seenBefore ? 'false' : 'true';
    window.sessionStorage.setItem('mb_is_new_visitor', isNew);
    window.localStorage.setItem('mb_returning_visitor', '1');
  }

  return { sessionId: id, isNewVisitor: isNew === 'true' };
}

export function trackEvent(eventType: 'pageview' | 'conversion', path?: string) {
  try {
    const { sessionId, isNewVisitor } = getSessionInfo();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        path: path ?? window.location.pathname,
        referrer: document.referrer || null,
        eventType,
        isNewVisitor,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics should never break the app
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    trackEvent('pageview', pathname ?? '/');
  }, [pathname]);

  return null;
}
