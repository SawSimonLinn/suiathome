import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
  ingredients: `You are a professional recipe writer. Given a description or notes about a dish, generate a clean, structured ingredient list.

Format rules:
- One ingredient per line
- Use the format: "quantity - ingredient name"  (e.g. "200g - Spaghetti", "2 large - Eggs", "1 tsp - Salt")
- If there is no specific quantity, just write the ingredient name
- Use metric units where possible
- Be precise and complete
- Do NOT include any headers, bullets, numbers, or extra formatting - just plain lines`,

  instructions: `You are a professional recipe writer. Given a description or notes about a dish, generate clear, numbered cooking instructions.

Format rules:
- One step per line
- Write each step as a complete, actionable sentence
- Be specific about temperatures, times, and techniques
- Do NOT include numbers at the start of lines - just plain text steps, one per line
- Do NOT include any headers, bullets, or extra formatting - just plain lines`,
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key is not configured.' }, { status: 500 });
  }

  let body: { section: string; context: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { section, context } = body;

  if (!section || !['ingredients', 'instructions'].includes(section)) {
    return NextResponse.json({ error: 'section must be "ingredients" or "instructions".' }, { status: 400 });
  }

  if (!context || !context.trim()) {
    return NextResponse.json({ error: 'context is required.' }, { status: 400 });
  }

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[section] },
        { role: 'user', content: context.trim() },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpenAI request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
