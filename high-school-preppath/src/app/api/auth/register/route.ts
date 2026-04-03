import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hash = await hashPassword(body.password);
  const user = await db.user.create({
    data: {
      email: body.email,
      fullName: body.fullName,
      passwordHash: hash,
      roles: { create: [{ role: body.role || 'STUDENT' }] }
    }
  });
  const token = await signToken({ sub: user.id, role: body.role || 'STUDENT' });
  return NextResponse.json({ userId: user.id, token });
}
