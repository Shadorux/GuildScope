import { NextRequest, NextResponse } from 'next/server'
import { canManageGuild, discordFetch, type DiscordGuild } from '@/lib/discord'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('guildscope_discord')?.value
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!accessToken || !botToken) {
    return NextResponse.json({ error: 'Not authenticated or bot not configured.' }, { status: 401 })
  }

  const guilds = await discordFetch<DiscordGuild[]>('/users/@me/guilds', accessToken, 'Bearer')
  const manageable = guilds.filter((guild) => guild.owner || canManageGuild(guild.permissions))

  const results = await Promise.all(
    manageable.map(async (guild) => {
      const installed = await fetch(`https://discord.com/api/v10/guilds/${guild.id}`, {
        headers: { Authorization: `Bot ${botToken}` },
        cache: 'no-store',
      }).then((response) => response.ok).catch(() => false)

      return { ...guild, installed }
    }),
  )

  return NextResponse.json({ guilds: results })
}
