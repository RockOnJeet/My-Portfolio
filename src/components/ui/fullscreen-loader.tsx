import { Spinner } from "@/components/ui/spinner"

function FullscreenLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-background/40 backdrop-blur-md"
      role="status"
      aria-label="Loading page"
      aria-live="polite"
    >
      <Spinner className="size-10 motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Loading page</span>
    </div>
  )
}

export { FullscreenLoader }
