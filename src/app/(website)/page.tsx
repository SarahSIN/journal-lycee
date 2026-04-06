import { getAllArticles } from '@/lib/sanity/queries';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SanityArticle } from '@/types/sanity-article';

export default async function HomePage() {
  const articles: SanityArticle[] = await getAllArticles();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard 
            key={article._id} 
            article={article} 
          />
        ))}
      </div>
    </main>
  );
}
