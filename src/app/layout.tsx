import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Terisa — One Balance. Every API. Pay Per Call.',
  description:
    'Stop managing subscriptions for every API you use. Top up once, call anything. Micro-fees as low as $0.0005 per request.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className="antialiased"
        style={{
          backgroundColor: '#09090B',
          color: '#FAFAFA',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
