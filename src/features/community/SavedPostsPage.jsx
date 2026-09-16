import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, EmptyState } from '../../components/ui'
import {
  apiErrorMessage,
  likeCommunityPost,
  listSavedCommunityPosts,
  recordCommunityPostShare,
  saveCommunityPost,
  unlikeCommunityPost,
  unsaveCommunityPost,
} from './api/communityApi'
import { ScamPostCard } from './components/ScamPostCard'

export function SavedPostsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    listSavedCommunityPosts({ limit: 100 })
      .then((response) => {
        if (active) setPosts(response.posts || [])
      })
      .catch((requestError) => {
        if (active) setError(apiErrorMessage(requestError, 'Could not load saved posts.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const updateInteraction = (postId, transform) => {
    setPosts((current) => current.map((post) => (
      post.id === postId ? { ...post, interaction: transform(post.interaction) } : post
    )))
  }

  const toggleLike = async (postId) => {
    const post = posts.find((item) => item.id === postId)
    if (!post) return
    const previous = post.interaction
    const nextLiked = !previous.likedByMe
    updateInteraction(postId, () => ({ ...previous, likedByMe: nextLiked, likeCount: Math.max(0, previous.likeCount + (nextLiked ? 1 : -1)) }))
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
    const previous = post.interaction
    const nextSaved = !previous.savedByMe
    updateInteraction(postId, () => ({ ...previous, savedByMe: nextSaved }))
    try {
      const result = nextSaved ? await saveCommunityPost(postId) : await unsaveCommunityPost(postId)
      if (!result.saved) {
        setPosts((current) => current.filter((item) => item.id !== postId))
        return
      }
      updateInteraction(postId, (interaction) => ({ ...interaction, savedByMe: true }))
    } catch (requestError) {
      updateInteraction(postId, () => previous)
      throw requestError
    }
  }

  const recordShare = async (postId, channel) => {
    const result = await recordCommunityPostShare(postId, channel)
    updateInteraction(postId, (interaction) => ({ ...interaction, shareCount: result.shareCount }))
    return result
  }

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:px-6" id="main-content">
      <header className="border-b border-line pb-3">
        <h1 className="m-0 text-xl font-bold text-brand-900">{t('Saved')}</h1>
        <p className="mb-0 mt-1 text-sm text-muted">{t('Community posts you saved for later.')}</p>
      </header>
      {loading ? <Card className="p-8 text-center text-sm text-muted">{t('Loading saved posts…')}</Card> : null}
      {error ? <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card> : null}
      {!loading && !error && posts.length === 0 ? (
        <EmptyState icon="bookmark" title={t('No saved posts yet')} message={t('Save community posts to find them here later.')} actionLabel={t('Browse community')} actionTo="/" />
      ) : null}
      {posts.map((post) => (
        <ScamPostCard
          key={post.id}
          post={post}
          onOpenPost={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onOpenComments={() => navigate(`/posts/${encodeURIComponent(post.id)}`)}
          onToggleLike={() => toggleLike(post.id)}
          onToggleSave={() => toggleSave(post.id)}
          onShare={(channel) => recordShare(post.id, channel)}
        />
      ))}
    </main>
  )
}
