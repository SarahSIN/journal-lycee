import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Auteur',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'bio',
      title: 'Biographie',
      type: 'text'
    }),
    defineField({
      name: 'class',
      title: 'Classe',
      type: 'string'
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email'
    }),
    defineField({
      name: 'articleCount',
      title: 'Nombre d\'articles',
      type: 'number',
      initialValue: 0
    })
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      subtitle: 'class'
    },
    prepare(selection) {
      const { title, media, subtitle } = selection
      return {
        title,
        media,
        subtitle: subtitle ? `Classe : ${subtitle}` : ''
      }
    }
  }
})