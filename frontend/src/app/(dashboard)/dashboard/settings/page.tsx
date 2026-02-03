import Link from "next/link";
import { Button } from "@/components/ui";

export default function SettingsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your account and preferences.
        </p>
      </header>

      <section
        className="rounded-xl border border-neutral-700/50 bg-neutral-900/50 p-8 sm:p-12 text-center"
        aria-label="Settings"
      >
        <span className="text-5xl text-neutral-600" aria-hidden>
          ⚙️
        </span>
        <p className="mt-4 text-lg font-medium text-white">
          Settings coming soon
        </p>
        <p className="mt-2 max-w-sm mx-auto text-sm text-neutral-400">
          Account details, notifications, and playback preferences will be available here.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button type="button" variant="outline">
            Back to home
          </Button>
        </Link>
      </section>
    </>
  );
}
