import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definition for video_uploads table
export interface VideoUpload {
    id: string
    video_id: string
    topic: string
    current_title: string
    current_tags: string[]
    seo_score: number
    current_rank: number | null
    target_rank: number
    optimization_count: number
    last_optimized: string
    created_at: string
    thumbnail_url: string
    user_id?: string
}
