import { useInterfaceTranslation } from "../../../locales/useInterfaceTranslation";
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  apiErrorMessage,
  getCurrentUser,
  likeCommunityPost,
  listCommunityPosts,
  recordCommunityPostShare,
  saveCommunityPost,
  unlikeCommunityPost,
  unsaveCommunityPost,
} from '../api/communityApi'
import { PostComposer } from './PostComposer'
import { ScamPostCard } from './ScamPostCard'

export function CommunityFeed() {
  const tr = useInterfaceTranslation();
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [meta, setMeta] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([listCommunityPosts(), getCurrentUser()])
      .then(([postResponse, user]) => {
        if (!active) return
        setPosts(postResponse.posts)
        setMeta(postResponse.meta)
        setCurrentUser(user)
      })
      .catch((requestError) => {
        if (active) setError(apiErrorMessage(requestError, 'Could not load the community feed.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const visiblePosts = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return posts
    return posts.filter((post) => [post.title, post.summary, post.content, post.author?.name]
      .some((value) => value?.toLocaleLowerCase().includes(needle)))
  }, [posts, query])

  const updateInteraction = (postId, transform) => {
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, interaction: transform(post.interaction) } : post
    )))
  }

  const toggleLike = async (postId) => {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    if (!currentUser) {
      const errorResponse = new Error('Authentication is required')
      errorResponse.response = { status: 401, data: { message: t('community.signInToLike') } }
      throw errorResponse
    }

    const previous = post.interaction
    const nextLiked = !previous.likedByMe
    updateInteraction(postId, () => ({
      ...previous,
      likedByMe: nextLiked,
      likeCount: Math.max(0, previous.likeCount + (nextLiked ? 1 : -1)),
    }))

    try {
      const result = nextLiked ? await likeCommunityPost(postId) : await unlikeCommunityPost(postId)
      updateInteraction(postId, (interaction) => ({ ...interaction, likedByMe: result.liked, likeCount: result.likeCount }))
    } catch (requestError) {
      updateInteraction(postId, () => previous)
      throw requestError
    }
  }

  const toggleSave = async (postId) => {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    if (!currentUser) {
      const errorResponse = new Error('Authentication is required')
      errorResponse.response = { status: 401, data: { message: t('community.signInToSave') } }
      throw errorResponse
    }

    const previous = post.interaction
    const nextSaved = !previous.savedByMe
    updateInteraction(postId, () => ({ ...previous, savedByMe: nextSaved }))

    try {
      const result = nextSaved ? await saveCommunityPost(postId) : await unsaveCommunityPost(postId)
      updateInteraction(postId, (interaction) => ({ ...interaction, savedByMe: result.saved }))
    } catch (requestError) {
      updateInteraction(postId, () => previous)
      throw requestError
    }
  }

  const recordShare = async (sharedPostId, channel) => {
    const result = await recordCommunityPostShare(sharedPostId, channel)
    updateInteraction(sharedPostId, (interaction) => ({ ...interaction, shareCount: result.shareCount }))
    return result
  }

  const loadMore = async () => {
    if (!meta || meta.page >= meta.totalPages) return
    setLoadingMore(true)
    setError('')
    try {
      const response = await listCommunityPosts({ page: meta.page + 1, limit: meta.limit })
      setPosts((current) => [...current, ...response.posts.filter((post) => !current.some((known) => known.id === post.id))])
      setMeta(response.meta)
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Could not load more posts.'))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:px-6" id="main-content">
      <PostComposer onChange={setQuery} value={query} />
      <div className="border-b border-line" aria-label={t('community.feed')}>
        <span className="relative inline-flex min-h-10 items-center px-1 text-sm font-semibold text-brand-800 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand-800">
          {t('community.forYou')}
        </span>
      </div>

      {loading ? <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">{t('community.loadingAlerts')}</div> : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{tr(error)}</div> : null}
      {!loading && !error && visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">
          {query ? t('community.noMatchingAlerts') : t('community.noAlerts')}
        </div>
      ) : null}

      {visiblePosts.map((post) => (
        <ScamPostCard
          key={post.id}
          onOpenComments={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onOpenPost={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onToggleLike={() => toggleLike(post.id)}
          onToggleSave={() => toggleSave(post.id)}
          onShare={(channel) => recordShare(post.id, channel)}
          post={post}
        />
      ))}

      {meta && meta.page < meta.totalPages && !query ? (
        <button className="mb-2 rounded-xl border border-line bg-white py-3 text-sm font-semibold text-brand-700" disabled={loadingMore} onClick={loadMore} type="button">
          {loadingMore ? t('community.loading') : t('community.loadMoreAlerts')}
        </button>
      ) : null}
    </main>
  )
}
