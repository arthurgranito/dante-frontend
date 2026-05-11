import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar,
  ArrowUpCircle, ArrowDownCircle,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { dashboardApi } from '../../api/dashboard'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import PageWrapper from '../../components/PageWrapper'
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '../../components/Skeleton'
import { Badge } from '../../components/ui/badge'
import EmptyState from '../../components/EmptyState'

// Cartão de métrica animado
function MetricCard({ title, value, icon: Icon, colorClass, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="metric-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-xl ${colorClass}`}>
          <Icon size={18} className="opacity-90" />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
              : 'text-red-600 bg-red-50 dark:bg-red-500/10'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
    </motion.div>
  )
}

// Tooltip customizado para o gráfico
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-semibold text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', user?.tenantId],
    queryFn: () => dashboardApi.getSummary(user.tenantId).then((r) => r.data),
    staleTime: 30_000,
    enabled: !!user?.tenantId,
  })

  const metrics = [
    {
      title: 'Receitas hoje',
      value: formatCurrency(data?.todayIncome),
      icon: ArrowUpCircle,
      colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      delay: 0,
    },
    {
      title: 'Despesas hoje',
      value: formatCurrency(data?.todayExpense),
      icon: ArrowDownCircle,
      colorClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
      delay: 0.05,
    },
    {
      title: 'Lucro hoje',
      value: formatCurrency(data?.todayProfit),
      icon: data?.todayProfit >= 0 ? TrendingUp : TrendingDown,
      colorClass: data?.todayProfit >= 0
        ? 'bg-primary/10 text-primary'
        : 'bg-red-500/10 text-red-600',
      delay: 0.1,
    },
    {
      title: 'Agendamentos hoje',
      value: data?.todayAppointments ?? '—',
      icon: Calendar,
      colorClass: 'bg-accent/10 text-accent-500',
      delay: 0.15,
    },
  ]

  if (error) {
    return (
      <PageWrapper>
        <EmptyState
          title="Erro ao carregar dashboard"
          description="Verifique sua conexão e tente novamente."
        />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Cabeçalho */}
      <div className="mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          Resumo do dia de hoje
        </motion.p>
      </div>

      {/* Métricas */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <MetricCard key={m.title} {...m} />
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Gráfico de área — últimos 7 dias */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="font-semibold mb-1">Receitas — últimos 7 dias</h2>
              <p className="text-xs text-muted-foreground mb-4">Evolução de receitas diárias</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.last7DaysRevenue || []}>
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a472a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1a472a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `R$${v}`}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#1a472a"
                    strokeWidth={2.5}
                    fill="url(#greenGrad)"
                    dot={{ r: 3, fill: '#1a472a' }}
                    activeDot={{ r: 5, fill: '#f59e0b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Últimas transações */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="h-5 bg-muted rounded w-1/2 skeleton" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full skeleton" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                  </div>
                  <div className="h-4 skeleton rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="font-semibold mb-1">Últimas transações</h2>
              <p className="text-xs text-muted-foreground mb-4">5 mais recentes</p>
              {!data?.lastTransactions?.length ? (
                <EmptyState title="Sem transações" description="Nenhuma transação registrada ainda." />
              ) : (
                <div className="space-y-3">
                  {data.lastTransactions.slice(0, 5).map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`p-2 rounded-full shrink-0 ${
                        tx.type === 'INCOME'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}>
                        {tx.type === 'INCOME'
                          ? <ArrowUpCircle size={14} />
                          : <ArrowDownCircle size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {tx.serviceName || tx.category || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.clientName} · {formatDateTime(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${
                          tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} className="text-[10px] mt-0.5">
                          {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
