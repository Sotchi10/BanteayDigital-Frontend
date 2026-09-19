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
    return <p className="community-body m-0 rounded-lg border border-line bg-canvas px-3 py-2 text-muted">{t('community.signInToDiscuss')}</p>
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
    return <div>
      <form className="flex min-w-0 items-center gap-2" onSubmit={submit}>
        <input
          autoFocus={autoFocus}
          aria-label={t('community.writeComment')}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-4 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
          maxLength={1000}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t('community.writeComment')}
          value={content}
        />
        {content.trim() ? <button aria-label={t('community.postComment')} className="min-h-11 shrink-0 rounded-lg bg-brand-800 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60" disabled={submitting} type="submit">{submitting ? t('community.posting') : t('community.comment')}</button> : null}
      </form>
      {error ? <p className="community-meta mb-0 mt-2 text-red-600">{tr(error)}</p> : null}
    </div>
  }

  return (
    <form className="space-y-2" onSubmit={submit}>
      <textarea
        autoFocus={autoFocus}
        aria-label={isReply ? t('community.reply') : t('community.writeComment')}
        className={`w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-[15px] text-ink outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${compact ? 'min-h-16' : 'min-h-20'}`}
        maxLength={1000}
        onChange={(event) => setContent(event.target.value)}
        placeholder={compact ? t('community.writeComment') : t('community.addHelpfulContext')}
        value={content}
      />
      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm ${error ? 'text-red-600' : 'text-muted'}`}>
          {tr(error) || `${content.length}/1000`}
        </span>
        <div className="flex gap-2">
          {onCancel ? (
            <button className="rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:bg-brand-100" onClick={onCancel} type="button">
              {t('common.cancel')}
            </button>
          ) : null}
          <button
            className="rounded-md border-0 bg-brand-700 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
