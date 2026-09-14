import { useState } from 'react'
import { Avatar } from '../../../components/ui'
import {
  apiErrorMessage,
  createPostComment,
  deleteCommunityComment,
  listPostComments,
  moderateCommunityComment,
  reportCommunityComment,
  updateCommunityComment,
} from '../api/communityApi'
import { CommentComposer } from './CommentComposer'

const reportReasons = [
  ['SPAM', 'Spam'],
  ['HARASSMENT', 'Harassment'],
  ['DANGEROUS_LINK', 'Dangerous link'],
  ['MISINFORMATION', 'Misinformation'],
  ['OTHER', 'Other'],
]

function commentTimestamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function CommentItem({ comment: initialComment, currentUser, postId, onCountChange }) {
  const [comment, setComment] = useState(initialComment)
  const [replies, setReplies] = useState(initialComment.replies || [])
  const [repliesMeta, setRepliesMeta] = useState({
    hasMore: (initialComment.replyCount || 0) > (initialComment.replies?.length || 0),
    nextCursor: initialComment.replies?.at(-1)?.id || null,
  })
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(initialComment.content || '')
  const [reporting, setReporting] = useState(false)
  const [reportReason, setReportReason] = useState('SPAM')
  const [reportDetails, setReportDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isOwner = currentUser?.id === comment.authorId
  const isAdmin = currentUser?.role === 'ADMIN'
  const isActive = comment.status === 'ACTIVE'

  const run = async (work, fallback) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      return await work()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, fallback))
      return null
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed) return
    const response = await run(() => updateCommunityComment(comment.id, trimmed), 'Could not update this comment.')
    if (response) {
      setComment((value) => ({ ...value, ...response.comment }))
      setEditing(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this comment? Replies will remain visible.')) return
    const response = await run(() => deleteCommunityComment(comment.id), 'Could not delete this comment.')
    if (response) {
      setComment((value) => ({ ...value, status: 'DELETED', content: null, author: null }))
      if (isActive) onCountChange(-1)
    }
  }

  const submitReport = async () => {
    const response = await run(() => reportCommunityComment(comment.id, reportReason, reportDetails.trim()), 'Could not report this comment.')
    if (response) {
      setReporting(false)
      setNotice('Report submitted for review.')
    }
  }

  const moderate = async (status) => {
    const response = await run(() => moderateCommunityComment(comment.id, status), 'Could not moderate this comment.')
    if (response) {
      const wasActive = comment.status === 'ACTIVE'
      setComment((value) => ({ ...value, status }))
      if (wasActive !== (status === 'ACTIVE')) onCountChange(status === 'ACTIVE' ? 1 : -1)
    }
  }

  const addReply = async (content) => {
    const response = await createPostComment(postId, { content, parentId: comment.id })
    setReplies((value) => [...value, response.comment])
    setComment((value) => ({ ...value, replyCount: (value.replyCount || 0) + 1 }))
    onCountChange(1)
  }

  const loadMoreReplies = async () => {
    const response = await run(
      () => listPostComments(postId, { parentId: comment.id, cursor: repliesMeta.nextCursor, limit: 20 }),
      'Could not load more replies.',
    )
    if (response) {
      setReplies((value) => [...value, ...response.comments.filter((item) => !value.some((known) => known.id === item.id))])
      setRepliesMeta(response.meta)
    }
  }

  return (
    <article className="border-l-2 border-[#e6ebf2] pl-3">
      <div className="flex gap-2">
        {comment.author ? <Avatar name={comment.author.name || 'Community member'} size="sm" tone="indigo" /> : null}
        <div className="min-w-0 flex-1">
          {isActive ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <strong className="text-[13px]">{comment.author?.name || 'Community member'}</strong>
                <time className="text-[10px] text-[#8a96a8]" dateTime={comment.createdAt}>{commentTimestamp(comment.createdAt)}</time>
              </div>
              {editing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    className="min-h-16 w-full resize-y rounded-lg border border-line p-2 text-[13px] outline-none focus:border-brand-600"
                    maxLength={1000}
                    onChange={(event) => setEditContent(event.target.value)}
                    value={editContent}
                  />
                  <div className="flex gap-2">
                    <button className="rounded-md bg-brand-700 px-2.5 py-1 text-[11px] font-semibold text-white" disabled={busy} onClick={saveEdit} type="button">Save</button>
                    <button className="rounded-md border border-line bg-white px-2.5 py-1 text-[11px]" onClick={() => setEditing(false)} type="button">Cancel</button>
                  </div>
                </div>
              ) : <p className="my-1 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#3f4f66]">{comment.content}</p>}
            </>
          ) : (
            <p className="my-1 text-[12px] italic text-[#8a96a8]">{comment.status === 'HIDDEN' ? 'Comment hidden by a moderator.' : 'Comment deleted.'}</p>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-[#68778d]">
            {currentUser && isActive && !comment.parentId ? <button className="border-0 bg-transparent p-0 hover:text-brand-700" onClick={() => setReplying(true)} type="button">Reply</button> : null}
            {isOwner && isActive ? <button className="border-0 bg-transparent p-0 hover:text-brand-700" onClick={() => setEditing(true)} type="button">Edit</button> : null}
            {isOwner && comment.status !== 'DELETED' ? <button className="border-0 bg-transparent p-0 hover:text-red-600" onClick={remove} type="button">Delete</button> : null}
            {currentUser && !isOwner && isActive ? <button className="border-0 bg-transparent p-0 hover:text-red-600" onClick={() => setReporting((value) => !value)} type="button">Report</button> : null}
            {isAdmin && comment.status !== 'DELETED' ? (
              <button className="border-0 bg-transparent p-0 hover:text-brand-700" onClick={() => moderate(isActive ? 'HIDDEN' : 'ACTIVE')} type="button">
                {isActive ? 'Hide' : 'Restore'}
              </button>
            ) : null}
          </div>

          {reporting ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-[#fff7f7] p-2">
              <select className="rounded-md border border-line bg-white px-2 py-1 text-[11px]" onChange={(event) => setReportReason(event.target.value)} value={reportReason}>
                {reportReasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input
                className="min-w-48 flex-1 rounded-md border border-line bg-white px-2 py-1 text-[11px]"
                maxLength={500}
                onChange={(event) => setReportDetails(event.target.value)}
                placeholder="Optional details"
                value={reportDetails}
              />
              <button className="rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white" disabled={busy} onClick={submitReport} type="button">Submit report</button>
              <button className="text-[11px]" onClick={() => setReporting(false)} type="button">Cancel</button>
            </div>
          ) : null}
          {replying ? <div className="mt-3"><CommentComposer autoFocus compact currentUser={currentUser} onCancel={() => setReplying(false)} onSubmit={addReply} /></div> : null}
          {error ? <p className="my-1 text-[11px] text-red-600">{error}</p> : null}
          {notice ? <p className="my-1 text-[11px] text-green-700">{notice}</p> : null}
        </div>
      </div>

      {replies.length ? (
        <div className="mt-3 space-y-3 pl-3">
          {replies.map((reply) => <CommentItem comment={reply} currentUser={currentUser} key={reply.id} onCountChange={onCountChange} postId={postId} />)}
        </div>
      ) : null}
      {repliesMeta.hasMore ? (
        <button className="ml-12 mt-2 border-0 bg-transparent text-[11px] font-semibold text-brand-700" disabled={busy} onClick={loadMoreReplies} type="button">
          {busy ? 'Loading…' : `View more replies (${Math.max(0, (comment.replyCount || 0) - replies.length)})`}
        </button>
      ) : null}
    </article>
  )
}
