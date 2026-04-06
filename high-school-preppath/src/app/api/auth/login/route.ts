import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email }, include: { roles: true } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const role = user.roles[0]?.role || 'STUDENT';
  const token = await signToken({ sub: user.id, role });
  return NextResponse.json({ token });
}
