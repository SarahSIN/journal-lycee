// 1. IMPORTS
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SanityArticle } from '@/types/sanity-article';

// 2. TYPES
type ArticleCardProps = {
  article: SanityArticle;
};

// 3. COMPOSANT
const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <Link 
      href={`/articles/${article._id}`} 
      className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {article.imageUrl && (
        <div className="relative w-full h-48">
          <Image 
            src={article.imageUrl} 
            alt={article.title} 
            fill 
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{article.title}</h3>
        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
          {article.category && <span>{article.category}</span>}
          {article.editionTitle && <span>{article.editionTitle}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;