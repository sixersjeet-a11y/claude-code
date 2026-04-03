import { db } from '@/lib/db';
import { runAI } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { schoolId, studentProfile } = await req.json();
  const school = await db.school.findUnique({ where: { id: schoolId } });
  if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 });
  const output = await runAI('Generate actionable admissions plan with timeline.', `School: ${school.name}. Student: ${JSON.stringify(studentProfile)}`);
  return NextResponse.json({ output });
}
