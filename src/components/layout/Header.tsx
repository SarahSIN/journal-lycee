import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-slate-900 py-4">
      <div className="container mx-auto flex flex-col items-center">
        <Link href="/" className="mb-4">
          <Image 
            src="/logo-ozennien.jpeg" 
            alt="Logo du Journal du Lycée" 
            width={150} 
            height={150} 
            className="rounded-full"
          />
        </Link>
        <nav>
          <ul className="flex space-x-8 text-white">
            <li><Link href="/articles">Articles</Link></li>
            <li><Link href="/podcasts">Podcasts</Link></li>
            <li><Link href="/sondages">Sondages</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}