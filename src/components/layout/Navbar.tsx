'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  // Navigation links with their corresponding paths
  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Archives', path: '/archives' },
    { name: 'À propos', path: '/about' }
  ];

  return (
    <nav 
      className="w-full py-6 px-4" 
      aria-label="Navigation principale"
    >
      {/* Grand titre central avec une typographie élégante et minimaliste */}
      <h1 className="text-center text-2xl font-bold">Journal du Lycée</h1>
      
      {/* Navigation links */}
      <div className="flex justify-center space-x-4 mt-4">
        {navLinks.map((link) => (
          <Link 
            key={link.path} 
            href={link.path} 
            className={`
              ${pathname === link.path ? 'text-primary font-bold' : 'text-gray-600'}
              hover:text-primary transition-colors duration-300
            `}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;