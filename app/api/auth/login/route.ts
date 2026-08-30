import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Discord OAuth is not configured.' }, { status: 500 })
  }

  const state = randomUUID()
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify guilds',
    state,
  })

  const response = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`)
  response.cookies.set('guildscope_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return response
}
