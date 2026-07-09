import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api/auth';
import { COLORS } from '../theme';

export default function Leaderboard({ limit = 10 }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let mounted = true;
    getLeaderboard().then(res => {
      if (res?.success && mounted) setItems(res.data || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, color: 'white' }}>🏆 Leaderboard</h4>
        <small style={{ color: 'rgba(255,255,255,0.6)' }}>Top donors</small>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.slice(0, limit).map((u, i) => (
          <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{i+1}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700 }}>{u.name || u.organization || 'Donor'}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{u.organization || ''}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: COLORS.mint, fontWeight: 800 }}>{u.points || 0} pts</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{u.badge || 'Newcomer'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
