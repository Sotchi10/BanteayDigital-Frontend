<<<<<<< HEAD
import { useMemo, useState } from "react";
import { Card, Icon } from "../../../components/ui";
import { posts } from "../../../data/mockCommunity";
import { PostComposer } from "./PostComposer";
import { ScamPostCard } from "./ScamPostCard";

const filters = [
  { value: "all", label: "All Reports" },
  { value: "verified", label: "Verified" },
  { value: "high-risk", label: "High Risk" },
  { value: "under-review", label: "Under Review" },
  { value: "most-recent", label: "Most Recent" },
];

export function CommunityFeed() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visiblePosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      const matchesSearch = !search || [post.author, post.category, post.title, post.description, post.evidence?.link].some((value) => value?.toLowerCase().includes(search));
      const matchesFilter = filter === "all" || filter === "most-recent" || (filter === "verified" && post.verified) || (filter === "high-risk" && post.risk === "High") || (filter === "under-review" && !post.verified);
      return matchesSearch && matchesFilter;
    });
    return [...filtered].sort((a, b) => posts.indexOf(a) - posts.indexOf(b));
  }, [filter, query]);

  return (
    <main className="flex min-w-0 flex-col gap-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-10 scrollbar-color:#b8c8d9_transparent] lg:[scrollbar-width:thin]" id="main-content">
      <PostComposer value={query} onChange={setQuery} />

      <section aria-labelledby="community-feed-heading">
        <div className="mb-4 flex flex-col gap-2 px-0.5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="community-feed-heading" className="m-0 text-lg font-bold text-brand-900">Latest scam reports</h2>
          <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#52647a]"><span>Filter</span><select className="min-h-11 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none transition hover:border-[#b8c8d9] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter community reports">{filters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <div className="grid gap-4">
          {visiblePosts.map((post) => <ScamPostCard key={post.id} post={post} />)}
          {visiblePosts.length === 0 ? <Card className="p-8 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f2f4f7] text-muted"><Icon name="search" /></span><h3 className="mb-1 mt-3 text-base">No matching reports</h3><p className="m-0 text-sm text-muted">Try another keyword or clear the selected filter.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-4 min-h-11 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-brand-800 hover:bg-brand-100">Clear filters</button></Card> : null}
        </div>
      </section>
=======
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

export function CommunityFeed() {
  const { postId } = useParams()
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [meta, setMeta] = useState(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

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
    <main className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin]">
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
          currentUser={currentUser}
          key={post.id}
          onCommentCountChange={(amount) => changeCommentCount(post.id, amount)}
          onToggleLike={() => toggleLike(post.id)}
          onShare={(channel) => recordShare(post.id, channel)}
          post={post}
        />
      ))}

      {meta && meta.page < meta.totalPages && !query ? (
        <button className="mb-2 rounded-xl border border-line bg-white py-3 text-[13px] font-semibold text-brand-700" disabled={loadingMore} onClick={loadMore} type="button">
          {loadingMore ? 'Loading…' : 'Load more alerts'}
        </button>
      ) : null}
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
    </main>
  )
}
