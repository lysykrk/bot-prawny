import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bot Prawny - Analiza Aktów Prawnych',
  description: 'AI-powered legal document analysis and court petition generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}