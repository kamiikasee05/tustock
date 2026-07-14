import { ReactNode } from 'react'
import Skeleton from './Skeleton'

interface Column<T> {
  key: string
  label: string
  render?: (row: T, index: number) => ReactNode
  width?: number | string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T, index: number) => void
  emptyMessage?: string
  loading?: boolean
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Sin datos',
  loading = false,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            {columns.map((col, i) => (
              <div key={i} style={{ flex: col.width ? undefined : 1, width: col.width }}>
                <Skeleton width="60%" height={12} variant="text" />
              </div>
            ))}
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            gap: 16,
          }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ flex: col.width ? undefined : 1, width: col.width }}>
                <Skeleton width={`${60 + Math.random() * 30}%`} height={14} variant="text" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>📭</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'sticky',
        top: 0,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        gap: 16,
        zIndex: 1,
      }}>
        {columns.map((col, i) => (
          <div key={i} style={{
            flex: col.width ? undefined : 1,
            width: col.width,
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
          }}>
            {col.label}
          </div>
        ))}
      </div>
      {data.map((row, ri) => (
        <div
          key={ri}
          onClick={() => onRowClick?.(row, ri)}
          style={{
            padding: '10px 16px',
            borderBottom: ri < data.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            gap: 16,
            cursor: onRowClick ? 'pointer' : undefined,
            transition: 'background var(--transition)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {columns.map((col, ci) => (
            <div key={ci} style={{
              flex: col.width ? undefined : 1,
              width: col.width,
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {col.render ? col.render(row, ri) : row[col.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
