import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LA45 — 45‑second video intros',
  description: 'Real people. Real time. LA45.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-dvh bg-black text-white">
        <div className="fixed top-0 inset-x-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <div className="font-serif text-xl tracking-wide">LA45</div>
            <div className="flex items-center gap-6 text-sm">
              <a href="/wallet" className="hover:text-gold">Wallet</a>
              <a href="/profile" className="hover:text-gold">Profile</a>
            </div>
          </nav>
        </div>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  )
}
