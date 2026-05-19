import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

type FullscreenNotificationProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
> & {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  dismissible?: boolean
  closeLabel?: string
  className?: string
  overlayClassName?: string
  contentClassName?: string
  contentStyle?: React.CSSProperties
}

const FullscreenNotification = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  FullscreenNotificationProps
>(
  function FullscreenNotification(
    {
      title,
      description,
      children,
      dismissible = true,
      closeLabel = "Close notification",
      className,
      overlayClassName,
      contentClassName,
      contentStyle,
      open,
      onOpenChange,
      ...props
    },
    ref
  ) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const currentOpen = open ?? internalOpen

    React.useEffect(() => {
      if (!currentOpen) return

      const previousBodyOverflow = document.body.style.overflow
      const previousHtmlOverflow = document.documentElement.style.overflow

      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = previousBodyOverflow
        document.documentElement.style.overflow = previousHtmlOverflow
      }
    }, [currentOpen])

    const handleOpenChange = React.useCallback(
      (nextOpen: boolean) => {
        if (open === undefined) {
          setInternalOpen(nextOpen)
        }
        onOpenChange?.(nextOpen)
      },
      [open, onOpenChange]
    )

    return (
      <DialogPrimitive.Root open={currentOpen} onOpenChange={handleOpenChange} {...props}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-50 transition-opacity duration-300 touch-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              overlayClassName
            )}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(2px)",
              pointerEvents: "none",
            }}
            onPointerUp={(event) => {
              if (event.target === event.currentTarget) {
                handleOpenChange(false)
              }
            }}
          />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(
              "fixed inset-0 z-50 grid place-items-center overflow-hidden px-6 py-8",
              className
            )}
            style={{
              touchAction: "none",
            }}
            onOpenAutoFocus={(event) => event.preventDefault()}
            onPointerUp={(event) => {
              if (event.target === event.currentTarget) {
                handleOpenChange(false)
              }
            }}
            onEscapeKeyDown={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => event.preventDefault()}
          >
            <div
              data-darkreader-scheme="light"
              data-darkreader-inline-bgcolor="rgba(255,255,255,0.14)"
              className={cn(
                "relative flex w-full max-w-[520px] flex-col items-center gap-8 overflow-hidden rounded-[44px] p-10 sm:p-12 duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                contentClassName
              )}
              style={contentStyle ?? {
                backgroundColor: "rgba(255, 255, 255, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow: "0 30px 70px rgba(15, 23, 42, 0.28), -8px 10px 30px rgba(255, 255, 255, 0.16), 8px 10px 30px rgba(255, 255, 255, 0.16)",
                backdropFilter: "blur(28px)",
              }}
            >
              {dismissible ? (
                <DialogPrimitive.Close className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-foreground/90 shadow-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">{closeLabel}</span>
                </DialogPrimitive.Close>
              ) : null}

              <div className="flex w-full flex-col items-center gap-6 text-center">
                {title ? (
                  <DialogPrimitive.Title className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {title}
                  </DialogPrimitive.Title>
                ) : null}

                {description ? (
                  <DialogPrimitive.Description className="max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                    {description}
                  </DialogPrimitive.Description>
                ) : null}

                <div className="w-full">{children}</div>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }
)

FullscreenNotification.displayName = "FullscreenNotification"

export { FullscreenNotification }
