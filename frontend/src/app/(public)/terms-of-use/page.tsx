import type { Metadata } from "next";
import { SITE_BRAND } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for BRICK TALES.TV.",
};

export default function TermsOfUsePage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>
        <div className="mt-8 space-y-8 text-neutral-600 dark:text-neutral-300">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 leading-relaxed">
              By using {SITE_BRAND} you agree to these Terms of Use. If you do not agree, do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              2. Description of Service
            </h2>
            <p className="mt-2 leading-relaxed">
              {SITE_BRAND} is a video streaming platform. The Service may be updated from time to time.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              3. Account and Acceptable Use
            </h2>
            <p className="mt-2 leading-relaxed">
              You are responsible for your account and for using the Service only for lawful purposes.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              4. Contact
            </h2>
            <p className="mt-2 leading-relaxed">
              For questions about these Terms, contact us via the Service.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
