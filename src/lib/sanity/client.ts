import { createClient as createSanityClient } from 'next-sanity';

// 1. SANITY CLIENT CONFIGURATION
export const sanityConfig = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'mkmaq3z0',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
};

// 2. CREATE SANITY CLIENT
export function createClient() {
  return createSanityClient(sanityConfig);
}

// 3. EXPORT DEFAULT CLIENT
export const client = createClient();