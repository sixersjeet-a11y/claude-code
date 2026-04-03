import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { transcript } = await req.json();
  const feedback = await runAI('Score interview responses across confidence, clarity, structure, and content. Return JSON.', transcript);
  return NextResponse.json({ feedback });
}
