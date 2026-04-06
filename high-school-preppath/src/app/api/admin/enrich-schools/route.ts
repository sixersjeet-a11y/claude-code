import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { runAI } from '@/lib/ai';
import { NextResponse } from 'next/server';

export async function POST() {
  const schools = await db.school.findMany({
    where: { aiInsights: { equals: Prisma.AnyNull } },
    take: 20
  });

  for (const school of schools) {
    const output = await runAI(
      'You generate concise school insights in JSON.',
      `School: ${school.name}, ${school.city}, ${school.state}`
    );

    await db.school.update({
      where: { id: school.id },
      data: { aiInsights: { raw: output } }
    });
  }

  return NextResponse.json({ enriched: schools.length });
}
