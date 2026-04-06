import { db } from '@/lib/db';
import { persistFile } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const userId = String(form.get('userId') || '');
  const schoolId = form.get('schoolId') ? String(form.get('schoolId')) : null;
  const file = form.get('file') as File | null;
  if (!file || !userId) return NextResponse.json({ error: 'file and userId required' }, { status: 400 });

  const storagePath = await persistFile(file.name, await file.arrayBuffer());
  const doc = await db.document.create({ data: {
    userId, schoolId, fileName: file.name, mimeType: file.type || 'application/octet-stream',
    storagePath, sizeBytes: file.size
  }});

  return NextResponse.json(doc);
}
