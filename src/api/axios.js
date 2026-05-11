import axios from 'axios'

// Instância configurada do Axios com interceptors de autenticação
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://187.77.226.66:8085',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': true
  },
})

// Injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dante_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Trata erros globais: 401 → logout, 500 → mensagem genérica
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dante_token')
      localStorage.removeItem('dante_tenant_id')
      localStorage.removeItem('dante_business_name')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
