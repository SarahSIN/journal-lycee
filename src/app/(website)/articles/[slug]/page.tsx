import { client } from '@/lib/sanity/client'
import { groq } from 'next-sanity'
import { Metadata } from 'next'
import { SanityArticle } from '@/types/sanity-article'
import Image from 'next/image'
 
// Génération statique des routes pour tous les articles
export async function generateStaticParams() {
  const articles = await client.fetch(
    groq`*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`
  )
  
  // Filtrer pour s'assurer qu'aucune valeur undefined ne soit présente
  return articles
    .filter((article: { slug?: string }) => article.slug !== undefined)
    .map((article: { slug: string }) => ({
      slug: article.slug
    }))
}

// Génération des métadonnées
export async function generateMetadata({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const article = await client.fetch(
      groq`*[_type == "article" && slug.current == $slug][0] {
        title,
        typeArticle
      }`,
      { slug }
    );
    
    return {
      title: article?.title || 'Article non trouvé',
      description: `${article?.typeArticle === 'podcast' ? 'Podcast' : 'Article Visuel'} - ${article?.title || ''}`
    }
  } catch (error) {
    console.error(`Erreur lors de la génération des métadonnées pour ${slug}:`, error);
    return {
      title: 'Erreur',
      description: 'Impossible de charger les métadonnées de l\'article'
    }
  }
}

// Composant de la page de détail d'article
export default async function ArticleDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const { slug } = params;
  
  try {
    const article = await client.fetch(
      groq`*[_type == "article" && slug.current == $slug][0] {
        "mainImage": mainImage.asset->url
      }`,
      { slug }
    );

    // Gestion du cas où l'article est null
    if (!article) {
      return (
        <div className="flex justify-center items-center h-screen text-xl">
          Chargement en cours...
        </div>
      );
    }

    return (
      <div className="w-full h-screen relative">
        {article.mainImage && (
          <Image
            src={article.mainImage}
            alt="Image de l'article"
            fill
            className="object-cover absolute inset-0 w-full h-full"
            priority
          />
        )}
      </div>
    )
  } catch (error) {
    console.error(`Erreur lors du chargement de l'article avec le slug ${slug}:`, error);
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Erreur de chargement
      </div>
    );
  }
}