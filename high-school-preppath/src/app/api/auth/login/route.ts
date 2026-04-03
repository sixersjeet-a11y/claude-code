import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = await db.user.findUnique({ where: { email: body.email }, include: { roles: true } });
  if (!user || !(await comparePassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await signToken({ sub: user.id, role: user.roles[0]?.role || 'STUDENT' });
  return NextResponse.json({ token });
}
