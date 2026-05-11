import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, ClipboardList, Calendar, Scissors, LogOut, Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/button'
import { cn } from '../utils/cn'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/historico', label: 'Histórico', icon: ClipboardList },
  { to: '/agenda', label: 'Agenda', icon: Calendar },
  { to: '/servicos', label: 'Serviços', icon: Scissors },
]

function SidebarNav({ onClose }) {
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
        <img src="/logo.png" alt="Dante" width={40} height={40} className="object-contain" />
        <div>
          <p className="text-xs text-muted-foreground">Bem-vindo,</p>
          <p className="font-semibold text-sm leading-tight truncate max-w-[140px]">
            {user?.businessName || 'Dante Assistant'}
          </p>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn('sidebar-link', isActive ? 'sidebar-link-active' : 'sidebar-link-inactive')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-white' : ''} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-xl bg-primary -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="sidebar-link sidebar-link-inactive w-full"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
        </button>
        <button
          onClick={logout}
          className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm relative">
        <SidebarNav />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted"
              >
                <X size={20} />
              </button>
              <SidebarNav onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Dante" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-sm">Dante</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Área de conteúdo com scroll */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
