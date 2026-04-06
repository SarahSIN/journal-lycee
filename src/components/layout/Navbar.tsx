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
    <nav className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full px-6 py-3 max-w-md mx-auto mb-8 shadow-lg">
      <ul className="flex justify-between items-center space-x-4">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link 
              href={link.href} 
              className={`
                font-roboto text-white transition-all duration-300 
                ${pathname === link.href 
                  ? 'font-bold underline' 
                  : 'hover:text-gray-200 hover:opacity-80'}
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