import Image from 'next/image';
import Link from 'next/link';
import { SanityArticle } from '@/types/sanity-article';
import { urlForImage } from '@/lib/sanity/imageUrl';

// 1. TYPES
interface ArticleCardProps {
  article: SanityArticle;
}

// 2. COMPOSANT
export function ArticleCard({ article }: ArticleCardProps) {
  // 3. VARIABLES CALCULÉES
  const imageUrl = article.mainImage?.asset
    ? urlForImage(article.mainImage.asset).width(400).height(300).url()
    : '/placeholder-image.jpg';

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className="block group h-full"
    >
      <article className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </div>
        
        {/* Contenu */}
        <div className="flex-1">
          <h2 className="text-2xl font-serif text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">
            {article.title}
          </h2>
          
          {article.description && (
            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
              {article.description}
            </p>
          )}
          
          {/* Indicateur "Lire la suite" */}
          <div className="mt-3 flex items-center text-cyan-300 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-sm font-medium">Lire la suite</span>
            <svg 
              className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
