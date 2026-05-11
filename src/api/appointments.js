import api from './axios'

export const appointmentsApi = {
  getByDate: (tenantId, date) =>
    api.get('/api/appointments', { params: { tenantId, date } }),

  updateStatus: (id, status) =>
    api.put(`/api/appointments/${id}/status`, { status }),

  create: (data) => api.post('/api/appointments', data),
}
