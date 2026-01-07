import axios from 'axios'

interface OptimizationRequest {
  currentTitle: string
  currentTags: string[]
  topic: string
  currentRank: number
  targetRank: number
}

interface OptimizationResult {
  newTitle: string
  newTags: string[]
  reasoning: string
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
  }

  async optimizeForRanking(req: OptimizationRequest): Promise<OptimizationResult> {
    const prompt = `You are a YouTube SEO expert. A video about "${req.topic}" is currently at rank ${req.currentRank} in search results.
    
Current title: "${req.currentTitle}"
Current tags: ${req.currentTags.join(', ')}

Target: Improve ranking to position ${req.targetRank}

Generate an improved title and tags that will help this video rank higher. Consider:
- Keyword optimization
- Click-through rate potential
- Search intent matching
- Competition analysis

Return your response as JSON with this structure:
{
  "newTitle": "optimized title here",
  "newTags": ["tag1", "tag2", ...],
  "reasoning": "brief explanation of changes"
}`

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3001',
            'X-Title': 'YouTube Optimizer',
          },
        }
      )

      const content = response.data.choices[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback
      return {
        newTitle: req.currentTitle,
        newTags: req.currentTags,
        reasoning: 'Failed to generate optimization',
      }
    } catch (error) {
      console.error('OpenRouter optimization error:', error)
      throw error
    }
  }

  async shouldOptimize(currentRank: number, targetRank: number, lastOptimized: Date | null): Promise<boolean> {
    // Don't optimize if already at or above target rank
    if (currentRank <= targetRank) {
      return false
    }

    // Don't optimize if last optimization was less than 24 hours ago
    if (lastOptimized) {
      const hoursSinceLastOptimization = (Date.now() - lastOptimized.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastOptimization < 24) {
        return false
      }
    }

    return true
  }
}

export const openRouterService = new OpenRouterService()
