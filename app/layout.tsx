import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'GO-CARS INVENTAR',
    template: '%s | GO-CARS INVENTAR',
  },
  description: 'Fahrzeugverwaltung für Einkauf, Verkauf und Analyse',
  applicationName: 'GO-CARS INVENTAR',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GO-CARS INVENTAR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}