import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

interface AIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function callOpenRouter(prompt: string, model: string): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_API_URL || 'https://youtube-optimizer.vercel.app',
      'X-Title': 'YouTube Optimizer',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`)
  }

  const data: AIResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const { topic, videoUrl } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Parallel AI calls with Grok (fast and free!)
    const [competitorAnalysis, titleGeneration, tagGeneration] = await Promise.all([
      // Competitor Analysis
      callOpenRouter(
        `Analyze the YouTube niche for "${topic}". Identify the top 5 competitors in this space. For each competitor provide:
- Channel name
- Estimated subscriber count
- Content strategy
- Key strength

Return the response as a JSON array with objects containing: name, subscribers, strategy, strength.`,
        'x-ai/grok-beta'
      ),

      // Title Generation
      callOpenRouter(
        `Generate 5 highly optimized YouTube video titles for the topic: "${topic}".
        
Requirements:
- SEO-friendly with relevant keywords
- Clickable and engaging
- Mix of question, how-to, and listicle formats
- 60 characters or less each
- Include power words that drive clicks

Return only a JSON array of title strings.`,
        'x-ai/grok-beta'
      ),

      // Tag Generation
      callOpenRouter(
        `Generate 20 YouTube tags for a video about: "${topic}".
        
Include:
- 5 broad, high-volume tags
- 10 medium specificity tags
- 5 long-tail, niche tags

Return only a JSON array of tag strings (no hashtags, just words/phrases).`,
        'x-ai/grok-beta'
      ),
    ])

    // Parse AI responses
    let competitors = []
    let titles = []
    let tags = []

    try {
      const competitorMatch = competitorAnalysis.match(/\[[\s\S]*\]/)
      if (competitorMatch) {
        competitors = JSON.parse(competitorMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse competitors:', e)
      competitors = [
        { name: 'Competitor 1', subscribers: '100K-500K', strategy: 'Weekly uploads', strength: 'High production quality' },
        { name: 'Competitor 2', subscribers: '50K-100K', strategy: 'Tutorial focused', strength: 'Clear explanations' },
        { name: 'Competitor 3', subscribers: '200K-1M', strategy: 'Entertainment', strength: 'Viral content' },
      ]
    }

    try {
      const titleMatch = titleGeneration.match(/\[[\s\S]*\]/)
      if (titleMatch) {
        titles = JSON.parse(titleMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse titles:', e)
      titles = [
        `${topic} - Complete Guide for Beginners`,
        `How to Master ${topic} in 2026`,
        `Top 10 ${topic} Tips You NEED to Know`,
      ]
    }

    try {
      const tagMatch = tagGeneration.match(/\[[\s\S]*\]/)
      if (tagMatch) {
        tags = JSON.parse(tagMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse tags:', e)
      tags = [topic, `${topic} tutorial`, `${topic} guide`, `${topic} tips`, 'how to']
    }

    // Calculate SEO score based on various factors
    const seoScore = Math.min(
      100,
      Math.floor(
        (titles.length > 0 ? 20 : 0) +
        (tags.length >= 15 ? 30 : tags.length * 2) +
        (competitors.length >= 3 ? 20 : 0) +
        30 // Base score
      )
    )

    // Generate recommendations
    const recommendations = [
      'Use the most clickable title for your thumbnail design',
      'Include top 3 competitors in your video research',
      'Add all tags to maximize discoverability',
      'Update metadata within 48 hours of upload for best indexing',
      'Monitor ranking position and adjust if needed',
    ]

    return NextResponse.json({
      competitors,
      titles,
      tags,
      seoScore,
      recommendations,
    })
  } catch (error) {
    console.error('Optimization error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate optimization'

    return NextResponse.json(
      {
        error: errorMessage,
        details: 'Please check that OPENROUTER_API_KEY is set and you have credits in your account'
      },
      { status: 500 }
    )
  }
}
