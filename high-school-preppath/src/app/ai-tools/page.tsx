import Link from 'next/link';

const tools = [
  ['AI School Matcher', '/api/ai/matcher'],
  ['AI School Generator', '/api/ai/generator'],
  ['AI Interview Coach', '/api/ai/interview-coach'],
  ['Improve Your Chances', '/api/ai/improve-chances'],
  ['SSAT Practice Tool', '/api/ai/ssat'],
  ['Application Assistant', '/api/ai/application-assistant']
];

export default function AIToolsPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl text-brand">AI Tools Hub</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(([name, href]) => (
          <div key={name} className="card">
            <h2 className="font-heading">{name}</h2>
            <Link href={href} className="inline-block mt-3 text-accent underline">Open endpoint</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
