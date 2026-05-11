import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2, Scissors } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { servicesApi } from '../../api/services'
import { formatCurrency } from '../../utils/formatters'
import PageWrapper from '../../components/PageWrapper'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../../components/ui/dialog'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { toast } from '../../components/ui/toaster'
import { CardSkeleton } from '../../components/Skeleton'

// Seletor de emojis simples para serviços
const EMOJI_OPTIONS = [
  '✂️', '💆', '💅', '🧴', '🪒', '💇', '🧖', '💪', '🩺', '📸',
  '🎸', '🎹', '🏠', '🔧', '🎨', '📚', '💻', '🚗', '🌿', '⚡',
]

function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 p-2 border border-border rounded-xl bg-muted/30">
      {EMOJI_OPTIONS.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={`w-9 h-9 rounded-lg text-lg transition-all ${
            value === e
              ? 'bg-primary text-white shadow scale-110'
              : 'hover:bg-muted hover:scale-105'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  )
}

function ServiceModal({ open, onClose, tenantId, service, onSuccess }) {
  const isEditing = !!service
  const [form, setForm] = useState({
    name: service?.name || '',
    price: service?.price ?? '',
    emoji: service?.emoji || '✂️',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.price === '') {
      toast({ title: 'Preencha todos os campos', variant: 'error' })
      return
    }
    setLoading(true)
    try {
      if (isEditing) {
        await servicesApi.update(service.id, {
          name: form.name,
          price: Number(form.price),
          emoji: form.emoji,
        })
        toast({ title: 'Serviço atualizado!', variant: 'success' })
      } else {
        await servicesApi.create({
          tenantId,
          name: form.name,
          price: Number(form.price),
          emoji: form.emoji,
        })
        toast({ title: 'Serviço criado!', variant: 'success' })
      }
      onSuccess()
    } catch {
      toast({ title: `Erro ao ${isEditing ? 'atualizar' : 'criar'} serviço`, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar serviço' : 'Novo serviço'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Emoji do serviço</Label>
            <EmojiPicker value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e }))} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Nome</Label>
            <Input
              id="svc-name"
              placeholder="Ex: Corte de cabelo"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-price">Preço (R$)</Label>
            <Input
              id="svc-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="50.00"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ServicosPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', user?.tenantId],
    queryFn: () => servicesApi.getList(user.tenantId).then((r) => r.data),
    staleTime: 60_000,
    enabled: !!user?.tenantId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => servicesApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Serviço excluído', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: () => toast({ title: 'Erro ao excluir', variant: 'error' }),
  })

  const openAdd = () => {
    setEditingService(null)
    setModalOpen(true)
  }

  const openEdit = (svc) => {
    setEditingService(svc)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['services'] })
    setModalOpen(false)
    setEditingService(null)
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">
            Serviços
          </motion.h1>
          <p className="text-sm text-muted-foreground">
            {services.length} serviço(s) cadastrado(s)
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={openAdd}>
          <Plus size={14} />
          Novo serviço
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : !services.length ? (
        <EmptyState
          icon={Scissors}
          title="Nenhum serviço cadastrado"
          description="Adicione seus serviços para começar a receber agendamentos."
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {services.map((svc, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-5 group hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                {/* Emoji e ações */}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{svc.emoji}</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(svc)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(svc.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <p className="font-semibold text-sm">{svc.name}</p>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatCurrency(svc.price)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal criar/editar */}
      <ServiceModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingService(null) }}
        tenantId={user?.tenantId}
        service={editingService}
        onSuccess={handleModalSuccess}
      />

      {/* Confirmação exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Excluir serviço"
        description="O serviço será removido permanentemente."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          deleteMutation.mutate(deleteId)
          setDeleteId(null)
        }}
      />
    </PageWrapper>
  )
}
