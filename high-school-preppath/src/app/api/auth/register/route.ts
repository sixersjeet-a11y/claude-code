import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(120),
  password: z.string().min(8).max(128),
  role: z.enum(['STUDENT', 'PARENT']).optional()
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, fullName, password, role = 'STUDENT' } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const hash = await hashPassword(password);
  const user = await db.user.create({
    data: {
      email,
      fullName,
      passwordHash: hash,
      roles: { create: [{ role }] }
    }
  });

  const token = await signToken({ sub: user.id, role });
  return NextResponse.json({ userId: user.id, token });
}
