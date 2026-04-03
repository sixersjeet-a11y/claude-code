import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-heading text-brand text-xl">High School PrepPath</Link>
            <div className="flex gap-4 text-sm">
              <Link href="/schools">Schools</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/ai-tools">AI Tools</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
