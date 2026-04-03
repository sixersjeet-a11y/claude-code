import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { mode, context } = await req.json();
  const output = await runAI('You assist with essays, activities, emails, and parent summaries.', `Mode: ${mode}\nContext:${JSON.stringify(context)}`);
  return NextResponse.json({ output });
}
