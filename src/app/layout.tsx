import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Harvest Hope Farm - Florida Farm Ministry Dashboard',
  description: 'Transparent trust management for 508(c)(1)(A) faith-based farm ministry serving churches and shelters in Florida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-light-200 text-light-900 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
