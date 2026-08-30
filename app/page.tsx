export default function Home() {
  return (
    <main className="shell landing">
      <div className="brand-mark">GS</div>
      <p className="eyebrow">DISCORD SERVER PERMISSION MAP</p>
      <h1>See who can access what.</h1>
      <p className="lede">
        GuildScope turns Discord roles, channels, and permission overrides into a readable map so server owners can spot drift and test role access without clicking through hundreds of settings.
      </p>
      <div className="actions">
        <a className="button primary" href="/api/auth/login">Connect Discord</a>
        <a className="button" href="https://github.com/Shadorux/GuildScope">View source</a>
      </div>
      <div className="feature-grid">
        <article><b>Permission map</b><span>View channel access across roles at a glance.</span></article>
        <article><b>Role simulator</b><span>Select roles and see the exact channels they can view or send in.</span></article>
        <article><b>Drift detection</b><span>Highlight channels whose overrides differ from their parent category.</span></article>
      </div>
      <p className="privacy">No message content. No member-list scan. GuildScope only needs server structure, roles, channels, and permission overwrites.</p>
    </main>
  )
}
