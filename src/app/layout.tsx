import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
})

const merriweather = Merriweather({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-merriweather' 
})

export const metadata: Metadata = {
  title: 'Le Journal du Lycée',
  description: 'Le journal officiel de notre lycée',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${merriweather.variable}`}>
      <body className="bg-slate-900 text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
