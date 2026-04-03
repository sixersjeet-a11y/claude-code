import Link from 'next/link';

export function SchoolCard({ school }: { school: any }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="font-heading text-lg text-brand">{school.name}</h3>
          <p className="text-sm">{school.city}, {school.state}</p>
        </div>
        <span className="text-xs rounded-full bg-slate-100 px-3 py-1">{school.competitiveness}</span>
      </div>
      <p className="text-sm mt-2">{school.boardingAvailable ? 'Boarding + Day' : 'Day School'}</p>
      <div className="mt-4 flex gap-2">
        <Link href={`/schools/${school.id}`} className="px-3 py-2 rounded-lg bg-brand text-white text-sm">View</Link>
        <button className="px-3 py-2 rounded-lg bg-accent text-white text-sm">Save</button>
      </div>
    </div>
  );
}
