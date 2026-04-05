import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: 'mkmaq3z0', // Hardcoded projectId as requested
  dataset: 'production', // Hardcoded dataset value
  apiVersion: '2024-01-01', // Utilisez la dernière version de l'API Sanity
  useCdn: process.env.NODE_ENV === 'production', // Utilisez le CDN en production
})