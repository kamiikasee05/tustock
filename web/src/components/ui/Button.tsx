import { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: ReactNode
  type?: 'button' | 'submit'
  style?: React.CSSProperties
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: 'var(--primary)', color: 'white', border: 'none' },
  secondary: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
  danger: { background: 'var(--danger)', color: 'white', border: 'none' },
  success: { background: 'var(--success)', color: '#000', border: 'none' },
  ghost: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid transparent' },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, borderRadius: 'var(--radius-sm)' },
  md: { padding: '8px 16px', fontSize: 14, borderRadius: 'var(--radius-md)' },
  lg: { padding: '10px 24px', fontSize: 15, borderRadius: 'var(--radius-md)' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  type = 'button',
  style: override,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'opacity var(--transition), background var(--transition)',
        ...override,
      }}
    >
      {loading && (
        <span style={{
          width: 14,
          height: 14,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  )
}
