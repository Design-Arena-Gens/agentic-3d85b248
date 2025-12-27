import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { topic, tone, length } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    // Generate post using Claude/Anthropic API
    const post = await generateLinkedInPost(topic, tone, length)

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    )
  }
}

async function generateLinkedInPost(
  topic: string,
  tone: string,
  length: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    // Fallback to template-based generation if no API key
    return generateTemplatePost(topic, tone, length)
  }

  try {
    const lengthGuide = {
      short: '100-150 words, concise and punchy',
      medium: '200-300 words, balanced and engaging',
      long: '400-500 words, detailed and comprehensive'
    }

    const toneGuide = {
      professional: 'professional, authoritative, and business-focused',
      casual: 'friendly, conversational, and approachable',
      inspirational: 'motivational, uplifting, and thought-provoking'
    }

    const prompt = `Write a compelling LinkedIn post about: "${topic}"

Requirements:
- Tone: ${toneGuide[tone as keyof typeof toneGuide]}
- Length: ${lengthGuide[length as keyof typeof lengthGuide]}
- Include relevant hashtags (3-5)
- Start with a strong hook
- Use short paragraphs and line breaks for readability
- Include a call-to-action or question at the end
- Make it engaging and shareable
- Write in a natural, human voice

DO NOT include any meta-commentary, explanations, or notes. ONLY return the LinkedIn post content itself.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    return generateTemplatePost(topic, tone, length)
  }
}

function generateTemplatePost(
  topic: string,
  tone: string,
  length: string
): string {
  const hooks = {
    professional: [
      `Here's something I've been thinking about: ${topic}`,
      `Let's talk about ${topic} and why it matters`,
      `${topic} is transforming how we work. Here's my take:`,
    ],
    casual: [
      `Hey LinkedIn fam! Let's chat about ${topic}`,
      `Real talk about ${topic}...`,
      `Just had some thoughts on ${topic} that I wanted to share`,
    ],
    inspirational: [
      `${topic} has the power to change everything. Here's why:`,
      `What if I told you that ${topic} could transform your career?`,
      `The future of ${topic} is brighter than you think.`,
    ]
  }

  const bodies = {
    short: `
${topic} is more relevant today than ever before.

The key insights:
• Innovation is accelerating
• Adaptation is essential
• The future is now

What's your take on this?`,
    medium: `
${topic} is more relevant today than ever before.

In my experience, I've seen how this impacts our daily work and long-term goals. The landscape is changing rapidly, and those who adapt will thrive.

Here are three key takeaways:
• Understanding the fundamentals is crucial
• Implementation requires strategic thinking
• Continuous learning is non-negotiable

The question isn't whether to engage with ${topic}, but how to do it effectively.

Success comes from taking action, learning from failures, and staying curious.

What's your approach to ${topic}? I'd love to hear your thoughts.`,
    long: `
${topic} is more relevant today than ever before, and I believe we're at a pivotal moment.

Over the past few years, I've observed significant shifts in how we approach this space. The traditional methods are being challenged, and new opportunities are emerging for those ready to embrace change.

Here's what I've learned:

1. Foundation Matters
Building a strong understanding is the first step. Without solid fundamentals, it's easy to get lost in the complexity.

2. Practical Application
Theory is important, but implementation is where real value is created. Start small, iterate, and scale what works.

3. Community and Collaboration
No one succeeds alone. Engage with others, share insights, and learn from diverse perspectives.

4. Adaptability is Key
The only constant is change. Those who remain flexible and open to new ideas will find themselves ahead of the curve.

The future of ${topic} is being written right now, and each of us has a role to play in shaping it.

My challenge to you: Take one action this week related to ${topic}. It doesn't have to be big – just meaningful.

What's one thing you're going to do differently? Drop your thoughts in the comments.`
  }

  const hashtags = {
    professional: '#Leadership #BusinessStrategy #ProfessionalDevelopment #CareerGrowth #Innovation',
    casual: '#LinkedInCommunity #CareerTips #ProfessionalGrowth #Networking #WorkLife',
    inspirational: '#Motivation #Success #GrowthMindset #Inspiration #CareerDevelopment'
  }

  const hook = hooks[tone as keyof typeof hooks][Math.floor(Math.random() * 3)]
  const body = bodies[length as keyof typeof bodies]
  const tags = hashtags[tone as keyof typeof hashtags]

  return `${hook}

${body}

${tags}`
}
