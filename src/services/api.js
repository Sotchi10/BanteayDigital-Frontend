import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

async function request(path, options = {}) {
  const { body, data, ...config } = options
  const response = await apiClient(path, {
    ...config,
    data: data ?? body,
  })

  return response.data
}

function getHealth() {
  return request('/health')
}

export { apiClient, getHealth, request }
