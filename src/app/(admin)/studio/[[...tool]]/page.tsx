'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/lib/sanity/config'

export default function StudioPage() {
  return <NextStudio config={config} />
}

// Prevent server-side rendering of the Studio
export const dynamic = 'force-static'