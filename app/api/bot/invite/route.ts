import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'Discord application is not configured.' }, { status: 500 })
  }

  const guildId = request.nextUrl.searchParams.get('guild_id') ?? ''
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'bot',
    permissions: '0',
    disable_guild_select: guildId ? 'true' : 'false',
  })
  if (guildId) params.set('guild_id', guildId)

  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`)
}
