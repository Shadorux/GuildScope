'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DiscordChannel, DiscordGuild, DiscordRole } from '@/lib/discord'
import { hasPermission, Permission, permissionDrifted, resolveRoleSetPermissions } from '@/lib/permissions'

type GuildWithInstall = DiscordGuild & { installed: boolean }
type Report = { guildId: string; roles: DiscordRole[]; channels: DiscordChannel[] }

export default function Dashboard() {
  const [guilds, setGuilds] = useState<GuildWithInstall[]>([])
  const [selectedGuild, setSelectedGuild] = useState<GuildWithInstall | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/guilds')
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not load your Discord servers.')
        return response.json() as Promise<{ guilds: GuildWithInstall[] }>
      })
      .then(({ guilds }) => setGuilds(guilds))
      .catch((error: Error) => setError(error.message))
      .finally(() => setLoading(false))
  }, [])

  const inspect = async (guild: GuildWithInstall) => {
    setSelectedGuild(guild)
    setSelectedRoles([])
    setReport(null)
    setError('')
    const response = await fetch(`/api/guilds/${guild.id}/report`)
    const data = await response.json()
    if (!response.ok) {
      setError(data.error ?? 'Could not inspect this server.')
      return
    }
    setReport(data as Report)
  }

  const visibleChannels = useMemo(() => {
    if (!report) return []
    return report.channels.filter((channel) => channel.type !== 4).map((channel) => {
      const permissions = resolveRoleSetPermissions(report.guildId, report.roles, selectedRoles, channel)
      return {
        channel,
        view: hasPermission(permissions, Permission.ViewChannel),
        send: hasPermission(permissions, Permission.SendMessages),
        drifted: permissionDrifted(channel, report.channels),
      }
    })
  }, [report, selectedRoles])

  return (
    <main className="shell dashboard">
      <header className="topbar">
        <div><span className="brand-mark small">GS</span><b>GuildScope</b></div>
        <a href="/api/auth/logout">Disconnect</a>
      </header>

      <section className="dashboard-head">
        <p className="eyebrow">SERVER INSPECTOR</p>
        <h1>Your permission map.</h1>
        <p className="lede">Choose a server you manage. GuildScope only analyzes structure and permission data.</p>
      </section>

      {loading && <div className="panel">Loading servers…</div>}
      {error && <div className="panel error">{error}</div>}

      <section className="guild-grid">
        {guilds.map((guild) => (
          <article className="panel guild-card" key={guild.id}>
            <div>
              <b>{guild.name}</b>
              <span>{guild.owner ? 'Owner' : 'Manage Server'}</span>
            </div>
            {guild.installed ? (
              <button className="button primary" onClick={() => void inspect(guild)}>Inspect</button>
            ) : (
              <a className="button" href={`/api/bot/invite?guild_id=${guild.id}`}>Add GuildScope</a>
            )}
          </article>
        ))}
      </section>

      {report && selectedGuild && (
        <section className="inspector-grid">
          <aside className="panel roles-panel">
            <p className="eyebrow">ROLE SIMULATOR</p>
            <h2>{selectedGuild.name}</h2>
            <p className="muted">Select one or more roles to simulate their combined access.</p>
            <div className="role-list">
              {report.roles.filter((role) => role.id !== report.guildId && !role.managed).sort((a, b) => b.position - a.position).map((role) => (
                <label key={role.id}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => setSelectedRoles((current) => current.includes(role.id) ? current.filter((id) => id !== role.id) : [...current, role.id])}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
            </div>
          </aside>

          <div className="panel matrix-panel">
            <div className="matrix-head">
              <div><p className="eyebrow">CHANNEL ACCESS</p><h2>{visibleChannels.length} channels</h2></div>
              <div className="legend"><span>● view</span><span>✎ send</span><span>⚠ drift</span></div>
            </div>
            <div className="channel-list">
              {visibleChannels.map(({ channel, view, send, drifted }) => (
                <div className="channel-row" key={channel.id}>
                  <code>#{channel.name}</code>
                  <span className={view ? 'yes' : 'no'}>{view ? '● View' : '× Hidden'}</span>
                  <span className={send ? 'yes' : 'no'}>{send ? '✎ Send' : '× No send'}</span>
                  <span className={drifted ? 'warn' : 'muted'}>{drifted ? '⚠ Drift' : 'Synced'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
