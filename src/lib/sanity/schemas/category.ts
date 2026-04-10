import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Rubrique',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre de la rubrique',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
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
      name: 'color',
      title: 'Couleur de la rubrique',
      type: 'color'
    })
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description'
    },
    prepare(selection) {
      const { title, description } = selection
      return {
        title,
        subtitle: description
      }
    }
  }
})