import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.school.upsert({
    where: { slug: 'sample-academy-boston-ma' },
    update: {},
    create: {
      name: 'Sample Academy', slug: 'sample-academy-boston-ma', city: 'Boston', state: 'MA',
      schoolType: 'Private', competitiveness: 'High', boardingAvailable: false
    }
  });
}

main().finally(() => prisma.$disconnect());
