import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import MaterialIcon from './ui/MaterialIcon'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const colors = {
    success: 'rgba(80, 216, 144, 0.15)',
    error: 'rgba(255, 180, 171, 0.15)',
    info: 'rgba(77, 142, 255, 0.15)',
  }

  const borderColors = {
    success: 'rgba(80, 216, 144, 0.3)',
    error: 'rgba(255, 180, 171, 0.3)',
    info: 'rgba(77, 142, 255, 0.3)',
  }

  const textColors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--primary)',
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 20px',
              borderRadius: 'var(--radius)',
              background: colors[t.type],
              color: textColors[t.type],
              fontWeight: 600,
              fontSize: 14,
              border: `1px solid ${borderColors[t.type]}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.2s ease',
              maxWidth: 360,
            }}
          >
            <MaterialIcon name={icons[t.type]} size={20} />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
