import { db } from '@/lib/db';
import { parse } from 'csv-parse/sync';
import { NextRequest, NextResponse } from 'next/server';

function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

  const csv = await file.text();
  const rows = parse(csv, { columns: true, skip_empty_lines: true });
  let inserted = 0;

  for (const row of rows) {
    if (!row.name || !row.state || !row.city) continue;
    const slug = slugify(`${row.name}-${row.city}-${row.state}`);
    const exists = await db.school.findFirst({ where: { OR: [{ ncesId: row.nces_id || undefined }, { slug }] } });
    if (exists) continue;
    await db.school.create({ data: {
      ncesId: row.nces_id || null,
      name: row.name,
      slug,
      city: row.city,
      state: row.state,
      schoolType: row.school_type || 'Private',
      religiousAffiliation: row.religious_affiliation || null,
      size: row.size ? Number(row.size) : null,
      tuition: row.tuition ? Number(row.tuition) : null,
      acceptanceRate: row.acceptance_rate ? Number(row.acceptance_rate) : null,
      competitiveness: row.competitiveness || 'Moderate',
      boardingAvailable: row.boarding_available === 'true',
      websiteUrl: row.website_url || null
    }});
    inserted++;
  }

  return NextResponse.json({ processed: rows.length, inserted });
}
