import { NextRequest, NextResponse } from 'next/server'
import { discordFetch, type DiscordChannel, type DiscordRole } from '@/lib/discord'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ guildId: string }> },
) {
  const accessToken = request.cookies.get('guildscope_discord')?.value
  const botToken = process.env.DISCORD_BOT_TOKEN
  if (!accessToken || !botToken) {
    return NextResponse.json({ error: 'Not authenticated or bot not configured.' }, { status: 401 })
  }

  const { guildId } = await context.params

  try {
    const [roles, channels] = await Promise.all([
      discordFetch<DiscordRole[]>(`/guilds/${guildId}/roles`, botToken),
      discordFetch<DiscordChannel[]>(`/guilds/${guildId}/channels`, botToken),
    ])

    return NextResponse.json({ guildId, roles, channels })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not inspect this server.' },
      { status: 502 },
    )
  }
}
