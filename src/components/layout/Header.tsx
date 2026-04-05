// 1. IMPORTS
import React from 'react';
import Link from 'next/link';

// 2. COMPOSANT
const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Journal du Lycée
        </Link>
        <ul className="flex space-x-4">
          <li><Link href="/articles">Articles</Link></li>
          <li><Link href="/about">À propos</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;