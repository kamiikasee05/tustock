import { useState, useEffect } from 'react'
import { api, LowStockItem } from '../api/client'

export default function Dashboard() {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [todaySummary, setTodaySummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get<LowStockItem[]>('/products/alerts/low-stock'),
      api.get<any>('/sales/today/summary'),
    ])
      .then(([alerts, summary]) => {
        setLowStock(alerts)
        setTodaySummary(summary)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Ventas hoy" value={`$${todaySummary?.total_sales?.toLocaleString() || '0'}`} color="var(--primary)" />
        <StatCard label="Transacciones" value={todaySummary?.transaction_count || 0} color="var(--success)" />
        <StatCard label="Artículos vendidos" value={todaySummary?.items_sold || 0} color="var(--warning)" />
        <StatCard
          label="Ticket promedio"
          value={`$${todaySummary?.average_ticket?.toFixed(2) || '0.00'}`}
          color="var(--text-muted)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            ⚠ Productos con stock bajo ({lowStock.length})
          </h3>
          {lowStock.length === 0 ? (
            <p style={{ color: 'var(--success)', fontSize: 14 }}>Todos los productos tienen stock suficiente</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>Producto</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>Actual</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>Mínimo</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0', fontSize: 14 }}>
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 0', color: 'var(--danger)', fontWeight: 700, fontSize: 16 }}>{item.current}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0', fontSize: 14 }}>{item.min_stock}</td>
                    <td style={{ textAlign: 'right', padding: '10px 0' }}>
                      <span style={{
                        background: item.current === 0 ? 'var(--danger)' : 'var(--warning)',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                      }}>
                        {item.current === 0 ? 'AGOTADO' : 'REPONER'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Acciones rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <QuickAction label="Nueva venta" href="/sales" color="var(--primary)" />
            <QuickAction label="Agregar producto" href="/products" color="var(--success)" />
            <QuickAction label="Iniciar auditoría" href="/audits" color="var(--warning)" />
            <QuickAction label="Generar informe" href="/reports" color="var(--text-muted)" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function QuickAction({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '12px 16px',
        background: 'var(--bg)',
        borderRadius: 8,
        color,
        fontWeight: 500,
        fontSize: 14,
        textDecoration: 'none',
        borderLeft: `3px solid ${color}`,
      }}
    >
      {label} →
    </a>
  )
}
