import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runAI(system: string, prompt: string) {
  const response = await client.responses.create({
    model: 'gpt-4.1-mini',
    input: [{ role: 'system', content: system }, { role: 'user', content: prompt }]
  });
  return response.output_text;
}
