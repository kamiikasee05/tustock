interface SkeletonProps {
  width?: number | string
  height?: number | string
  variant?: 'text' | 'circle' | 'rect'
  style?: React.CSSProperties
}

export default function Skeleton({ width = '100%', height = 16, variant = 'text', style: override }: SkeletonProps) {
  const base: React.CSSProperties = {
    width,
    height,
    borderRadius: variant === 'circle' ? '50%' : variant === 'rect' ? 'var(--radius-md)' : 'var(--radius-sm)',
    background: 'linear-gradient(90deg, var(--border) 25%, var(--surface-hover) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...override,
  }
  return <div style={base} />
}
