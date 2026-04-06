import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'typeArticle',
      title: 'Type d\'Article',
      type: 'string',
      options: {
        list: [
          { title: 'Visuel', value: 'visuel' },
          { title: 'Podcast', value: 'podcast' },
          { title: 'Sondage', value: 'poll' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Fichier Visuel (PNG, JPEG, WebP, etc.)',
      type: 'image',
      options: {
        hotspot: true,
        accept: 'image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml'
      },
      validation: (Rule) => Rule.custom((value, context) => {
        const typeArticle = context.document?.typeArticle
        if (typeArticle === 'visuel' && !value) {
          return 'Un fichier visuel est requis pour un article de type Visuel'
        }
        return true
      }),
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie d\'Images',
      type: 'array',
      of: [{ 
        type: 'image',
        options: {
          hotspot: true
        }
      }],
      options: {
        layout: 'grid'
      }
    }),
    defineField({
      name: 'pdfFile',
      title: 'Fichier PDF (optionnel)',
      type: 'file',
      options: {
        accept: '.pdf'
      },
    }),
    defineField({
      name: 'audioFile',
      title: 'Fichier Audio du Podcast',
      type: 'file',
      options: {
        accept: 'audio/*',
      },
      validation: (Rule) => Rule.custom((value, context) => {
        const typeArticle = context.document?.typeArticle
        if (typeArticle === 'podcast' && !value) {
          return 'Un fichier audio est requis pour un article de type Podcast'
        }
        return true
      }),
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Sport', value: 'sport' },
          { title: 'Culture', value: 'culture' },
          { title: 'Vie Scolaire', value: 'vie_scolaire' },
          { title: 'Actualités', value: 'actualites' },
          { title: 'Opinion', value: 'opinion' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Édition',
      type: 'reference',
      to: [{ type: 'edition' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'embedCode',
      title: 'Code d\'intégration du sondage',
      type: 'text',
      description: 'Collez ici le code d\'intégration du formulaire Google Forms',
      hidden: ({ document }) => document?.typeArticle !== 'poll',
      validation: (Rule) => Rule.custom((value, context) => {
        const typeArticle = context.document?.typeArticle
        if (typeArticle === 'poll' && !value) {
          return 'Un code d\'intégration est requis pour un article de type Sondage'
        }
        return true
      }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage',
      type: 'typeArticle',
    },
    prepare(selection) {
      const { title, author, media, type } = selection
      return {
        title,
        subtitle: type === 'podcast' ? 'Podcast' : type === 'poll' ? 'Sondage' : 'Article Visuel' + ` - Par ${author}`,
        media,
      }
    },
  },
})