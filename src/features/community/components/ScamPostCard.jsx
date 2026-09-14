<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Card, Icon } from "../../../components/ui";
import { useAuth } from "../../../state/AuthStore";

export const RiskBadge = ({ level, aiAssessed = false }) => (
  <Badge tone={aiAssessed ? "ai" : level.toLowerCase()}>
    <Icon name="alert" size={13} />
    {aiAssessed ? `AI assessment · ${level} risk` : `${level} risk`}
  </Badge>
);
export const CategoryBadge = ({ category }) => (
  <Badge tone="category">{category}</Badge>
);

function EvidenceImage({ src, alt }) {
  return (
    <img
      className="mt-3 h-[200px] w-full rounded-lg border border-line bg-[#f5f8fc] object-cover sm:h-[240px]"
      src={src || "/evidence-placeholder.svg"}
      alt={alt}
      loading="lazy"
=======
import { useEffect, useRef, useState } from 'react'
import { Avatar, Badge, Card, Icon, IconButton } from '../../../components/ui'
import { apiErrorMessage } from '../api/communityApi'
import { CommentSection } from './CommentSection'

export const RiskBadge = ({ level }) => level ? <Badge tone={level.toLowerCase()}>{level} risk</Badge> : null
export const CategoryBadge = ({ category }) => category ? <Badge tone="category">{category}</Badge> : null

function postTimestamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  if (Math.abs(seconds) < 60) return formatter.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return formatter.format(days, 'day')
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

function ImageEvidence({ src, alt }) {
  if (!src) return null
  return (
    <img
      alt={alt}
      className="mt-3 h-80 w-full rounded-lg border border-[#e1e6ed] bg-[#f5f8fc] object-cover"
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = '/evidence-placeholder.svg'
      }}
      src={src}
    />
  )
}

function ExpandableDescription({ children }) {
<<<<<<< HEAD
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <p
        className={`mb-1 mt-2 text-sm leading-6 text-[#40546b] ${expanded ? "" : "line-clamp-2"}`}
      >
        {children}
      </p>
      {children ? (
        <button
          className="min-h-8 border-0 bg-transparent p-0 text-xs cursor-pointer font-semibold text-brand-800 hover:text-brand-700 "
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read full warning"}
=======
  const descriptionRef = useRef(null)
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const element = descriptionRef.current
    if (!element) return undefined
    const updateOverflow = () => setHasOverflow(element.scrollHeight > element.clientHeight)
    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(element)
    return () => observer.disconnect()
  }, [children])

  return (
    <div>
      <p ref={descriptionRef} className={`mb-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[#44536a] ${expanded ? '' : 'line-clamp-3'}`}>{children}</p>
      {hasOverflow ? (
        <button className="border-0 bg-transparent p-0 text-[13px] font-semibold text-brand-700 hover:text-brand-900" onClick={() => setExpanded((value) => !value)} type="button">
          {expanded ? 'See less' : 'See more'}
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
        </button>
      ) : null}
    </div>
  )
}

<<<<<<< HEAD
function PostActions({ post }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [helpful, setHelpful] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments);
  const [shareStatus, setShareStatus] = useState("");

  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      else await navigator.clipboard.writeText(window.location.href);
      setShareStatus(navigator.share ? "Shared" : "Link copied");
    } catch {
      setShareStatus("");
    }
  };
  const savePost = () => {
    if (!isAuthenticated) { navigate("/login", { state: { from: "/" } }); return; }
    setSaved((value) => !value);
  };

  return (
    <>
      <div className="grid grid-cols-4 border-t border-line">
        <button
          className={`flex min-h-10 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold transition hover:bg-[#f8fafc] ${helpful ? "text-risk-high" : "text-muted hover:text-brand-800"}`}
          type="button"
          aria-pressed={helpful}
          onClick={() => setHelpful((value) => !value)}
        >
          <Icon name="heart" size={15} />
          <span className="text-sm">{post.helpful + (helpful ? 1 : 0)}</span>
          <span className="hidden sm:inline text-sm">Helpful</span>
        </button>
        <button
          className="flex min-h-10 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted hover:bg-[#f8fafc] hover:text-brand-800"
          type="button"
          aria-expanded={commenting}
          onClick={() => setCommenting((value) => !value)}
        >
          <Icon name="message" size={12} />
          <span className="text-sm">{comments}</span>
          <span className="hidden sm:inline text-sm">Comment</span>
        </button>
        <button
          className="flex min-h-10 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold text-muted hover:bg-[#f8fafc] hover:text-brand-800"
          type="button"
          onClick={share}
        >
          <Icon name="share" size={12} />
          <span className="text-sm">{post.shares}</span>
          <span className="hidden sm:inline text-sm">{shareStatus || "Share"}</span>
        </button>
        <button
          className={`flex min-h-10 items-center justify-center gap-1.5 border-0 bg-transparent px-1 text-xs font-semibold hover:bg-[#f8fafc] ${saved ? "text-brand-800" : "text-muted hover:text-brand-800"}`}
          type="button"
          aria-pressed={saved}
          onClick={savePost}
        >
          <Icon name="bookmark" size={12} />
          <span className="hidden sm:inline text-sm">{saved ? "Saved" : "Save"}</span>
        </button>
      </div>
      {commenting ? (
        <form
          className="flex gap-2 border-t border-line bg-[#f8fafc] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!comment.trim()) return;
            setComments((value) => value + 1);
            setComment("");
            setCommenting(false);
          }}
        >
          <label className="sr-only" htmlFor={`comment-${post.id}`}>
            Add a helpful comment
          </label>
          <input
            id={`comment-${post.id}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            autoFocus
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand-700"
            placeholder="Add a helpful comment…"
          />
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"
          >
            Post
          </button>
        </form>
      ) : null}
    </>
  );
=======
function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value)
  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  const copied = document.execCommand('copy')
  document.body.removeChild(input)
  return copied ? Promise.resolve() : Promise.reject(new Error('Copy failed'))
}

function PostActions({ commentsOpen, onShare, onToggleComments, onToggleLike, post }) {
  const [likePending, setLikePending] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [sharePending, setSharePending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const toggleLike = async () => {
    if (likePending) return
    setLikePending(true)
    setError('')
    try {
      await onToggleLike()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Could not update Helpful.'))
    } finally {
      setLikePending(false)
    }
  }

  const shareUrl = `${window.location.origin}/community/posts/${encodeURIComponent(post.id)}`

  const shareNative = async () => {
    setSharePending(true)
    setError('')
    setNotice('')
    try {
      await navigator.share({
        title: post.title,
        text: 'Verified scam warning from BanteayDigital',
        url: shareUrl,
      })
      await onShare('NATIVE')
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(apiErrorMessage(requestError, 'Could not open the share options.'))
      }
    } finally {
      setSharePending(false)
    }
  }

  const openShareOptions = () => {
    if (typeof navigator.share === 'function') {
      shareNative()
      return
    }
    setShareOpen((value) => !value)
  }

  const shareToTelegram = async () => {
    setShareOpen(false)
    setSharePending(true)
    setError('')
    setNotice('')
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Verified scam warning from BanteayDigital')}`
    window.open(telegramUrl, '_blank', 'noopener,noreferrer')
    try {
      await onShare('TELEGRAM')
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'The Telegram window opened, but the share count could not be updated.'))
    } finally {
      setSharePending(false)
    }
  }

  const copyLink = async () => {
    setShareOpen(false)
    setSharePending(true)
    setError('')
    setNotice('')
    try {
      await copyText(shareUrl)
      await onShare('COPY_LINK')
      setNotice('Post link copied.')
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Could not copy the post link.'))
    } finally {
      setSharePending(false)
    }
  }

  return (
    <>
      <div className="flex min-h-15 items-center border-t border-[#e5eaf1]">
        <button
          aria-pressed={post.interaction.likedByMe}
          className={`flex flex-1 items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold ${post.interaction.likedByMe ? 'text-red-600 [&_svg]:fill-current' : 'text-[#61718a]'}`}
          disabled={likePending}
          onClick={toggleLike}
          type="button"
        >
          <Icon name="heart" />
          {post.interaction.likeCount} <span className="max-[800px]:hidden">Helpful</span>
        </button>
        <button
          aria-expanded={commentsOpen}
          className={`flex flex-1 items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold ${commentsOpen ? 'text-brand-700' : 'text-[#61718a]'}`}
          onClick={onToggleComments}
          type="button"
        >
          <Icon name="message" />
          {post.interaction.commentCount} <span className="max-[800px]:hidden">Comments</span>
        </button>
        <div className="relative flex flex-1 justify-center">
          <button
            aria-expanded={shareOpen}
            className="flex items-center justify-center gap-1 border-0 bg-transparent text-[11px] font-semibold text-[#61718a] hover:text-brand-700"
            disabled={sharePending}
            onClick={openShareOptions}
            type="button"
          >
            <Icon name="share" />
            {post.interaction.shareCount} <span className="max-[800px]:hidden">Share</span>
          </button>
          {shareOpen ? (
            <div className="absolute bottom-10 right-0 z-10 min-w-40 rounded-lg border border-line bg-white p-1.5 shadow-lg">
              <button className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800" onClick={shareToTelegram} type="button">Share to Telegram</button>
              <button className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-left text-[12px] font-semibold text-[#3f4e66] hover:bg-brand-100 hover:text-brand-800" onClick={copyLink} type="button">Copy post link</button>
            </div>
          ) : null}
        </div>
      </div>
      {error ? <p className="m-0 border-t border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p> : null}
      {notice ? <p className="m-0 border-t border-green-100 bg-green-50 px-3 py-2 text-[11px] text-green-700">{notice}</p> : null}
    </>
  )
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
}

export function ScamPostCard({ currentUser, onCommentCountChange, onShare, onToggleLike, post }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const authorName = post.author?.name || 'BanteayDigital Safety Team'

  return (
<<<<<<< HEAD
    <Card className="overflow-hidden">
      <article aria-labelledby={`report-title-${post.id}`}>
        <div className="p-4">
          <header className="flex items-center gap-2.5">
            <Avatar name={post.author} tone="indigo" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <strong className="truncate text-[15px]">{post.author}</strong>
                {post.verified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Icon name="shield" size={13} />
                    Verified
                  </span>
                ) : null}
              </div>
              <p className="m-0 text-xs text-muted">
                {post.time} · Community report
              </p>
            </div>
          </header>
          <div className="mt-3 flex flex-wrap gap-2">
            <CategoryBadge category={post.category} />
            <RiskBadge level={post.risk} aiAssessed={post.aiAssessed} />
          </div>
          <h2
            id={`report-title-${post.id}`}
            className="mb-0 mt-3 text-base font-bold leading-snug tracking-[-0.01em] text-brand-900"
          >
            {post.title}
          </h2>
          <ExpandableDescription>{post.description}</ExpandableDescription>
          <EvidenceImage
            src={post.image}
            alt={`Evidence submitted for report: ${post.title}`}
          />
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${post.verified ? "border-[#b9e4d7] bg-[#eaf8f3] text-[#116c59]" : "border-[#dce4ed] bg-[#f2f4f7] text-[#52647a]"}`}
          >
            <Icon
              name={post.verified ? "check" : "clock"}
              size={16}
              className="mt-0.5 shrink-0"
            />
            <div>
              <strong className="block">
                {post.verified
                  ? "Verified by moderator"
                  : "Community report · Not yet verified"}
              </strong>
              <span className="text-xs">
                {post.verified
                  ? "Evidence reviewed by the BanteayDigital moderation team."
                  : "Review pending. Use caution while details are checked."}
              </span>
            </div>
          </div>
        </div>
        <PostActions post={post} />
      </article>
=======
    <Card className="p-4 pb-0">
      <div className="mb-2 flex items-center gap-2">
        <Avatar name={authorName} tone="indigo" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong className="text-[15px]">{authorName}</strong>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#2670c9]"><Icon name="shield" size={12} />Verified by BanteayDigital</span>
          </div>
          <p className="m-0 text-[12px] text-[#8490a2]">{postTimestamp(post.publishedAt)} · Public</p>
        </div>
        <IconButton label="More options" icon="more" />
      </div>
      <div className="flex gap-2"><RiskBadge level={post.risk} /><CategoryBadge category={post.category} /></div>
      <div className="mt-2">
        <h2 className="m-0 text-[17px] font-bold">{post.title}</h2>
        {post.summary ? <p className="mb-1 mt-1 text-[13px] font-medium text-[#56657b]">{post.summary}</p> : null}
        <ExpandableDescription>{post.content}</ExpandableDescription>
        <ImageEvidence alt={post.title} src={post.imageUrl || post.image} />
      </div>
      <PostActions commentsOpen={commentsOpen} onShare={onShare} onToggleComments={() => setCommentsOpen((value) => !value)} onToggleLike={onToggleLike} post={post} />
      {commentsOpen ? <CommentSection currentUser={currentUser} onCountChange={onCommentCountChange} postId={post.id} /> : null}
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
    </Card>
  )
}
