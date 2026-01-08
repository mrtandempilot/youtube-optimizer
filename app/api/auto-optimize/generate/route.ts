import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { topic, currentTitle, currentTags, currentDescription, currentRank } = await request.json()

        // Call OpenRouter API to generate optimized content
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',
                messages: [
                    {
                        role: 'system',
                        content: `You are a YouTube SEO expert. Generate optimized title, tags, and description to improve search rankings.
            
Current rank: #${currentRank || 'unknown'}
Goal: Improve ranking by making content more searchable and engaging.

Return ONLY valid JSON in this exact format:
{
  "title": "optimized title here",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "optimized description here"
}`
                    },
                    {
                        role: 'user',
                        content: `Topic: ${topic}
Current Title: ${currentTitle}
Current Tags: ${currentTags?.join(', ') || 'none'}
Current Description: ${currentDescription || 'none'}

Generate better SEO-optimized content to improve ranking.`
                    }
                ]
            })
        })

        const data = await response.json()
        const content = data.choices[0].message.content

        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Invalid AI response format')
        }

        const optimized = JSON.parse(jsonMatch[0])

        return NextResponse.json({
            success: true,
            optimized: {
                title: optimized.title,
                tags: optimized.tags,
                description: optimized.description
            }
        })
    } catch (error) {
        console.error('Error generating optimization:', error)
        return NextResponse.json(
            { error: 'Failed to generate optimization' },
            { status: 500 }
        )
    }
}
