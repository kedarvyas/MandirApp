import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Donation Kiosk | Sanctum',
  description: 'Make a donation to support our community',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="kiosk-mode">
      {children}
    </div>
  )
}
