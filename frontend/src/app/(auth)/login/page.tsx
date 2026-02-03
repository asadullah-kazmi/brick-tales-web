import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Login form will go here.
      </p>
      <Link
        href="/signup"
        className="mt-4 inline-block text-sm text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        Create an account
      </Link>
    </div>
  );
}
