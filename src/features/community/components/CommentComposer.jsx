import { useInterfaceTranslation } from "../../../locales/useInterfaceTranslation";
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiErrorMessage } from '../api/communityApi'

export function CommentComposer({ currentUser, onSubmit, compact = false, autoFocus = false, minimal = false, isReply = false, onCancel }) {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!currentUser) {
    return <p className="m-0 rounded-lg bg-[#f5f7fa] px-3 py-2 text-xs text-[#68778d]">{t('community.signInToDiscuss')}</p>
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
      setError(apiErrorMessage(requestError, t('community.comment')))
    } finally {
      setSubmitting(false)
    }
  }

  if (minimal || (compact && !isReply)) {
    return <form className="relative" onSubmit={submit}>
      <input
        autoFocus={autoFocus}
        className="min-h-10 w-full rounded-[10px] border border-[#dce3ed] bg-white px-4 pr-11 py-3 text-sm text-ink outline-none placeholder:text-[#8a96a8] placeholder:text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        maxLength={1000}
        onChange={(event) => setContent(event.target.value)}
        placeholder={t('community.writeComment')}
        value={content}
      />
      {content.trim() ? <button aria-label={t('community.postComment')} className="absolute right-1 top-1.5 inline-flex h-9 items-center justify-center rounded-[8px] bg-brand-800 px-3 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-60" disabled={submitting} type="submit">{t('community.comment')}</button> : null}
      {error ? <p className="mb-0 mt-1 text-xs text-red-600">{tr(error)}</p> : null}
    </form>
  }

  return (
    <form className="space-y-2" onSubmit={submit}>
      <textarea
        autoFocus={autoFocus}
        className={`w-full resize-y rounded-lg border border-[#dce3ed] bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${compact ? 'min-h-16' : 'min-h-20'}`}
        maxLength={1000}
        onChange={(event) => setContent(event.target.value)}
        placeholder={compact ? t('community.writeComment') : t('community.addHelpfulContext')}
        value={content}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs ${error ? 'text-red-600' : 'text-[#8a96a8]'}`}>
          {tr(error) || `${content.length}/1000`}
        </span>
        <div className="flex gap-2">
          {onCancel ? (
            <button className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-[#5d6c82]" onClick={onCancel} type="button">
              {t('common.cancel')}
            </button>
          ) : null}
          <button
            className="rounded-md border-0 bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!content.trim() || submitting}
            type="submit"
          >
            {submitting ? t('community.posting') : isReply ? t('community.reply') : t('community.comment')}
          </button>
        </div>
      </div>
    </form>
  )
}
