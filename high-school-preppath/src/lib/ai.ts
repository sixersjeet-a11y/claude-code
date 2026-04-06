import OpenAI from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export async function runAI(system: string, prompt: string) {
  if (!client) {
    return 'AI unavailable: OPENAI_API_KEY is not configured.';
  }

  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ]
  });

  return response.output_text;
}
