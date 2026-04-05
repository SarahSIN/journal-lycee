// 1. IMPORTS
import React from 'react';
import Link from 'next/link';

// 2. COMPOSANT
const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-bold mb-2">Journal du Lycée</h3>
          <p>Toute l'actualité de notre établissement</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Liens Rapides</h4>
          <ul>
            <li><Link href="/mentions-legales">Mentions Légales</Link></li>
            <li><Link href="/politique-confidentialite">Politique de Confidentialité</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contactez-nous</h4>
          <p>Email: journal@notrelycee.fr</p>
        </div>
      </div>
      <div className="text-center mt-4 text-sm">
        © {new Date().getFullYear()} Journal du Lycée. Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;