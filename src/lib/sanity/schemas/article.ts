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
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'author',
      title: 'Auteur',
      type: 'reference',
      to: { type: 'author' }
    }),
    defineField({
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'categories',
      title: 'Rubriques',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }]
    }),
    defineField({
      name: 'tags',
      title: 'Mots-clés',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publié le',
      type: 'datetime'
    }),
    defineField({
      name: 'body',
      title: 'Contenu',
      type: 'blockContent'
    }),
    defineField({
      name: 'pdfAttachment',
      title: 'Fichier PDF',
      type: 'file',
      options: {
        accept: '.pdf'
      }
    }),
    defineField({
      name: 'podcastLink',
      title: 'Lien du Podcast',
      type: 'url'
    }),
    defineField({
      name: 'views',
      title: 'Nombre de vues',
      type: 'number',
      initialValue: 0
    }),
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0
    })
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage'
    },
    prepare(selection) {
      const { author } = selection
      return { ...selection, subtitle: author && `par ${author}` }
    }
  }
})