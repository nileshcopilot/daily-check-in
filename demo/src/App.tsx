import { useState } from 'react';
import { DailyCheckinPopup } from '@nileshp.vinfotech/daily-checkin-popup';

const STORAGE_KEY = 'demo-checkin';

export default function App() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  if (typeof window !== 'undefined' && !(window.fetch as any).__spied) {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      console.log('SPY_FETCH:', input, 'HEADERS:', JSON.stringify(init?.headers));
      return originalFetch(input, init);
    };
    (window.fetch as any).__spied = true;
  }

  const resetAndReload = () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 40, maxWidth: 600, margin: '0 auto' }}>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setOpen(true)}>Open popup</button>
        <button onClick={resetAndReload}>Reset check-in &amp; reload</button>
      </div>

      <DailyCheckinPopup
        open={open || undefined}
        onOpenChange={setOpen}
        storageKey={STORAGE_KEY}
        locale="hi"
        theme={{ primaryColor: '#0070f3', secondaryColor: '#fff', accentColor: '#0070f3' }}
        baseUrl="https://corep.vinfotech.org"
        sessionKey="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjb3JlcC52aW5mb3RlY2gub3JnIiwiaWF0IjoxNzgxNTA2Nzg4LCJleHAiOjE3ODIxMTE1ODgsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2lkIjoiMTMxIiwidXNlcl91bmlxdWVfaWQiOiJkYjc5ZGE2NDM1IiwidXNlcl9uYW1lIjoibGI1IiwiY3VzdG9tZXJfaWQiOm51bGwsInBob25lX25vIjoiODcwOTc4MjM0MCIsImVtYWlsIjoibGI1QG1haWxpbmF0b3IuY29tIiwicmVmZXJyYWxfY29kZSI6IkNDMzdCMiIsImJzX3N0YXR1cyI6bnVsbCwicm9sZSI6MX0.FTxuc-1yrKNLill_cGwa14TMN3vc4cDrFO1UpQBBuM4"
        badgeImageUrl="https://corep-new.s3.ap-south-1.amazonaws.com/assets/img/ic-coin.webp"
        onCheckIn={({ streak, date }) =>
          setLog((l) => [...l, `Checked in on ${date} — streak: ${streak}`])
        }
      />

      {log.length > 0 && (
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}
