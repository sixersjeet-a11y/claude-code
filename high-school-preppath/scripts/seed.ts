import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATES = ['MA', 'NY', 'CT', 'RI', 'NJ', 'PA', 'NH', 'VT', 'ME'] as const;
const CITIES: Record<(typeof STATES)[number], string[]> = {
  MA: ['Boston', 'Cambridge', 'Worcester', 'Newton'],
  NY: ['New York', 'Buffalo', 'Rochester', 'Albany'],
  CT: ['Hartford', 'New Haven', 'Stamford', 'Bridgeport'],
  RI: ['Providence', 'Warwick', 'Cranston'],
  NJ: ['Newark', 'Jersey City', 'Princeton', 'Hoboken'],
  PA: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Harrisburg'],
  NH: ['Concord', 'Manchester', 'Nashua'],
  VT: ['Burlington', 'Montpelier', 'Rutland'],
  ME: ['Portland', 'Bangor', 'Augusta']
};

const COMPETITIVENESS = ['Very High', 'High', 'Moderate'];
const SCHOOL_TYPES = ['Private', 'Boarding', 'Magnet', 'Selective Public'];
const RELIGIOUS = ['None', 'Catholic', 'Episcopal', 'Jewish'];

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const schools = [];

  let id = 100000;
  for (const state of STATES) {
    const cities = CITIES[state];
    for (let i = 0; i < 80; i++) {
      const city = cities[i % cities.length];
      const name = `${state} Prep Academy ${i + 1}`;
      schools.push({
        ncesId: String(id++),
        name,
        slug: slugify(`${name}-${city}-${state}`),
        city,
        state,
        schoolType: SCHOOL_TYPES[i % SCHOOL_TYPES.length],
        religiousAffiliation: RELIGIOUS[i % RELIGIOUS.length],
        size: 250 + (i % 30) * 35,
        tuition: 18000 + (i % 25) * 1500,
        acceptanceRate: Number((0.12 + (i % 35) * 0.015).toFixed(3)),
        competitiveness: COMPETITIVENESS[i % COMPETITIVENESS.length],
        boardingAvailable: i % 3 === 0,
        websiteUrl: `https://example.org/${slugify(name)}`
      });
    }
  }

  await prisma.school.createMany({ data: schools, skipDuplicates: true });

  await prisma.school.upsert({
    where: { slug: 'sample-academy-boston-ma' },
    update: {},
    create: {
      name: 'Sample Academy',
      slug: 'sample-academy-boston-ma',
      city: 'Boston',
      state: 'MA',
      schoolType: 'Private',
      competitiveness: 'High',
      boardingAvailable: false
    }
  });

  console.log(`Seeded up to ${schools.length + 1} schools.`);
}

main().finally(() => prisma.$disconnect());
