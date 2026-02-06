import Link from "next/link";
import { Button } from "@/components/ui";

const INVOICES = [
  { id: "INV-1043", date: "Jan 18, 2026", amount: "$12.00" },
  { id: "INV-1039", date: "Dec 18, 2025", amount: "$12.00" },
  { id: "INV-1031", date: "Nov 18, 2025", amount: "$12.00" },
];

export default function SubscriptionPage() {
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Subscription
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Keep your plan in sync
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Review your plan, billing, and payment methods.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
              Current plan
            </p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Starter</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Full access on all devices with HD streaming.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3 text-right">
                <p className="text-xs text-neutral-500">Next charge</p>
                <p className="text-sm font-semibold text-white">Feb 18, 2026</p>
                <p className="text-xs text-neutral-500">$12.00 / month</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/subscription">
                <Button type="button">Manage plan</Button>
              </Link>
              <Button type="button" variant="outline">
                Change billing cycle
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">Payment method</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Keep your default card updated to avoid interruptions.
            </p>
            <div className="mt-5 rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Visa ending in 2049
                  </p>
                  <p className="text-xs text-neutral-400">Expires 09/27</p>
                </div>
                <Button type="button" size="sm" variant="outline">
                  Update card
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">
              Billing history
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Recent invoices for your records.
            </p>
            <div className="mt-5 space-y-3">
              {INVOICES.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {invoice.id}
                    </p>
                    <p className="text-xs text-neutral-400">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {invoice.amount}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-neutral-400 hover:text-accent"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">Need help?</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Billing questions or plan changes can be handled anytime.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm">
                Contact support
              </Button>
              <Button type="button" size="sm">
                View FAQs
              </Button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
