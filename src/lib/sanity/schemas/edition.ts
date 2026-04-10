import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'edition',
  title: 'Édition',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de l\'édition',
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
      name: 'publishDate',
      title: 'Date de publication',
      type: 'date',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'articles',
      title: 'Articles',
      type: 'array',
      of: [{ 
        type: 'reference', 
        to: [{ type: 'article' }] 
      }]
    }),
    defineField({
      name: 'pdfVersion',
      title: 'Version PDF complète',
      type: 'file',
      options: {
        accept: '.pdf'
      }
    }),
    defineField({
      name: 'views',
      title: 'Nombre de vues',
      type: 'number',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      date: 'publishDate',
      articleCount: 'articles.length'
    },
    prepare(selection) {
      const { title, media, date, articleCount } = selection
      return {
        title,
        media,
        subtitle: `${date} - ${articleCount || 0} article(s)`
      }
    }
  }
})