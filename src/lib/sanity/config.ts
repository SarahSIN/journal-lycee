import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

const config = defineConfig({
  projectId: 'mkmaq3z0',
  dataset: 'production',
  title: 'Journal du Lycée',
  apiVersion: '2024-01-01',
  basePath: '/studio',
  plugins: [
    structureTool(),
    visionTool()
  ],
  schema: {
    types: schemaTypes
  }
})

export default config