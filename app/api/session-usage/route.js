import Anthropic from '@anthropic-ai/sdk'

const SESSION_ID = 'sesn_01VqZTqWVuuLBdayQE34m1t5'
const BETA       = 'managed-agents-2026-04-01'

export async function GET() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const session = await client.beta.sessions.retrieve(SESSION_ID, { betas: [BETA] })
    return Response.json({ usage: session.usage ?? null })
  } catch (err) {
    return Response.json({ usage: null, error: err.message }, { status: 500 })
  }
}
