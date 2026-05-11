import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { transactionsApi } from '../../api/transactions'
import { formatCurrency, formatDateTime, toApiDate } from '../../utils/formatters'
import PageWrapper from '../../components/PageWrapper'
import { TableSkeleton } from '../../components/Skeleton'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import ConfirmDialog from '../../components/ConfirmDialog'
import EmptyState from '../../components/EmptyState'
import { toast } from '../../components/ui/toaster'

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
]

function getDefaultDates() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

export default function HistoricoPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const defaults = getDefaultDates()
  const [filters, setFilters] = useState({
    start: defaults.start,
    end: defaults.end,
    type: 'ALL',
    page: 0,
  })
  const [pendingFilters, setPendingFilters] = useState({ ...filters })
  const [deleteId, setDeleteId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', user?.tenantId, filters],
    queryFn: () =>
      transactionsApi.getList(user.tenantId, {
        start: toApiDate(new Date(filters.start)),
        end: toApiDate(new Date(filters.end)),
        type: filters.type,
        page: filters.page,
        size: 20,
      }).then((r) => r.data),
    staleTime: 60_000,
    enabled: !!user?.tenantId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionsApi.delete(id),
    onSuccess: () => {
      toast({ title: 'Transação excluída', variant: 'success' })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => toast({ title: 'Erro ao excluir', variant: 'error' }),
  })

  const applyFilters = () => {
    setFilters({ ...pendingFilters, page: 0 })
  }

  const transactions = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalElements = data?.totalElements || 0

  return (
    <PageWrapper>
      <div className="mb-6">
        <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-bold">
          Histórico
        </motion.h1>
        <p className="text-sm text-muted-foreground">Todas as suas transações</p>
      </div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-4 mb-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Data início</Label>
            <Input
              type="date"
              value={pendingFilters.start}
              onChange={(e) => setPendingFilters((f) => ({ ...f, start: e.target.value }))}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data fim</Label>
            <Input
              type="date"
              value={pendingFilters.end}
              onChange={(e) => setPendingFilters((f) => ({ ...f, end: e.target.value }))}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <Select
              value={pendingFilters.type}
              onValueChange={(v) => setPendingFilters((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={applyFilters} size="sm" className="gap-2 h-9">
            <Filter size={14} />
            Filtrar
          </Button>
        </div>
      </motion.div>

      {/* Contagem */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground mb-3">
          {totalElements} transação(ões) encontrada(s)
        </p>
      )}

      {/* Tabela */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : !transactions.length ? (
        <EmptyState
          title="Nenhuma transação encontrada"
          description="Tente ajustar os filtros de data ou tipo."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          {/* Desktop: tabela */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Serviço/Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pagamento</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>
                        {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {tx.serviceName || tx.category || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tx.clientName || '—'}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {tx.paymentMethod || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="md:hidden divide-y divide-border">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} className="text-[10px]">
                      {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{tx.paymentMethod}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{tx.serviceName || tx.category || '—'}</p>
                  <p className="text-xs text-muted-foreground">{tx.clientName} · {formatDateTime(tx.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <button
                    onClick={() => setDeleteId(tx.id)}
                    className="mt-1 p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            disabled={filters.page === 0}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {filters.page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            disabled={filters.page >= totalPages - 1}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Excluir transação"
        description="Esta transação será removida permanentemente. Essa ação não pode ser desfeita."
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
