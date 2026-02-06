import Link from "next/link";
import { Button, Input } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="font-[var(--font-geist-sans)]">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">
          Account settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Shape your viewing experience
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Update your profile, tune playback, and keep your account secure
          across devices.
        </p>
      </header>

      <section
        className="relative overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-900/60 p-6 sm:p-8"
        aria-label="Account overview"
      >
        <div
          className="absolute -top-20 right-8 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 left-8 h-48 w-48 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
              Profile snapshot
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Your account at a glance
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-neutral-700/70 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300">
                Plan: Starter
              </span>
              <span className="rounded-full border border-neutral-700/70 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300">
                Member since 2024
              </span>
              <span className="rounded-full border border-neutral-700/70 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-300">
                Email verified
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="lg">
              Save changes
            </Button>
            <Link href="/subscription">
              <Button type="button" variant="outline" size="lg">
                Manage plan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Profile details"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Profile details
                </h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Keep your profile fresh for personalized recommendations.
                </p>
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Editable
              </span>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input label="Display name" placeholder="Jordan Brooks" />
              <Input
                label="Email"
                type="email"
                placeholder="jordan@email.com"
              />
              <Input label="Phone" type="tel" placeholder="+1 (555) 000-1289" />
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  Bio
                </label>
                <textarea
                  className="h-24 w-full rounded-lg border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500/20"
                  placeholder="Tell us what you like to watch."
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button">Update profile</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </section>

          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Security"
          >
            <h3 className="text-lg font-semibold text-white">Security</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Update your password and protect your account.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label="Current password"
                type="password"
                placeholder="********"
              />
              <Input
                label="New password"
                type="password"
                placeholder="********"
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder="********"
              />
              <div className="sm:col-span-2 rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Two-factor authentication
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Add a second layer of security when you sign in.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-neutral-600 px-4 py-1 text-xs font-semibold text-neutral-200 hover:border-accent hover:text-accent"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button">Save security</Button>
              <Button type="button" variant="ghost">
                Reset sessions
              </Button>
            </div>
          </section>

          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Playback preferences"
          >
            <h3 className="text-lg font-semibold text-white">
              Playback preferences
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Pick how you want videos to behave by default.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
                <p className="text-sm font-semibold text-white">
                  Default quality
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  We will prioritize this setting on Wi-Fi.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {"Auto, 1080p, 720p".split(", ").map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="rounded-full border border-neutral-600 px-3 py-1 text-xs font-semibold text-neutral-200 hover:border-accent hover:text-accent"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
                <p className="text-sm font-semibold text-white">Controls</p>
                <div className="mt-4 space-y-3 text-sm text-neutral-300">
                  <label className="flex items-center justify-between gap-3">
                    <span>Autoplay next episode</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-accent"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span>Skip recaps</span>
                    <input type="checkbox" className="h-4 w-4 accent-accent" />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span>Show subtitles by default</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 accent-accent"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button">Save playback</Button>
              <Button type="button" variant="outline">
                Reset to defaults
              </Button>
            </div>
          </section>

          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Notifications"
          >
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Decide how and when we should reach you.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-neutral-300">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3">
                <div>
                  <p className="font-medium text-white">New releases</p>
                  <p className="text-xs text-neutral-400">
                    Get notified when a creator you follow posts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Account alerts</p>
                  <p className="text-xs text-neutral-400">
                    Billing, security, and important updates.
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 accent-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3">
                <div>
                  <p className="font-medium text-white">Product tips</p>
                  <p className="text-xs text-neutral-400">
                    Occasional updates about new features.
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4 accent-accent" />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button">Save notifications</Button>
              <Button type="button" variant="ghost">
                Unsubscribe from all
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Subscription"
          >
            <h3 className="text-lg font-semibold text-white">Subscription</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Manage your plan and billing details.
            </p>
            <div className="mt-5 rounded-xl border border-neutral-700/70 bg-neutral-950/60 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
                Current plan
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">Starter</p>
              <p className="mt-1 text-sm text-neutral-400">
                Upgrade for offline viewing and exclusive series.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                <span>Status: Active</span>
                <span>Next charge: Aug 18</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/subscription">
                <Button type="button" size="sm">
                  View plans
                </Button>
              </Link>
              <Button type="button" size="sm" variant="outline">
                Update card
              </Button>
            </div>
          </section>

          <section
            className="rounded-2xl border border-neutral-700/50 bg-neutral-900/60 p-6"
            aria-label="Devices"
          >
            <h3 className="text-lg font-semibold text-white">Devices</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Manage where you are signed in.
            </p>
            <div className="mt-5 space-y-3 text-sm text-neutral-300">
              {[
                { name: "MacBook Pro", meta: "San Francisco, CA" },
                { name: "Living room TV", meta: "ChromeCast" },
                { name: "iPhone 14", meta: "Last active 2 days ago" },
              ].map((device) => (
                <div
                  key={device.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-700/70 bg-neutral-950/60 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{device.name}</p>
                    <p className="text-xs text-neutral-400">{device.meta}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-neutral-400 hover:text-accent"
                  >
                    Sign out
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section
            className="rounded-2xl border border-red-500/40 bg-neutral-900/60 p-6"
            aria-label="Privacy"
          >
            <h3 className="text-lg font-semibold text-white">Privacy & data</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Download your data or remove your account.
            </p>
            <div className="mt-5 space-y-3">
              <Button type="button" variant="outline" fullWidth>
                Download data
              </Button>
              <Button type="button" variant="danger" fullWidth>
                Delete account
              </Button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Deleting your account is permanent and cannot be undone.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
