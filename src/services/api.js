import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

async function request(path, options = {}) {
  const { body, data, ...config } = options
  const payload = data ?? body
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData
  const response = await apiClient(path, {
    ...config,
    // A manually supplied multipart header has no boundary and is rejected by
    // Multer. Let the browser generate it for image-scan uploads.
    headers: isFormData ? { ...config.headers, 'Content-Type': undefined } : config.headers,
    data: payload,
  })

  const contentType = response.headers?.['content-type'] || ''
  if (typeof response.data === 'string' || !contentType.includes('application/json')) {
    const error = new Error('The backend service is not connected yet.')
    error.response = {
      status: 503,
      data: { message: 'The backend service is not connected yet.' },
    }
    throw error
  }

  return response.data
}

export { request }
