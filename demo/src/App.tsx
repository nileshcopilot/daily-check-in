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
        locale="en"
        theme={{ primaryColor: '#0070f3', secondaryColor: '#fff', accentColor: '#0070f3' }}
        baseUrl="https://corep.vinfotech.org"
        sessionKey="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjb3JlcC52aW5mb3RlY2gub3JnIiwiaWF0IjoxNzgyMTIwMzU5LCJleHAiOjE3ODI3MjUxNTksInR5cGUiOiJhY2Nlc3MiLCJ1c2VyX2lkIjoiMjc1IiwidXNlcl91bmlxdWVfaWQiOiI5ZGUwYzRjMjc3IiwidXNlcl9uYW1lIjoiY2FmZTAwMDkiLCJjdXN0b21lcl9pZCI6bnVsbCwicGhvbmVfbm8iOiI2Nzk4MTg4NjYiLCJlbWFpbCI6ImNhZmUwMDA5QG1haWxpbmF0b3IuY29tIiwicmVmZXJyYWxfY29kZSI6IkVEMzQ1MiIsImJzX3N0YXR1cyI6bnVsbCwicm9sZSI6MX0.JiTKyvLAlg-MVeE-G6vEN-7rTh6QYlmyxbEWCtuYrxQ"
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
