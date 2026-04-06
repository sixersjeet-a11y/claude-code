import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get('q') || undefined;
  const state = searchParams.get('state') || undefined;
  const competitiveness = searchParams.get('competitiveness') || undefined;
  const religiousAffiliation = searchParams.get('religiousAffiliation') || undefined;
  const boarding = searchParams.get('boarding');
  const sizeMin = Number(searchParams.get('sizeMin') || 0);
  const sizeMax = Number(searchParams.get('sizeMax') || 0);

  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 25)));

  const where = {
    state,
    competitiveness,
    religiousAffiliation,
    boardingAvailable: boarding === null ? undefined : boarding === 'true',
    name: q ? { contains: q, mode: 'insensitive' as const } : undefined,
    size: sizeMin || sizeMax
      ? {
          gte: sizeMin || undefined,
          lte: sizeMax || undefined
        }
      : undefined
  };

  const [schools, total] = await Promise.all([
    db.school.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' }
    }),
    db.school.count({ where })
  ]);

  return NextResponse.json({
    data: schools,
    pagination: {
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize)
    }
  });
}
