import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const state = searchParams.get('state') || undefined;

  const schools = await db.school.findMany({
    where: {
      state,
      name: q ? { contains: q, mode: 'insensitive' } : undefined
    },
    take: 50,
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(schools);
}
