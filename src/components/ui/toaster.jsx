import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '../../utils/cn'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const toastVariants = {
  default: 'bg-card border border-border',
  success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  error: 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300',
  warning: 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300',
}

const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-2xl p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
      toastVariants[variant] || toastVariants.default,
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

// Estado global de toasts
let toastState = { toasts: [], listeners: [] }

function addToast(toast) {
  const id = Math.random().toString(36).slice(2)
  const newToast = { id, open: true, ...toast }
  toastState.toasts = [...toastState.toasts, newToast]
  toastState.listeners.forEach((l) => l([...toastState.toasts]))
  setTimeout(() => removeToast(id), toast.duration || 4000)
}

function removeToast(id) {
  toastState.toasts = toastState.toasts.filter((t) => t.id !== id)
  toastState.listeners.forEach((l) => l([...toastState.toasts]))
}

export function toast({ title, description, variant = 'default', duration = 4000 }) {
  addToast({ title, description, variant, duration })
}

export function Toaster() {
  const [toasts, setToasts] = React.useState([])

  React.useEffect(() => {
    toastState.listeners.push(setToasts)
    return () => {
      toastState.listeners = toastState.listeners.filter((l) => l !== setToasts)
    }
  }, [])

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />,
    default: <Info className="h-5 w-5 text-primary shrink-0" />,
  }

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, open }) => (
        <Toast key={id} variant={variant} open={open} onOpenChange={(o) => !o && removeToast(id)}>
          <div className="flex items-start gap-3">
            {iconMap[variant] || iconMap.default}
            <div className="flex-1 grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
