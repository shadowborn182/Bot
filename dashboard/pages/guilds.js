import { useEffect, useState } from 'react';

export default function Guilds() {
  const [guilds, setGuilds] = useState([]);
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => console.log(d)).catch(() => {});
    fetch('/api/guilds').then(r => r.json()).then(d => setGuilds(d.guilds || [])).catch(() => {});
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>Your Guilds (Manage Guild permission required)</h2>
      <ul>
        {guilds.map(g => <li key={g.id}>{g.name} ({g.id})</li>)}
      </ul>
    </div>
  )
}
