import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function getFarmBySlug(slug: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data } = await supabase
    .from('directory_farms')
    .select('name, tagline, description, meta_title, meta_description, cover_image_url, city, county, slug, status, claimed_by')
    .eq('slug', slug)
    .in('status', ['published', 'claimed'])
    .single()
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const farm = await getFarmBySlug(slug)

  if (!farm) {
    return {
      title: 'Farm Not Found - Hey Farmer',
      description: 'This farm listing could not be found.',
    }
  }

  const title = farm.meta_title || `${farm.name} - Hey Farmer Farm Directory`
  const description = farm.meta_description || farm.description?.substring(0, 160) || `${farm.name} in ${farm.city || ''}, Texas - local farm featured on Hey Farmer.`

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(farm.cover_image_url ? { images: [{ url: farm.cover_image_url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(farm.cover_image_url ? { images: [farm.cover_image_url] } : {}),
    },
  }

  // If claimed, add canonical pointing to profile
  if (farm.status === 'claimed' && farm.claimed_by) {
    metadata.alternates = {
      canonical: `/profile/${farm.claimed_by}`,
    }
  }

  return metadata
}

export default function FarmLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
