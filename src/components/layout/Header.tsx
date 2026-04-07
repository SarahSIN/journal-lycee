import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center">
        {/* Logo centré avec effet de brillance */}
        <Link href="/" className="mb-8 group">
          <div className="relative">
            <Image
              src="/logo-ozennien.jpeg"
              alt="L'Ozennien - Journal du Lycée"
              width={180}
              height={180}
              className="rounded-full object-cover shadow-2xl ring-4 ring-cyan-400/30 transition-all duration-300 group-hover:ring-cyan-400/60 group-hover:scale-105"
            />
            {/* Effet de lueur au survol */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </div>
        </Link>
        
        {/* Titre du journal avec police Playfair Display */}
        <h1 
          className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          L'Ozennien
        </h1>
        
        {/* Barre de navigation minimaliste */}
        <nav className="w-full border-t border-white/10 pt-6">
          <ul className="flex justify-center gap-12 text-lg font-medium">
            <li>
              <Link
                href="/"
                className="text-white/90 hover:text-cyan-300 transition-all duration-300 relative group"
              >
                Articles
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/podcasts"
                className="text-white/90 hover:text-cyan-300 transition-all duration-300 relative group"
              >
                Podcasts
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </li>
            <li>
              <Link
                href="/sondages"
                className="text-white/90 hover:text-cyan-300 transition-all duration-300 relative group"
              >
                Sondages
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
