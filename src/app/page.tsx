import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <nav className="absolute top-0 right-0 p-6">
        <div className="flex gap-4">
          <Link
            href="/log-in"
            className="px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Log In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
            Promise Tracker
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Keep track of your promises and commitments. Build accountability, one promise at a time.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-black text-white px-5 transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 md:w-[158px]"
            href="/log-in"
          >
            Get Started
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="#features"
          >
            Learn More
          </Link>
        </div>
      </main>
    </div>
  )
}
