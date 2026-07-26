import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-dark-900 px-6">
      <section className="w-full max-w-lg rounded-xl border border-[#21262d] bg-dark-800 p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-[#30363d] bg-dark-700">
            <AlertCircle
              className="size-5 text-danger-500"
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="font-mono text-[10px] font-semibold tracking-widest text-muted-400">
              HTTP 404
            </p>

            <h1 className="mt-1 text-xl font-semibold text-muted-100">
              Page not found
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-muted-300">
          The requested route does not exist or is no longer available.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#30363d] bg-dark-700 px-4 text-xs font-medium text-muted-100 transition hover:border-[#484f58] hover:bg-[#1c2128]"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-blue px-4 text-xs font-medium text-white transition hover:brightness-110"
          >
            <Home className="size-3.5" aria-hidden="true" />
            Portfolio
          </Link>
        </div>
      </section>
    </main>
  );
}