import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Configuration des liens de navigation
const NAV_LINKS = [
  { href: '/articles', label: 'Articles' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/sondages', label: 'Sondages' }
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full px-6 max-w-md mx-auto mb-8 shadow-lg">
      <ul className="flex justify-center gap-8 py-4">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`
                font-roboto text-white hover:text-cyan-400 transition-all duration-300
                ${pathname === link.href
                  ? 'font-bold underline'
                  : ''}
              `}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}