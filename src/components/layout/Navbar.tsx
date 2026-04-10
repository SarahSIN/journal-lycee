import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { client } from '@/lib/sanity/client'
import { useSeasonalTheme } from '@/components/ui/SeasonalTheme'

interface NavItem {
  title: string
  slug: string
  href: string
}

export default function Navbar() {
  const [categories, setCategories] = useState<NavItem[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const theme = useSeasonalTheme()

  useEffect(() => {
    const fetchCategories = async () => {
      const query = `*[_type == "category"] {
        title,
        "slug": slug.current,
        "href": "/category/" + slug.current
      }`
      
      try {
        const fetchedCategories = await client.fetch(query)
        setCategories([
          { title: 'Accueil', slug: 'home', href: '/' },
          ...fetchedCategories,
          { title: 'Archives', slug: 'archives', href: '/archives' }
        ])
      } catch (error) {
        console.error('Erreur de chargement des catégories', error)
      }
    }

    fetchCategories()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav 
      className="navbar" 
      style={{
        backgroundColor: theme.primaryColor,
        color: theme.textColor
      }}
    >
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Journal Ozenne
        </Link>

        <div className={`menu-icon ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {categories.map((item) => (
            <li 
              key={item.slug} 
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <Link 
                href={item.href} 
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}