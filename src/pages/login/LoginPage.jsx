import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ArrowRight, MessageCircle, Loader2, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { toast } from '../../components/ui/toaster'

// Máscara de telefone: 21976318326 → (21) 97631-8326
function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return value
}

function extractDigits(masked) {
  return masked.replace(/\D/g, '')
}

// Etapa 1: input de telefone
function PhoneStep({ onNext }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const digits = extractDigits(phone)
    if (digits.length < 10) {
      toast({ title: 'Número inválido', description: 'Digite um número brasileiro válido.', variant: 'error' })
      return
    }
    setLoading(true)
    try {
      await authApi.requestCode(digits)
      toast({ title: 'Código enviado!', description: 'Verifique seu WhatsApp.', variant: 'success' })
      onNext(digits)
    } catch (err) {
      const msg = err.response?.data?.message || 'Número não encontrado ou erro ao enviar código.'
      toast({ title: 'Erro', description: msg, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      key="phone"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Número do WhatsApp
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="(21) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              className="pl-10 h-12 text-base"
              autoFocus
              autoComplete="tel"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Enviaremos um código de verificação para este número.
          </p>
        </div>
        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          {loading ? 'Enviando...' : 'Enviar código via WhatsApp'}
        </Button>
      </form>
    </motion.div>
  )
}

// Etapa 2: 6 inputs OTP
function OtpStep({ phone, onBack }) {
  const { login } = useAuth()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (idx, val) => {
    // Suporta colar o código completo
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6)
      const newCode = [...code]
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || ''
      }
      setCode(newCode)
      inputRefs.current[Math.min(digits.length, 5)]?.focus()
      return
    }
    const digit = val.replace(/\D/g, '')
    const newCode = [...code]
    newCode[idx] = digit
    setCode(newCode)
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length < 6) {
      toast({ title: 'Código incompleto', description: 'Digite os 6 dígitos do código.', variant: 'error' })
      return
    }
    setLoading(true)
    try {
      const res = await authApi.verifyCode(phone, fullCode)
      const { token, tenantId, businessName } = res.data
      toast({ title: 'Login realizado!', description: `Bem-vindo, ${businessName || 'Dante'}!`, variant: 'success' })
      login({ token, tenantId, businessName })
    } catch (err) {
      const msg = err.response?.data?.message || 'Código inválido ou expirado.'
      toast({ title: 'Código inválido', description: msg, variant: 'error' })
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Código enviado para <span className="font-semibold text-foreground">{phone}</span>
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none transition-all"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Não recebeu? O código pode demorar até 1 minuto.
          </p>
        </div>
        <Button type="submit" size="lg" className="w-full gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? 'Verificando...' : 'Entrar'}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Usar outro número
        </button>
      </form>
    </motion.div>
  )
}

export default function LoginPage() {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Gradiente de fundo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-secondary px-8 py-10 text-white text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring' }}
              className="flex justify-center mb-4"
            >
              <img src="/logo.png" alt="Dante Assistant" width={80} height={80} className="rounded-full object-cover drop-shadow-lg" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight"
            >
              Dante Assistant
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/70 mt-1"
            >
              Seu assistente de negócios via WhatsApp
            </motion.p>
          </div>

          {/* Indicador de etapa */}
          <div className="flex items-center gap-1 px-8 pt-6">
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step !== 'phone' ? 'bg-primary' : 'bg-primary'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${step === 'otp' ? 'bg-primary' : 'bg-muted'}`} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {step === 'phone' ? 'Passo 1 de 2 — Telefone' : 'Passo 2 de 2 — Verificação'}
          </p>

          {/* Formulário */}
          <div className="px-8 pb-8 pt-5">
            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <PhoneStep
                  key="phone"
                  onNext={(digits) => {
                    setPhone(digits)
                    setStep('otp')
                  }}
                />
              ) : (
                <OtpStep
                  key="otp"
                  phone={phone}
                  onBack={() => setStep('phone')}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Dante Assistant © {new Date().getFullYear()} · Para autônomos brasileiros
        </p>
      </motion.div>
    </div>
  )
}
