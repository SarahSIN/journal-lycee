"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { SanityArticle } from '@/types/sanity-article';
import { getCurrentSeason, seasonalThemes } from '@/lib/themes/seasonal';
import { getSafeImageUrl } from '@/lib/sanity/imageUrl';
import { portableTextComponents } from '@/lib/sanity/portableTextComponents';

// 1. TYPES
interface ArticlePageProps {
  params: { slug: string };
}

// 2. ARTICLE PAGE COMPONENT
export default function ArticlePage({ params }: ArticlePageProps) {
  // 3. SEASONAL THEME STATE
  const [themeClasses, setThemeClasses] = useState(
    seasonalThemes[getCurrentSeason()]
  );

  // 4. ARTICLE STATE (placeholder - replace with actual data fetching)
  const [article, setArticle] = useState<SanityArticle | null>(null);

  // 5. UPDATE THEME ON SEASON CHANGE
  useEffect(() => {
    const updateTheme = () => {
      setThemeClasses(seasonalThemes[getCurrentSeason()]);
    };

    // Update theme hourly
    const themeInterval = setInterval(updateTheme, 3600000);
    return () => clearInterval(themeInterval);
  }, []);

  // 6. FETCH ARTICLE (placeholder - implement actual data fetching)
  useEffect(() => {
    // TODO: Implement actual article fetching logic
    const mockArticle: SanityArticle = {
      _id: '1',
      _type: 'article',
      title: 'Exemple d\'article',
      slug: { current: params.slug, _type: 'slug' },
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Contenu de l\'article...' }],
          style: 'normal'
        }
      ],
      mainImage: {
        asset: { _ref: 'image-ref', _type: 'reference' }
      }
    };
    setArticle(mockArticle);
  }, [params.slug]);

  // 7. RENDER LOADING STATE
  if (!article) {
    return (
      <div 
        className={`
          min-h-screen 
          flex items-center justify-center 
          ${themeClasses.background}
          ${themeClasses.textPrimary}
        `}
      >
        Chargement...
      </div>
    );
  }

  // 8. MAIN ARTICLE RENDER
  return (
    <article 
      className={`
        relative 
        min-h-screen 
        ${themeClasses.background} 
        seasonal-glow
        py-16 
        px-4 
        sm:px-6 
        lg:px-8
      `}
    >
      {/* Article Container */}
      <div 
        className={`
          max-w-3xl 
          mx-auto 
          bg-white 
          shadow-2xl 
          rounded-xl 
          overflow-hidden 
          relative 
          z-10
        `}
      >
        {/* Article Header */}
        <header className="relative">
          {article.mainImage && (
            <div className="w-full h-96 relative">
              <Image
                src={getSafeImageUrl(article.mainImage)}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          
          <div className="p-8">
            <h1 
              className={`
                text-4xl 
                font-serif 
                font-bold 
                mb-4 
                ${themeClasses.textPrimary}
              `}
            >
              {article.title}
            </h1>
          </div>
        </header>

        {/* Article Body */}
        <div 
          className={`
            prose 
            prose-lg 
            max-w-none 
            p-8 
            ${themeClasses.textSecondary}
          `}
        >
          <PortableText 
            value={article.body} 
            components={portableTextComponents} 
          />
        </div>
      </div>
    </article>
  );
}