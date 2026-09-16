import { request } from '../../../services/api'

function listCommunityPosts({ page = 1, limit = 20 } = {}) {
  return request('/v1/community/posts', { params: { page, limit } })
}

function getCommunityPost(postId) {
  return request(`/v1/community/posts/${postId}`)
}

function likeCommunityPost(postId) {
  return request(`/v1/community/posts/${postId}/like`, { method: 'PUT' })
}

function unlikeCommunityPost(postId) {
  return request(`/v1/community/posts/${postId}/like`, { method: 'DELETE' })
}

function listSavedCommunityPosts({ page = 1, limit = 20 } = {}) {
  return request('/v1/community/posts/saved', { params: { page, limit } })
}

function saveCommunityPost(postId) {
  return request(`/v1/community/posts/${postId}/save`, { method: 'PUT' })
}

function unsaveCommunityPost(postId) {
  return request(`/v1/community/posts/${postId}/save`, { method: 'DELETE' })
}

function recordCommunityPostShare(postId, channel) {
  return request(`/v1/community/posts/${postId}/shares`, { method: 'POST', body: { channel } })
}

function listPostComments(postId, { limit = 20, cursor, parentId } = {}) {
  return request(`/v1/community/posts/${postId}/comments`, {
    params: { limit, ...(cursor ? { cursor } : {}), ...(parentId ? { parentId } : {}) },
  })
}

function createPostComment(postId, { content, parentId = null }) {
  return request(`/v1/community/posts/${postId}/comments`, { method: 'POST', body: { content, parentId } })
}

function updateCommunityComment(commentId, content) {
  return request(`/v1/community/comments/${commentId}`, { method: 'PATCH', body: { content } })
}

function deleteCommunityComment(commentId) {
  return request(`/v1/community/comments/${commentId}`, { method: 'DELETE' })
}

function reportCommunityComment(commentId, reason, details) {
  return request(`/v1/community/comments/${commentId}/report`, {
    method: 'POST',
    body: { reason, ...(details ? { details } : {}) },
  })
}

function moderateCommunityComment(commentId, status) {
  return request(`/v1/community/comments/${commentId}/moderation`, { method: 'PATCH', body: { status } })
}

async function getCurrentUser() {
  try {
    const response = await request('/v1/auth/me')
    return response.user
  } catch (error) {
    if ([401, 403].includes(error.response?.status)) return null
    throw error
  }
}

function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || fallback
}

export {
  apiErrorMessage,
  createPostComment,
  deleteCommunityComment,
  getCurrentUser,
  getCommunityPost,
  likeCommunityPost,
  listCommunityPosts,
  listSavedCommunityPosts,
  listPostComments,
  moderateCommunityComment,
  recordCommunityPostShare,
  reportCommunityComment,
  saveCommunityPost,
  unlikeCommunityPost,
  unsaveCommunityPost,
  updateCommunityComment,
}
