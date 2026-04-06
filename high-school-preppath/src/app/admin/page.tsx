export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl text-brand">Admin Panel</h1>
      <div className="card">Import datasets via <code>/api/import-schools</code>.</div>
      <div className="card">Trigger AI enrichment via <code>/api/admin/enrich-schools</code>.</div>
      <div className="card">Monitor user growth via analytics provider (e.g., PostHog).</div>
    </div>
  );
}
