export const DISCORD_API = 'https://discord.com/api/v10'

export type DiscordGuild = {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

export type DiscordRole = {
  id: string
  name: string
  color: number
  position: number
  permissions: string
  managed: boolean
}

export type DiscordOverwrite = {
  id: string
  type: 0 | 1
  allow: string
  deny: string
}

export type DiscordChannel = {
  id: string
  name: string
  type: number
  parent_id: string | null
  position: number
  permission_overwrites?: DiscordOverwrite[]
}

export const discordFetch = async <T>(path: string, token: string, scheme: 'Bearer' | 'Bot' = 'Bot') => {
  const response = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `${scheme} ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Discord API ${response.status}: ${text}`)
  }
  return response.json() as Promise<T>
}

export const canManageGuild = (permissions: string) => {
  const bits = BigInt(permissions)
  const administrator = 1n << 3n
  const manageGuild = 1n << 5n
  return (bits & administrator) === administrator || (bits & manageGuild) === manageGuild
}
