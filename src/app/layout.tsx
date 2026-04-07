import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: "L'Ozennien - Journal du Lycée",
  description: 'Le journal officiel du lycée - Articles, Podcasts et Sondages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body 
        className="min-h-screen flex flex-col"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          backgroundAttachment: 'fixed',
        }}
      >
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
