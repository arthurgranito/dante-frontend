import api from './axios'

const withCountryCode = (phone) =>
  phone.startsWith('55') ? phone : `55${phone}`

export const authApi = {
  requestCode: (whatsappNumber) =>
    api.post('/api/auth/request-code', { whatsappNumber: withCountryCode(whatsappNumber) }),

  verifyCode: (whatsappNumber, code) =>
    api.post('/api/auth/verify-code', { whatsappNumber: withCountryCode(whatsappNumber), code }),
}
