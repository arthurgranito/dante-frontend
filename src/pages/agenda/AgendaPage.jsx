import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle,
  XCircle, Loader2, Plus, Calendar,
} from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { appointmentsApi } from '../../api/appointments'
import { toApiDate, formatTime } from '../../utils/formatters'
import PageWrapper from '../../components/PageWrapper'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../../components/ui/select'
import EmptyState from '../../components/EmptyState'
import { toast } from '../../components/ui/toaster'
import { Skeleton } from '../../components/Skeleton'
import { servicesApi } from '../../api/services'

const STATUS_CONFIG = {
  SCHEDULED: { label: 'Agendado', variant: 'scheduled', icon: Clock },
  IN_PROGRESS: { label: 'Em andamento', variant: 'in_progress', icon: Loader2 },
  COMPLETED: { label: 'Concluído', variant: 'completed', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', variant: 'cancelled', icon: XCircle },
}

const NEXT_STATUS = {
  SCHEDULED: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
}

const NEXT_STATUS_LABEL = {
  SCHEDULED: 'Iniciar',
  IN_PROGRESS: 'Concluir',
}

function AppointmentCard({ appt, onStatusChange, loading }) {
  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.SCHEDULED
  const StatusIcon = cfg.icon
  const nextStatus = NEXT_STATUS[appt.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4"
    >
      <div className="text-2xl shrink-0">{appt.serviceEmoji || '📅'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm">{appt.clientName}</p>
          <Badge variant={cfg.variant} className="text-[10px]">
            <StatusIcon size={10} className="mr-1" />
            {cfg.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{appt.serviceName}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock size={10} />
          {formatTime(appt.scheduledAt)}
        </p>
      </div>
      {nextStatus && (
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 text-xs"
          disabled={loading}
          onClick={() => onStatusChange(appt.id, nextStatus)}
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : NEXT_STATUS_LABEL[appt.status]}
        </Button>
      )}
    </motion.div>
  )
}

export default function AgendaPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [addOpen, setAddOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const dateStr = toApiDate(selectedDate)

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.tenantId, dateStr],
    queryFn: () =>
      appointmentsApi.getByDate(user.tenantId, dateStr).then((r) => r.data),
    staleTime: 30_000,
    enabled: !!user?.tenantId,
  })

  const { data: services = [] } = useQuery({
    queryKey: ['services', user?.tenantId],
    queryFn: () => servicesApi.getList(user.tenantId).then((r) => r.data),
    staleTime: 60_000,
    enabled: !!user?.tenantId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.updateStatus(id, status),
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: () => {
      toast({ title: 'Status atualizado', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
    onError: () => toast({ title: 'Erro ao atualizar status', variant: 'error' }),
    onSettled: () => setUpdatingId(null),
  })

  const formattedDate = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">
            Agenda
          </motion.h1>
          <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Novo
        </Button>
      </div>

      {/* Navegação de data */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 mb-5"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
        >
          <ChevronLeft size={16} />
        </Button>
        <div className="flex-1">
          <Input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const d = new Date(e.target.value + 'T12:00:00')
              if (!isNaN(d)) setSelectedDate(d)
            }}
            className="text-center h-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setSelectedDate(new Date())}
        >
          Hoje
        </Button>
      </motion.div>

      {/* Lista de agendamentos */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex gap-4">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !appointments.length ? (
        <EmptyState
          icon={Calendar}
          title="Nenhum agendamento"
          description={`Não há agendamentos para ${formattedDate}.`}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                loading={updatingId === appt.id}
                onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal novo agendamento */}
      <AddAppointmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tenantId={user?.tenantId}
        services={services}
        selectedDate={selectedDate}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] })
          setAddOpen(false)
        }}
      />
    </PageWrapper>
  )
}

function AddAppointmentModal({ open, onClose, tenantId, services, selectedDate, onSuccess }) {
  const [form, setForm] = useState({
    clientName: '',
    serviceId: '',
    time: '09:00',
  })
  const [loading, setLoading] = useState(false)

  const selectedService = services.find((s) => String(s.id) === form.serviceId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientName || !form.serviceId) {
      toast({ title: 'Preencha todos os campos', variant: 'error' })
      return
    }
    setLoading(true)
    const [h, m] = form.time.split(':')
    const dt = new Date(selectedDate)
    dt.setHours(Number(h), Number(m), 0, 0)
    const scheduledAt = `${toApiDate(dt)} ${form.time}`
    try {
      await appointmentsApi.create({
        tenantId,
        clientName: form.clientName,
        serviceName: selectedService?.name || '',
        serviceEmoji: selectedService?.emoji || '📅',
        scheduledAt,
      })
      toast({ title: 'Agendamento criado!', variant: 'success' })
      setForm({ clientName: '', serviceId: '', time: '09:00' })
      onSuccess()
    } catch (err) {
      toast({ title: 'Erro ao criar agendamento', variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Input
              placeholder="Nome do cliente"
              value={form.clientName}
              onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Serviço</Label>
            <Select value={form.serviceId} onValueChange={(v) => setForm((f) => ({ ...f, serviceId: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.emoji} {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Horário</Label>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
