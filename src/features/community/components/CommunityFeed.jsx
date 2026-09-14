import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  apiErrorMessage,
  getCommunityPost,
  getCurrentUser,
  likeCommunityPost,
  listCommunityPosts,
  recordCommunityPostShare,
  unlikeCommunityPost,
} from '../api/communityApi'
import { PostComposer } from './PostComposer'
import { ScamPostCard } from './ScamPostCard'
import { PostDiscussionModal } from './PostDiscussionModal'

export function CommunityFeed() {
  const { postId } = useParams()
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [meta, setMeta] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [discussionPost, setDiscussionPost] = useState(null)

  useEffect(() => {
    let active = true
    const postRequest = postId
      ? getCommunityPost(postId).then(({ post }) => ({ posts: [post], meta: null }))
      : listCommunityPosts()
    Promise.all([postRequest, getCurrentUser()])
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
  }, [postId])

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
      errorResponse.response = { status: 401, data: { message: 'Sign in to mark posts as helpful.' } }
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

  const changeCommentCount = (postId, amount) => {
    updateInteraction(postId, (interaction) => ({
      ...interaction,
      commentCount: Math.max(0, interaction.commentCount + amount),
    }))
  }

  const changeDiscussionCommentCount = (amount) => {
    if (!discussionPost) return
    changeCommentCount(discussionPost.id, amount)
    setDiscussionPost((current) => current ? {
      ...current,
      interaction: { ...current.interaction, commentCount: Math.max(0, current.interaction.commentCount + amount) },
    } : null)
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
    <main className="flex min-w-0 flex-col gap-3 px-4 pb-3 sm:px-6 lg:px-10" id="main-content">
      {!postId ? <PostComposer onChange={setQuery} value={query} /> : null}
      <div className="flex items-end justify-between px-1 pt-2">
        <div>
          <p className="m-0 text-[15px] font-bold uppercase tracking-wide text-black">{postId ? 'Community alert' : 'Community feed'}</p>
          <p className="m-0 text-[11px] text-muted">Verified safety alerts and community discussion</p>
        </div>
        <span className="rounded-lg border border-[#dfe5ed] bg-white px-2.5 py-1.5 text-[12px] text-[#53627a]">Most recent</span>
      </div>

      {loading ? <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">Loading verified alerts…</div> : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">{error}</div> : null}
      {!loading && !error && visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-8 text-center text-sm text-muted">
          {query ? 'No alerts match your search.' : 'No verified community alerts have been published yet.'}
        </div>
      ) : null}

      {visiblePosts.map((post) => (
        <ScamPostCard
          key={post.id}
          onOpenComments={() => setDiscussionPost(post)}
          onToggleLike={() => toggleLike(post.id)}
          onShare={(channel) => recordShare(post.id, channel)}
          post={post}
        />
      ))}

      {discussionPost ? <PostDiscussionModal currentUser={currentUser} onClose={() => setDiscussionPost(null)} onCommentCountChange={changeDiscussionCommentCount} post={discussionPost} /> : null}

      {meta && meta.page < meta.totalPages && !query ? (
        <button className="mb-2 rounded-xl border border-line bg-white py-3 text-[13px] font-semibold text-brand-700" disabled={loadingMore} onClick={loadMore} type="button">
          {loadingMore ? 'Loading…' : 'Load more alerts'}
        </button>
      ) : null}
    </main>
  )
}
