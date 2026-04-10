import { type SchemaTypeDefinition } from 'sanity'

// Importer les schémas
import article from './article'
import author from './author'
import category from './category'
import blockContent from './blockContent'
import edition from './edition'

// Liste des schémas
export const schemaTypes: SchemaTypeDefinition[] = [
  article,
  author,
  category,
  blockContent,
  edition
]

export default schemaTypes