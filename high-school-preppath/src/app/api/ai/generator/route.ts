import { db } from '@/lib/db';
import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const schools = await db.school.findMany({ take: 100 });
  const result = await runAI('Create ideal school profile then map 10 closest real schools as JSON.', `${description}\nSchools:${JSON.stringify(schools.map((s) => ({ id: s.id, name: s.name, state: s.state, competitiveness: s.competitiveness })))} `);
  return NextResponse.json({ result });
}
