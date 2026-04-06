import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SchoolProfile({ params }: { params: { id: string } }) {
  const school = await db.school.findUnique({ where: { id: params.id } });
  if (!school) notFound();

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="font-heading text-3xl text-brand">{school.name}</h1>
        <p>{school.city}, {school.state}</p>
        {school.websiteUrl && <Link className="text-accent underline" href={school.websiteUrl}>Visit Website</Link>}
      </section>
      <section className="grid md:grid-cols-2 gap-4">
        <div className="card"><h2 className="font-heading">Overview</h2><p className="text-sm mt-2">{school.schoolType} • {school.boardingAvailable ? 'Boarding + Day' : 'Day'}</p></div>
        <div className="card"><h2 className="font-heading">Quick Facts</h2><p className="text-sm mt-2">Acceptance Rate: {school.acceptanceRate ?? 'N/A'}% • Size: {school.size ?? 'N/A'}</p></div>
        <div className="card"><h2 className="font-heading">Academics</h2><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(school.academics ?? {}, null, 2)}</pre></div>
        <div className="card"><h2 className="font-heading">Admissions</h2><pre className="text-xs whitespace-pre-wrap">{JSON.stringify(school.admissions ?? {}, null, 2)}</pre></div>
      </section>
      <section className="card">
        <h2 className="font-heading text-xl text-brand">AI Insights</h2>
        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(school.aiInsights ?? { values: 'Intellectual curiosity', fit: 'Self-driven student', tips: 'Show initiative and clear goals.' }, null, 2)}</pre>
      </section>
    </div>
  );
}
