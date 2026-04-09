import { getAllArticles } from '@/lib/sanity/queries';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SanityArticle } from '@/types/sanity-article';

export default async function HomePage() {
  const articles: SanityArticle[] = await getAllArticles();

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Titre principal */}
      <h1 className="text-5xl md:text-6xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
        Les Derniers Articles
      </h1>

      {/* Grille d'articles avec effet Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto p-8">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </main>
  );
}
