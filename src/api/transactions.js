import api from './axios'

export const transactionsApi = {
  getList: (tenantId, { start, end, type, page = 0, size = 20 }) => {
    const params = { tenantId, page, size }
    if (start) params.start = start
    if (end) params.end = end
    if (type && type !== 'ALL') params.type = type
    return api.get('/api/transactions', { params })
  },

  delete: (id) => api.delete(`/api/transactions/${id}`),
}
