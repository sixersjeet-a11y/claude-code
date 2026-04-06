export default function ContactPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl text-brand">Contact</h1>
      <form className="card space-y-3">
        <input placeholder="Name" className="w-full border rounded-lg px-3 py-2" />
        <input placeholder="Email" className="w-full border rounded-lg px-3 py-2" />
        <textarea placeholder="Message" className="w-full border rounded-lg px-3 py-2" rows={4} />
        <button className="bg-brand text-white rounded-lg px-4 py-2">Send</button>
      </form>
      <form className="card space-y-3">
        <h2 className="font-heading">Beta Tester Signup</h2>
        <input placeholder="Email" className="w-full border rounded-lg px-3 py-2" />
        <button className="bg-accent text-white rounded-lg px-4 py-2">Join Beta</button>
      </form>
    </div>
  );
}
