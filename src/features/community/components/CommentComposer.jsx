import { useState } from 'react'
import { Icon } from '../../../components/ui'
import { apiErrorMessage } from '../api/communityApi'

export function CommentComposer({ currentUser, onSubmit, compact = false, autoFocus = false, minimal = false, onCancel }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!currentUser) {
    return <p className="m-0 rounded-lg bg-[#f5f7fa] px-3 py-2 text-[12px] text-[#68778d]">Sign in to join this safety discussion.</p>
  }

  const submit = async (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    setError('')
    try {
      await onSubmit(trimmed)
      setContent('')
      onCancel?.()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Could not post your comment.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (minimal) {
    return <form className="relative" onSubmit={submit}>
      <input
        autoFocus={autoFocus}
        className="min-h-10 w-full rounded-full border border-[#dce3ed] bg-white px-4 pr-11 text-[13px] text-ink outline-none placeholder:text-[#8a96a8] focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        maxLength={1000}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment…"
        value={content}
      />
      {content.trim() ? <button aria-label="Post comment" className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-800 text-white hover:bg-brand-700 disabled:opacity-60" disabled={submitting} type="submit"><Icon name="send" size={15} /></button> : null}
      {error ? <p className="mb-0 mt-1 text-[11px] text-red-600">{error}</p> : null}
    </form>
  }

  return (
    <form className="space-y-2" onSubmit={submit}>
      <textarea
        autoFocus={autoFocus}
        className={`w-full resize-y rounded-lg border border-[#dce3ed] bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${compact ? 'min-h-16' : 'min-h-20'}`}
        maxLength={1000}
        onChange={(event) => setContent(event.target.value)}
        placeholder={compact ? 'Write a comment' : 'Add helpful context or a safety tip…'}
        value={content}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[11px] ${error ? 'text-red-600' : 'text-[#8a96a8]'}`}>
          {error || `${content.length}/1000`}
        </span>
        <div className="flex gap-2">
          {onCancel ? (
            <button className="rounded-md border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5d6c82]" onClick={onCancel} type="button">
              Cancel
            </button>
          ) : null}
          <button
            className="rounded-md border-0 bg-brand-700 px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!content.trim() || submitting}
            type="submit"
          >
            {submitting ? 'Posting…' : compact ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  )
}
