import { ReactNode } from 'react'

interface CardProps {
  title?: string
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
  children: ReactNode
  style?: React.CSSProperties
}

const paddingMap = { sm: 12, md: 20, lg: 28 }

export default function Card({ title, padding = 'md', hoverable = false, onClick, children, style: override }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: paddingMap[padding],
        cursor: hoverable || onClick ? 'pointer' : undefined,
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        ...override,
      }}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.15)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      {title && (
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{title}</div>
      )}
      {children}
    </div>
  )
}
