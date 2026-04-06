import { db } from '@/lib/db';
import { parse } from 'csv-parse/sync';
import { NextRequest, NextResponse } from 'next/server';

type CsvRow = Record<string, string>;

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseBoolean(value: unknown) {
  if (typeof value !== 'string') return false;
  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase().trim());
}

function parseInteger(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.replace(/[^\d.-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? Math.round(num) : null;
}

function parseAcceptanceRate(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const cleaned = value.replace(/[^\d.-]/g, '');
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return null;
  return numeric > 1 ? Number((numeric / 100).toFixed(4)) : Number(numeric.toFixed(4));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const csv = await file.text();
  const rows = parse(csv, { columns: true, skip_empty_lines: true }) as CsvRow[];

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name || !row.state || !row.city) {
      skipped++;
      continue;
    }

    const slug = slugify(`${row.name}-${row.city}-${row.state}`);
    const ncesId = row.nces_id?.trim() || null;

    const exists = await db.school.findFirst({
      where: {
        OR: [
          { slug },
          ...(ncesId ? [{ ncesId }] : [])
        ]
      },
      select: { id: true }
    });

    if (exists) {
      skipped++;
      continue;
    }

    await db.school.create({
      data: {
        ncesId,
        name: row.name.trim(),
        slug,
        city: row.city.trim(),
        state: row.state.trim().toUpperCase(),
        schoolType: row.school_type?.trim() || 'Private',
        religiousAffiliation: row.religious_affiliation?.trim() || null,
        size: parseInteger(row.size),
        tuition: parseInteger(row.tuition),
        acceptanceRate: parseAcceptanceRate(row.acceptance_rate),
        competitiveness: row.competitiveness?.trim() || 'Moderate',
        boardingAvailable: parseBoolean(row.boarding_available),
        websiteUrl: row.website_url?.trim() || null
      }
    });

    inserted++;
  }

  await db.schoolImportJob.create({
    data: {
      sourceName: file.name,
      processed: rows.length,
      inserted,
      skipped
    }
  });

  return NextResponse.json({ processed: rows.length, inserted, skipped });
}
