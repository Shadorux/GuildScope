import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GuildScope',
  description: 'Visualize Discord server permissions, role access, channel visibility, and permission drift.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
