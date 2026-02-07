export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Customer Support
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Track and respond to customer support requests in one place.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 px-5 py-6 text-sm text-neutral-400">
        Support inbox is coming next. Use this area to list tickets, messages,
        and escalation notes.
      </div>
    </div>
  );
}
