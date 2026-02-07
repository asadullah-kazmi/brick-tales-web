import Link from "next/link";
import type { Metadata } from "next";
import { SITE_BRAND, SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";
import { cn } from "@/lib/utils";
import { subscriptionService } from "@/lib/services";
import type { PublicPlanDto } from "@/types/api";

function TvIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-10 w-10 sm:h-12 sm:w-12", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-10 w-10 sm:h-12 sm:w-12", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-10 w-10 sm:h-12 sm:w-12", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

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

export default async function SubscriptionPage() {
  const apiPlans: PublicPlanDto[] = await subscriptionService
    .getPlans()
    .catch(() => []);
  const apiPlanMap = new Map(
    apiPlans.map((plan) => [plan.name.toLowerCase(), plan]),
  );
  const extraPlans = apiPlans.filter(
    (plan) =>
      !SUBSCRIPTION_PLANS.some(
        (local) => local.name.toLowerCase() === plan.name.toLowerCase(),
      ),
  );
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

        {/* Watch Anywhere — device icons + multi-device per tier */}
        <section
          className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-8 dark:border-neutral-700 dark:bg-neutral-900/30 sm:px-8 sm:py-10"
          aria-labelledby="watch-anywhere-heading"
        >
          <h2
            id="watch-anywhere-heading"
            className="text-center text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl"
          >
            Watch Anywhere
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Stream on TV, phone, and tablet. Multi-device support depends on
            your plan.
          </p>
          <div
            className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
            aria-hidden
          >
            <span className="flex flex-col items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <TvIcon className="text-neutral-700 dark:text-neutral-300" />
              <span className="text-xs font-medium">TV</span>
            </span>
            <span className="flex flex-col items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <PhoneIcon className="text-neutral-700 dark:text-neutral-300" />
              <span className="text-xs font-medium">Phone</span>
            </span>
            <span className="flex flex-col items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <TabletIcon className="text-neutral-700 dark:text-neutral-300" />
              <span className="text-xs font-medium">Tablet</span>
            </span>
          </div>
          <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <p className="text-center text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Multi-device support per tier
            </p>
            <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400 sm:gap-x-8">
              <li>
                <strong className="text-neutral-900 dark:text-white">
                  Fan:
                </strong>{" "}
                1 device at a time
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-white">
                  Mega Fan:
                </strong>{" "}
                Up to 4 devices
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-white">
                  Ultimate:
                </strong>{" "}
                Up to 6 devices
              </li>
            </ul>
          </div>
        </section>

        <section
          className="mt-10 grid gap-6 sm:gap-8 lg:grid-cols-3"
          aria-label="Subscription plans"
        >
          {SUBSCRIPTION_PLANS.map((plan) =>
            (() => {
              const apiPlan = apiPlanMap.get(plan.name.toLowerCase());
              return (
                <article
                  key={plan.id}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-white shadow-sm dark:bg-neutral-900/50 dark:border-neutral-700",
                    plan.featured
                      ? "border-2 border-accent ring-2 ring-accent/20 lg:scale-105 lg:shadow-lg dark:shadow-accent-glow"
                      : "border-neutral-200 dark:border-neutral-700",
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
                    {apiPlan?.perks?.length ? (
                      <div className="mt-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                          Extra perks
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                          {apiPlan.perks.map((perk) => (
                            <li key={perk} className="flex items-start gap-2">
                              <CheckIcon className="mt-0.5 text-green-600 dark:text-green-400" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="mt-8 flex flex-col gap-3">
                      <Link
                        href={`/signup?plan=${plan.id}&trial=1`}
                        className={cn(
                          "inline-flex h-12 items-center justify-center rounded-lg px-6 text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:focus-visible:ring-offset-off-black",
                          plan.featured
                            ? "bg-accent text-accent-foreground shadow-accent-glow hover:bg-accent/90"
                            : "border-2 border-accent bg-transparent text-neutral-900 hover:bg-accent/10 dark:text-accent dark:hover:bg-accent/10",
                        )}
                        aria-label={`Start ${plan.trialDays}-day free trial for ${plan.name}`}
                      >
                        Start Free Trial
                      </Link>
                      <Link
                        href={`/signup?plan=${plan.id}`}
                        className="inline-flex h-12 items-center justify-center rounded-lg bg-neutral-100 px-6 text-base font-medium text-neutral-900 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-accent dark:focus-visible:ring-offset-off-black"
                        aria-label={`Subscribe to ${plan.name} now`}
                      >
                        Subscribe Now
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })(),
          )}
        </section>

        {extraPlans.length > 0 ? (
          <section className="mt-12" aria-label="Additional plans">
            <h2 className="text-center text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
              Additional plans
            </h2>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Extra tiers created by the team.
            </p>
            <div className="mt-6 grid gap-6 sm:gap-8 lg:grid-cols-3">
              {extraPlans.map((plan) => (
                <article
                  key={plan.id}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/50"
                >
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {plan.duration}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-400">
                      /{plan.duration.toLowerCase()}
                    </span>
                  </div>
                  {plan.perks.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                        Extra perks
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                        {plan.perks.map((perk) => (
                          <li key={perk} className="flex items-start gap-2">
                            <CheckIcon className="mt-0.5 text-green-600 dark:text-green-400" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-500">
          Cancel anytime. No commitment. Terms apply.
        </p>
      </div>
    </main>
  );
}
