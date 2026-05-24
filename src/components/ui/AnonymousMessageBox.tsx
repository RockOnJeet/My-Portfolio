import * as React from "react"
import { feedbackForm } from "@/data/config"
import { sanitizeUserText } from "@/lib/security"

const MAX_WORDS = 120
const MAX_MESSAGE_CHARS = 1200
const MAX_NAME_CHARS = 60
const MAX_HONEYPOT_CHARS = 120
const MIN_MESSAGE_CHARS = 2
const MIN_RESUBMIT_DELAY_MS = 10_000 // prevent fast accidental re-submits
const FEEDBACK_SUBMITTED_KEY = "portfolio_feedback_submitted_v1"
const GOOGLE_FORM_ID_REGEX = /^1FAIpQL[0-9A-Za-z_-]{20,}$/
const GOOGLE_ENTRY_ID_REGEX = /^entry\.\d+$/

const countWords = (text: string) => {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
}

const normalizeNameInput = (value: string) => {
  return sanitizeUserText(value, { allowNewlines: false, maxLen: MAX_NAME_CHARS })
}

const normalizeMessageInput = (value: string) => {
  return sanitizeUserText(value, { allowNewlines: true, maxLen: MAX_MESSAGE_CHARS })
}

const normalizeHoneypotInput = (value: string) => {
  return value.slice(0, MAX_HONEYPOT_CHARS)
}

const isConfiguredGoogleForm = () => {
  return (
    GOOGLE_FORM_ID_REGEX.test(feedbackForm.formId) &&
    GOOGLE_ENTRY_ID_REGEX.test(feedbackForm.entryIds?.displayName ?? "") &&
    GOOGLE_ENTRY_ID_REGEX.test(feedbackForm.entryIds?.message ?? "")
  )
}

export function AnonymousMessageBox() {
  const [displayName, setDisplayName] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)
  const [status, setStatus] = React.useState<string | null>(null)
  const [botTrap, setBotTrap] = React.useState("")
  const [consent, setConsent] = React.useState(false)
  const [hasSubmittedBefore, setHasSubmittedBefore] = React.useState(() => {
    if (typeof window === "undefined") return false

    try {
      return localStorage.getItem(FEEDBACK_SUBMITTED_KEY) === "1"
    } catch {
      return false
    }
  })

  const lastSubmitRef = React.useRef<number | null>(null)

  const wordCount = React.useMemo(() => countWords(message), [message])
  const isConfigured = isConfiguredGoogleForm()
  const formAction = isConfigured
    ? `https://docs.google.com/forms/d/e/${feedbackForm.formId}/formResponse`
    : ""
  const isEnabled = Boolean(
    isConfigured &&
    feedbackForm.formId &&
    feedbackForm.entryIds?.displayName &&
    feedbackForm.entryIds?.message,
  )

  const isRateLimited = () => {
    const last = lastSubmitRef.current
    if (!last) return false
    return Date.now() - last < MIN_RESUBMIT_DELAY_MS
  }

  const submitToGoogle = async (name: string, msg: string) => {
    if (!formAction) return

    const body = new URLSearchParams({
      [feedbackForm.entryIds.displayName]: name,
      [feedbackForm.entryIds.message]: msg,
    })

    // Google Forms does not support CORS. 'no-cors' sends the POST without a
    // preflight and returns an opaque response (status unreadable, but submitted).
    await fetch(formAction, {
      method: "POST",
      mode: "no-cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      body,
    })
  }

  const handleSubmit = React.useCallback(async () => {
    const normalizedName = normalizeNameInput(displayName)
    const normalizedMessage = normalizeMessageInput(message)

    if (!isEnabled) {
      setStatus("Feedback form is not configured yet.")
      return
    }

    if (hasSubmittedBefore || submitted) {
      setStatus("This device has already submitted feedback.")
      return
    }

    if (botTrap.trim() !== "") {
      setStatus("Bot Submission Flagged.")
      return
    }

    if (isRateLimited()) {
      setStatus("Please wait a moment before submitting again.")
      return
    }

    if (!normalizedMessage.trim() || normalizedMessage.trim().length < MIN_MESSAGE_CHARS) {
      setStatus("Please enter a message.")
      return
    }

    if (wordCount > MAX_WORDS) {
      setStatus(`Maximum ${MAX_WORDS} words allowed.`)
      return
    }

    if (!consent) {
      setStatus("Please check the consent box before submitting.")
      return
    }

    lastSubmitRef.current = Date.now()
    try {
      await submitToGoogle(normalizedName.trim() || "Anonymous", normalizedMessage.trim())
      setSubmitted(true)
      setHasSubmittedBefore(true)

      try {
        localStorage.setItem(FEEDBACK_SUBMITTED_KEY, "1")
      } catch {
        // Ignore localStorage write failures (e.g., private mode restrictions).
      }

      setStatus("Submitted. Thank you for your feedback.")
    } catch {
      lastSubmitRef.current = null
      setStatus("Network error. Please try again.")
    }
  }, [displayName, isEnabled, message, wordCount, botTrap, consent, hasSubmittedBefore, submitted])

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1117]/80 p-6">
      <h3 className="text-xl font-semibold text-white mb-2">Feedback / Review box</h3>
      <p className="text-white/60 text-sm mb-4">
        Submit any feedback about the user / site. Once you submit, the button will disable and you’ll see a confirmation message.
      </p>

      {!isEnabled ? (
        <div className="rounded-md border border-yellow-400/30 bg-yellow-500/10 p-3 mb-4">
          <p className="text-sm text-yellow-100">
            The feedback form is not configured yet. Edit <code className="font-mono">src/data/config.ts</code> to
            add your Google Forms ID and entry field IDs.
          </p>
        </div>
      ) : null}

      {hasSubmittedBefore ? (
        <div className="rounded-md border border-blue-400/30 bg-blue-500/10 p-3 mb-4">
          <p className="text-sm text-blue-100">
            This device has already submitted feedback. Only one submission is allowed per device.
          </p>
        </div>
      ) : null}

      <label className="block text-white/60 text-xs mb-1">Display name (optional)</label>
      <input
        value={displayName}
        onChange={(e) => setDisplayName(normalizeNameInput(e.target.value))}
        className="w-full bg-[#010409] border border-white/10 text-white text-sm rounded-md px-3 py-2 mb-3"
        spellCheck={false}
        autoComplete="off"
        maxLength={MAX_NAME_CHARS}
        placeholder="e.g. Anonymous"
      />

      <label className="block text-white/60 text-xs mb-1">
        Feedback (max {MAX_WORDS} words)
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(normalizeMessageInput(e.target.value))}
        rows={4}
        className="w-full bg-[#010409] border border-white/10 text-white text-sm rounded-md px-3 py-2 mb-1 resize-none"
        autoComplete="off"
        maxLength={MAX_MESSAGE_CHARS}
      />
      <p className="text-xs text-white/50 mb-3">
        {wordCount} / {MAX_WORDS} words · {message.length} / {MAX_MESSAGE_CHARS} chars
      </p>

      {/* Honeypot field (hidden from users) */}
      <div className="sr-only">
        <label>
          Please fill this with your administrator's data to submit.
          <input
            value={botTrap}
            onChange={(e) => setBotTrap(normalizeHoneypotInput(e.target.value))}
            autoComplete="off"
            maxLength={MAX_HONEYPOT_CHARS}
          />
        </label>
      </div>


      <label className="flex items-start gap-2 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={submitted || hasSubmittedBefore}
          className="mt-0.5 accent-[#238636] cursor-pointer"
        />
        <span className="text-xs text-white/60">
          I agree for this data to show up as public opinion about the user.
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!isEnabled || submitted || hasSubmittedBefore || !consent || message.trim().length < MIN_MESSAGE_CHARS}
          className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          onClick={handleSubmit}
        >
          Submit Feedback
        </button>
      </div>

      {status ? <p className="text-sm text-white/50 mt-3">{status}</p> : null}

      <p className="mt-4 text-xs text-white/40">
        Tip: If your submission doesn’t appear, contact the site owner.
      </p>
    </div>
  )
}
