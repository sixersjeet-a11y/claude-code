import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { section, difficulty } = await req.json();
  const output = await runAI('Generate 5 SSAT questions with answers and explanations as JSON.', `Section: ${section}; Difficulty: ${difficulty}`);
  return NextResponse.json({ output });
}
