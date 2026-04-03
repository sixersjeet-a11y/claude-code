import Link from 'next/link';

const features = ['School Discovery', 'AI Matcher', 'Interview Coach', 'SSAT Practice', 'Application Checklist', 'Parent Collaboration'];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="card bg-gradient-to-r from-brand to-accent text-white">
        <h1 className="text-4xl font-heading mb-3">Find your best-fit high school path.</h1>
        <p className="max-w-2xl">PrepPath helps students and families discover, compare, and prepare applications for selective high schools.</p>
        <Link href="/schools" className="inline-block mt-4 bg-white text-brand px-4 py-2 rounded-xl font-semibold">Explore Schools</Link>
      </section>
      <section className="grid md:grid-cols-3 gap-4">{features.map((f) => <div key={f} className="card"><h3 className="font-heading">{f}</h3></div>)}</section>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card"><p className="text-3xl font-heading text-brand">500+</p><p>Northeast schools indexed</p></div>
        <div className="card"><p className="text-3xl font-heading text-brand">6</p><p>AI preparation tools</p></div>
        <div className="card"><p className="text-3xl font-heading text-brand">24/7</p><p>Family progress visibility</p></div>
      </section>
    </div>
  );
}
