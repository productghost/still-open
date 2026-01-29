import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Still Open',
  description: 'An interactive 3D portfolio set outside a late-night corner store',
}

/**
 * Root layout component.
 * 
 * This provides the HTML shell for the entire application.
 * The <body> contains only the Next.js app structure;
 * the 3D scene will be rendered inside app/page.tsx.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
