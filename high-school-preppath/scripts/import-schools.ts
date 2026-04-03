import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

function slugify(v: string) { return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

async function main() {
  const csvFile = process.argv[2] || 'schools_full.csv';
  const content = readFileSync(csvFile, 'utf8');
  const rows = parse(content, { columns: true, skip_empty_lines: true });

  let inserted = 0;
  for (const row of rows) {
    if (!row.name || !row.city || !row.state) continue;
    const slug = slugify(`${row.name}-${row.city}-${row.state}`);
    const exists = await prisma.school.findFirst({ where: { OR: [{ ncesId: row.nces_id || undefined }, { slug }] } });
    if (exists) continue;
    await prisma.school.create({ data: {
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

  console.log(`Processed ${rows.length}, inserted ${inserted}`);
}

main().finally(() => prisma.$disconnect());
