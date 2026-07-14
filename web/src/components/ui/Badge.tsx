import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
}

const colorMap: Record<string, { bg: string; fg: string }> = {
  success: { bg: 'rgba(34,197,94,0.15)', fg: 'var(--success)' },
  warning: { bg: 'rgba(245,158,11,0.15)', fg: 'var(--warning)' },
  danger: { bg: 'rgba(239,68,68,0.15)', fg: 'var(--danger)' },
  info: { bg: 'rgba(59,130,246,0.15)', fg: 'var(--primary)' },
  neutral: { bg: 'rgba(148,163,184,0.15)', fg: 'var(--text-muted)' },
}

export default function Badge({ variant = 'neutral', children }: BadgeProps) {
  const c = colorMap[variant]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.fg,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}
