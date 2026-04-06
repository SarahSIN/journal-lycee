import Image from 'next/image';
import Link from 'next/link';
import { SanityArticle } from '@/types/sanity-article';
import { urlForImage } from '@/lib/sanity/imageUrl';

interface ArticleCardProps {
  article: SanityArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const imageUrl = article.mainImage?.asset 
    ? urlForImage(article.mainImage.asset).width(400).height(250).url() 
    : '/placeholder-image.jpg';

  return (
    <Link 
      href={`/articles/${article.slug.current}`} 
      className="block"
    >
      <div className="
        bg-black/30 
        backdrop-blur-md 
        border 
        border-white/20 
        rounded-xl 
        overflow-hidden 
        transition-all 
        duration-300 
        hover:scale-[1.02] 
        hover:shadow-xl
      ">
        <Image
          src={imageUrl}
          alt={article.title}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="
            text-white 
            font-serif 
            text-xl 
            font-bold 
            mb-2
          ">
            {article.title}
          </h2>
          {article.description && (
            <p className="text-gray-300 text-sm">
              {article.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}