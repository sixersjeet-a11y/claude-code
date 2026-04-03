import { db } from '@/lib/db';
import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, answers } = await req.json();
  const schools = await db.school.findMany({ take: 30 });
  const prompt = `User preferences: ${JSON.stringify(answers)}. Schools: ${schools.map((s) => `${s.id}:${s.name}`).join(', ')}. Return JSON array with id,bucket,score,explanation.`;
  const result = await runAI('You are a school admissions strategist.', prompt);
  return NextResponse.json({ userId, recommendations: result });
}
