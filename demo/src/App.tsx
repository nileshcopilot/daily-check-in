import { useState } from 'react';
import { DailyCheckinPopup } from '@nileshp.vinfotech/daily-checkin-popup';

const STORAGE_KEY = 'demo-checkin';

export default function App() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);

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
        title="Daily Check-in"
        subtitle="Claim your daily bonus!"
        rewards={['+10', '+20', '+30', '+40', '+50', '+75', '+100']}
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
