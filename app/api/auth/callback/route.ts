import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const expectedState = request.cookies.get('guildscope_oauth_state')?.value

  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(new URL('/?error=oauth_state', request.url))
  }

  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: 'Discord OAuth is not configured.' }, { status: 500 })
  }

  const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/?error=oauth_exchange', request.url))
  }

  const token = (await tokenResponse.json()) as { access_token: string; expires_in: number }
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.delete('guildscope_oauth_state')
  response.cookies.set('guildscope_discord', token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(token.expires_in, 3600),
  })
  return response
}
