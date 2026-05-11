import api from './axios'

export const servicesApi = {
  getList: (tenantId) =>
    api.get('/api/services', { params: { tenantId } }),

  create: (data) => api.post('/api/services', data),

  update: (id, data) => api.put(`/api/services/${id}`, data),

  delete: (id) => api.delete(`/api/services/${id}`),
}
