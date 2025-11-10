const axios = require('axios')
const config = require('../../config/env')

class OpenAIService {
  constructor() {
    this.apiKey = config.ai.openai.apiKey
    this.model = config.ai.openai.model
    this.baseURL = 'https://api.openai.com/v1'
    
    if (!this.apiKey) {
      console.warn('⚠️  OpenAI API key not configured')
    }
  }

  /**
   * Generate post content using OpenAI
   */
  async generatePost(prompt, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert social media content creator specializing in personal branding. Create engaging, authentic posts that match the user\'s voice and goals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: options.temperature || config.ai.openai.temperature,
          max_tokens: options.maxTokens || config.ai.openai.maxTokens,
          n: options.variants || 1,
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const choices = response.data.choices
      return choices.map(choice => ({
        content: choice.message.content.trim(),
        finishReason: choice.finish_reason
      }))
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message)
      throw new Error(`Failed to generate post: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/embeddings`,
        {
          model: 'text-embedding-3-small',
          input: text
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.data[0].embedding
    } catch (error) {
      console.error('OpenAI embedding error:', error.response?.data || error.message)
      throw new Error(`Failed to generate embedding: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * Analyze post performance and provide insights
   */
  async analyzePostPerformance(post, metrics) {
    const prompt = `Analyze this social media post performance:

Post: "${post.content}"
Likes: ${metrics.likes}
Comments: ${metrics.comments}
Shares: ${metrics.shares}
Impressions: ${metrics.impressions}

Provide:
1. What worked well
2. What could be improved
3. Specific recommendations for future posts
4. Engagement rate analysis

Keep it concise and actionable.`

    const results = await this.generatePost(prompt, { maxTokens: 500 })
    return results[0].content
  }

  /**
   * Generate persona-based content prompt
   */
  buildPersonaPrompt(persona, trend = null, context = {}) {
    let prompt = `Create a ${context.platform || 'social media'} post for:\n\n`
    
    // Persona details
    prompt += `Role: ${persona.name}\n`
    prompt += `Industry: ${persona.persona.industry}\n`
    prompt += `Target Audience: ${persona.persona.targetAudience}\n`
    prompt += `Tone: ${persona.persona.toneOfVoice}\n`
    
    if (persona.persona.keywords.length > 0) {
      prompt += `Key Topics: ${persona.persona.keywords.join(', ')}\n`
    }

    prompt += `\n`

    // Trend context
    if (trend) {
      prompt += `Trending Topic: ${trend.title}\n`
      if (trend.description) {
        prompt += `Context: ${trend.description}\n`
      }
      prompt += `\n`
    }

    // Content type
    if (context.contentType) {
      prompt += `Content Type: ${context.contentType}\n`
    }

    // Additional context
    if (context.idea) {
      prompt += `User's Idea: ${context.idea}\n`
    }

    if (context.goal) {
      prompt += `Goal: ${context.goal}\n`
    }

    // Instructions
    prompt += `\nRequirements:\n`
    prompt += `- Match the specified tone and voice\n`
    prompt += `- Be authentic and engaging\n`
    prompt += `- Include relevant hashtags if appropriate\n`
    prompt += `- Keep it concise and impactful\n`
    
    if (context.platform === 'twitter') {
      prompt += `- Stay under 280 characters\n`
    } else if (context.platform === 'linkedin') {
      prompt += `- Professional yet personable\n`
      prompt += `- Can be longer form (up to 1300 characters)\n`
    }

    if (persona.aiSettings.includeEmojis) {
      prompt += `- Use emojis strategically\n`
    }

    if (persona.aiSettings.avoidTopics.length > 0) {
      prompt += `- Avoid: ${persona.aiSettings.avoidTopics.join(', ')}\n`
    }

    return prompt
  }

  /**
   * Generate multiple post variants
   */
  async generateVariants(persona, trend, count = 3) {
    const prompt = this.buildPersonaPrompt(persona, trend, {
      platform: 'twitter',
      contentType: 'engaging'
    })

    return await this.generatePost(prompt, { variants: count })
  }

  /**
   * Improve existing post
   */
  async improvePost(originalPost, feedback) {
    const prompt = `Improve this social media post:

Original: "${originalPost}"

Feedback: ${feedback}

Provide an improved version that addresses the feedback while maintaining the core message.`

    const results = await this.generatePost(prompt, { maxTokens: 300 })
    return results[0].content
  }

  /**
   * Generate weekly insights
   */
  async generateWeeklyInsights(userData) {
    const prompt = `Generate weekly growth insights for a user:

Posts Published: ${userData.postsPublished}
Total Engagement: ${userData.totalEngagement}
Follower Growth: ${userData.followerGrowth}
Top Performing Post: "${userData.topPost}"
Engagement Rate: ${userData.engagementRate}%

Provide:
1. Key achievements this week
2. What's working well
3. Areas for improvement
4. Specific recommendations for next week

Keep it motivating and actionable.`

    const results = await this.generatePost(prompt, { maxTokens: 600 })
    return results[0].content
  }
}

module.exports = new OpenAIService()
