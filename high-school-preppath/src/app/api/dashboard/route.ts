import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const [savedSchools, matcherResults, interviewSessions, ssatPractice, essays, checklistTasks, documents] = await Promise.all([
    db.savedSchool.findMany({ where: { userId }, include: { school: true }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.matcherResult.findMany({ where: { userId }, include: { school: true }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.interviewSession.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.sSATPractice.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } }),
    db.essay.findMany({ where: { userId }, take: 5, orderBy: { updatedAt: 'desc' } }),
    db.checklistTask.findMany({ where: { userId }, include: { school: true }, take: 8, orderBy: { dueDate: 'asc' } }),
    db.document.findMany({ where: { userId }, take: 5, orderBy: { createdAt: 'desc' } })
  ]);

  return NextResponse.json({ savedSchools, matcherResults, interviewSessions, ssatPractice, essays, checklistTasks, documents });
}
