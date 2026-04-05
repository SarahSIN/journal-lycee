// 1. IMPORTS
import { client } from '@/lib/sanity/client';
import { getAllArticlesQuery } from '@/lib/sanity/queries';
import ArticleCard from '@/components/articles/ArticleCard';
import { SanityArticle } from '@/types/sanity-article';

// 2. FONCTIONS SERVEUR
async function fetchArticles(): Promise<SanityArticle[]> {
  try {
    const articles = await client.fetch(getAllArticlesQuery);
    return articles;
  } catch (error) {
    console.error('Erreur lors de la récupération des articles :', error);
    return [];
  }
}

// 3. COMPOSANT PAGE
export default async function HomePage() {
  const articles = await fetchArticles();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Derniers Articles</h1>
      
      {articles.length === 0 ? (
        <p className="text-center text-gray-600">Aucun article disponible</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard 
              key={article._id} 
              article={article} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
