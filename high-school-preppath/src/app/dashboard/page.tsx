const blocks = ['Saved Schools', 'Matcher Results', 'Interview Sessions', 'SSAT Practice Scores', 'Essay Drafts', 'Application Checklist', 'Uploaded Documents'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-brand">Student Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map((b) => <div key={b} className="card"><h2 className="font-heading">{b}</h2><p className="text-sm mt-2">Recent activity and quick actions appear here.</p></div>)}
      </div>
    </div>
  );
}
