import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import { SanityImageAsset } from '@/types/sanity-article';

// 1. CREATE IMAGE URL BUILDER
const builder = imageUrlBuilder(client);

// 2. URL FOR IMAGE FUNCTION
export function urlForImage(source: { _ref: string; _type: 'reference' }) {
  return builder.image(source);
}

// 3. SAFE IMAGE URL EXTRACTION
export function getSafeImageUrl(
  image?: { 
    asset?: { 
      _ref: string; 
      _type: 'reference' 
    } 
  }
): string {
  if (!image?.asset?._ref) {
    return '/placeholder-image.jpg'; // Fallback placeholder
  }

  try {
    const url = builder.image(image.asset).url();
    return url || '/placeholder-image.jpg';
  } catch (error) {
    console.error('Image URL generation error:', error);
    return '/placeholder-image.jpg';
  }
}