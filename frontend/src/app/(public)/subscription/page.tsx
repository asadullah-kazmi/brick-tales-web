import Link from "next/link";
import type { Metadata } from "next";
import { SITE_BRAND, SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description: `Compare ${SITE_BRAND} plans: Fan, Mega Fan, and Ultimate. Ad-free, multi-device, downloads, simulcasts, and more.`,
  openGraph: {
    title: `Subscription Plans | ${SITE_BRAND}`,
    description: `Compare plans and start your free trial.`,
    url: absoluteUrl("/subscription"),
    type: "website",
  },
  alternates: { canonical: absoluteUrl("/subscription") },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 flex-shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 flex-shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function BenefitValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="flex items-center gap-2 text-green-700 dark:text-green-400">
        <CheckIcon />
        <span>Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span
        className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500"
        aria-label="Not included"
      >
        <XIcon className="text-neutral-400 dark:text-neutral-500" />
        <span>—</span>
      </span>
    );
  }
  return (
    <span className="font-medium text-neutral-800 dark:text-neutral-200">
      {value}
    </span>
  );
}

export default function SubscriptionPage() {
  return (
    <main
      id="main"
      className="flex-1 px-4 py-10 sm:px-6 lg:px-8"
      role="main"
      aria-label="Subscription plans comparison"
    >
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl">
            Choose your plan
          </h1>
          <p className="mt-2 max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
            {SITE_DESCRIPTION} Compare Fan, Mega Fan, and Ultimate. Start with a
            free trial.
          </p>
        </header>

        <section
          className="mt-10 grid gap-6 sm:gap-8 lg:grid-cols-3"
          aria-label="Subscription plans"
        >
          {SUBSCRIPTION_PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800",
                plan.featured
                  ? "border-2 border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-neutral-100/10 lg:scale-105 lg:shadow-lg"
                  : "border-neutral-200 dark:border-neutral-800",
              )}
              aria-labelledby={`plan-${plan.id}-title`}
            >
              <div className="p-6 sm:p-8">
                {plan.featured && (
                  <p
                    className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-100"
                    aria-hidden
                  >
                    Most popular
                  </p>
                )}
                <h2
                  id={`plan-${plan.id}-title`}
                  className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl"
                >
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-400">
                    /{plan.period}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-500">
                  {plan.trialDays}-day free trial
                </p>

                <ul
                  className="mt-6 space-y-4"
                  aria-label={`${plan.name} benefits`}
                >
                  {plan.benefits.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {item.label}
                      </span>
                      <BenefitValue value={item.value} />
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3">
                  <Link
                    href={`/signup?plan=${plan.id}&trial=1`}
                    className={cn(
                      "inline-flex h-12 items-center justify-center rounded-lg px-6 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900",
                      plan.featured
                        ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                        : "border-2 border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
                    )}
                    aria-label={`Start ${plan.trialDays}-day free trial for ${plan.name}`}
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href={`/signup?plan=${plan.id}`}
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-neutral-100 px-6 text-base font-medium text-neutral-900 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900"
                    aria-label={`Subscribe to ${plan.name} now`}
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Cancel anytime. No commitment. Terms apply.
        </p>
      </div>
    </main>
  );
}
