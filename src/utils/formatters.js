// Formatadores de moeda e data para pt-BR

export function formatCurrency(value) {
  if (value == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Suporta "dd/MM/yyyy HH:mm" e ISO 8601
  let date
  if (dateStr.includes('T')) {
    date = new Date(dateStr)
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')
    const [d, m, y] = parts[0].split('/')
    date = new Date(`${y}-${m}-${d}T${parts[1] || '00:00'}`)
  } else {
    date = new Date(dateStr)
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  let date
  if (dateStr.includes('T')) {
    date = new Date(dateStr)
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')
    const [d, m, y] = parts[0].split('/')
    date = new Date(`${y}-${m}-${d}T${parts[1] || '00:00'}`)
  } else {
    date = new Date(dateStr)
  }
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatTime(dateStr) {
  if (!dateStr) return '—'
  let date
  if (dateStr.includes('T')) {
    date = new Date(dateStr)
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split(' ')
    const [d, m, y] = parts[0].split('/')
    date = new Date(`${y}-${m}-${d}T${parts[1] || '00:00'}`)
  } else {
    date = new Date(dateStr)
  }
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// Formata número de telefone brasileiro: 21976318326 → (21) 97631-8326
export function formatPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

// Converte Date para formato dd/MM/yyyy usado na API
export function toApiDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}
