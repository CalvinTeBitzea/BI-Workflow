import Anthropic from '@anthropic-ai/sdk'

const SESSION_ID = 'sesn_01VqZTqWVuuLBdayQE34m1t5'
const BETA       = 'managed-agents-2025-05-14'

// Allow up to 5-minute responses for long agent runs
export const maxDuration = 300

export async function POST(request) {
  const { message } = await request.json()

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Send the user message to the Managed Agent session
  await client.beta.sessions.events.send(SESSION_ID, {
    events: [{ type: 'user.message', content: [{ type: 'text', text: message }] }],
    betas: [BETA],
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        const stream = client.beta.sessions.events.stream(SESSION_ID, { betas: [BETA] })

        for await (const event of stream) {
          const t = event.type

          if (t === 'agent.message') {
            const text = (event.content ?? []).map((b) => b.text ?? '').join('')
            send({ type: 'message', text })
          } else if (t === 'agent.thinking') {
            send({ type: 'thinking' })
          } else if (t === 'agent.tool_use') {
            send({ type: 'tool', name: event.name ?? 'tool' })
          } else if (t === 'session.status_idle') {
            send({ type: 'done' })
            break
          } else if (t === 'session.error' || t === 'session.status_terminated') {
            send({ type: 'error', message: t })
            break
          }
        }
      } catch (err) {
        const msg = err?.message ?? String(err)
        const send2 = (data) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        send2({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection:      'keep-alive',
    },
  })
}
