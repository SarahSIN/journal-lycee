import { client } from '@/lib/sanity/client'
import { groq } from 'next-sanity'
import { Metadata } from 'next'
import Image from 'next/image'

// Génération statique des routes pour tous les articles
export async function generateStaticParams() {
  const articles = await client.fetch(
    groq`*[_type == "article" && defined(slug.current)]{ "slug": slug.current }`
  )
  
  return articles
    .filter((article: { slug?: string }) => article.slug)
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
  const { slug } = await params;
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
}

// Composant de la page de détail d'article
export default async function ArticleDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const { slug } = await params;
  console.log("Slug recherché :", slug);
  const article = await client.fetch(
    groq`*[_type == "article" && slug.current == $slug][0] {
      "mainImage": mainImage.asset->url,
      title
    }`,
    { slug: slug }
  );

  // Gestion du cas où l'article est null
  if (!article) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-500">
        Données de l'article introuvables. Vérifiez le lien ou contactez le support.
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {article.mainImage ? (
        <Image
          src={article.mainImage}
          alt={`Image de l'article ${article.title}`}
          fill
          className="object-cover absolute inset-0 w-full h-full"
          priority
        />
      ) : (
        <div className="flex justify-center items-center h-screen text-xl text-gray-500">
          Aucune image disponible pour cet article
        </div>
      )}
    </div>
  );
}