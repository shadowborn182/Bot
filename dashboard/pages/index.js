export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
      <h1>Shadow Dashboard (MVP)</h1>
      <p>This is a minimal dashboard scaffold. Click below to login with Discord (server must be running).</p>
      <a href="/api/login"><button style={{ padding: '10px 20px', fontSize: 16 }}>Login with Discord</button></a>
    </div>
  )
}
