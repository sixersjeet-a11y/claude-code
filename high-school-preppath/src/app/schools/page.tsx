import { db } from '@/lib/db';
import { SchoolCard } from '@/components/SchoolCard';

export default async function SchoolsExplorer({ searchParams }: { searchParams: Record<string, string> }) {
  const schools = await db.school.findMany({
    where: {
      state: searchParams.state || undefined,
      competitiveness: searchParams.competitiveness || undefined,
      religiousAffiliation: searchParams.religiousAffiliation || undefined,
      boardingAvailable: searchParams.boarding ? searchParams.boarding === 'true' : undefined,
      size: searchParams.minSize || searchParams.maxSize ? {
        gte: searchParams.minSize ? Number(searchParams.minSize) : undefined,
        lte: searchParams.maxSize ? Number(searchParams.maxSize) : undefined
      } : undefined
    },
    take: 60,
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-brand">School Explorer</h1>
      <form className="grid md:grid-cols-5 gap-3 card">
        <input name="state" placeholder="State" className="border rounded-lg px-3 py-2" />
        <input name="competitiveness" placeholder="Competitiveness" className="border rounded-lg px-3 py-2" />
        <input name="religiousAffiliation" placeholder="Religious affiliation" className="border rounded-lg px-3 py-2" />
        <select name="boarding" className="border rounded-lg px-3 py-2"><option value="">Boarding/Day</option><option value="true">Boarding</option><option value="false">Day</option></select>
        <button className="bg-brand text-white rounded-lg px-3">Filter</button>
      </form>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{schools.map((school) => <SchoolCard key={school.id} school={school} />)}</div>
    </div>
  );
}
