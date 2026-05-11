import api from './axios'

export const dashboardApi = {
  getSummary: (tenantId) =>
    api.get('/api/dashboard/summary', { params: { tenantId } }),
}
