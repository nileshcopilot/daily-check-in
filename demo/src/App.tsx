import { useState } from 'react';
import { DailyCheckinPopup } from 'daily-checkin-popup';

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

  // Mock lastShownDate from parent (e.g. yesterday's date to test "first visit today",
  // or today's date "YYYY-MM-DD" to test "second visit today").
  const mockLastShownDate = '2026-06-17';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 40, maxWidth: 600, margin: '0 auto' }}>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setOpen(true)}>Open popup</button>
        <button onClick={resetAndReload}>Reset check-in &amp; reload</button>
      </div>

      <DailyCheckinPopup
        open={open || undefined}
        onOpenChange={setOpen}
        storageKey={STORAGE_KEY}
        lastShownDate={mockLastShownDate}
        locale="hi"
        theme={{ primaryColor: '#0070f3', secondaryColor: '#fff', accentColor: '#0070f3', dark: false }}
        baseUrl="https://corep.vinfotech.org"
        sessionKey="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjb3JlcC52aW5mb3RlY2gub3JnIiwiaWF0IjoxNzgyMjA2MDY3LCJleHAiOjE3ODI4MTA4NjcsInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2lkIjoiMjY4IiwidXNlcl91bmlxdWVfaWQiOiIwMzQ0MTNmM2Q4IiwidXNlcl9uYW1lIjoiaWI1IiwiY3VzdG9tZXJfaWQiOm51bGwsInBob25lX25vIjoiNjc5ODk4ODY2IiwiZW1haWwiOiJpYjVAbWFpbGluYXRvci5jb20iLCJyZWZlcnJhbF9jb2RlIjoiODA3MEQ0IiwiYnNfc3RhdHVzIjpudWxsLCJyb2xlIjoxfQ.T1txSAtFUg_w8GnHJqaboeziWawYiLvAGQdlXf8t0qE"
        // onCheckIn={({ streak, date }) =>
        //   setLog((l) => [...l, `Checked in on ${date} — streak: ${streak}`])
        // }
        onApiResponse={(type, data) => {
          console.log(`API Response (${type}):`, data);
          setLog((l) => [...l, `[${type.toUpperCase()}] ${JSON.stringify(data).slice(0, 80)}...`]);
        }}
      />

      {log.length > 0 && (
        <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8 }}>
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}
