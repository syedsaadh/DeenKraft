import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
      <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700">
        404
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">Page not found.</p>
      <Link
        href="/"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
