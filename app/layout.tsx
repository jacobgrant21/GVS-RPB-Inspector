import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'GVS / RPB Inspection' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00B140" />
      </head>
      <body>
        <header>
          <img src="/gvs-logo.svg" alt="GVS" height={28} />
          <div style={{fontWeight:800, letterSpacing:0.3}}>Assessment Portal</div>
          <nav style={{marginLeft:'auto', display:'flex', gap:12}}>
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/assessment/new">New Assessment</Link>
            <Link href="/login">Login</Link>
          </nav>
        </header>
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
