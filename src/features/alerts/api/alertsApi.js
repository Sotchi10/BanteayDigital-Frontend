import { request } from '../../../services/api'

function listAlerts({ page = 1, limit = 100 } = {}) {
  return request('/v1/alerts', { params: { page, limit } })
}

export { listAlerts }
