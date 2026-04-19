import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

export async function POST(req: NextRequest) {
  const { question, password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 })
  }

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  })
  const embedding = embeddingResponse.data[0].embedding

  const { data: chunks } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.25,
    match_count: 8
  })

  if (!chunks || chunks.length === 0) {
    return NextResponse.json({ answer: 'Keine relevanten Informationen gefunden.' })
  }

  const context = chunks.map((c: any) => c.content).join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Du bist ein GENII M&A Assistent. Beantworte die Frage basierend auf diesem Kontext:\n\n${context}\n\nFrage: ${question}`
    }]
  })

  const answer = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ answer })
}