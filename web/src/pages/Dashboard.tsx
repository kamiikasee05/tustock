import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, fontFamily: "'Geist Mono', monospace" }}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <KPICard label="Ventas hoy" value={`$${todaySummary?.total_sales?.toLocaleString() || '0'}`} sub={`${todaySummary?.transaction_count || 0} transacciones`} color="#4d8eff" />
        <KPICard label="Artículos vendidos" value={todaySummary?.items_sold || 0} sub={`${todaySummary?.transaction_count || 0} ventas`} color="#4ade80" />
        <KPICard label="Ticket promedio" value={`$${todaySummary?.average_ticket?.toFixed(0) || '0'}`} sub="por transacción" color="#fbbf24" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{
          background: 'rgba(30,41,59,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(251,191,36,0.12)' }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#fbbf24' }}>warning</span>
            </span>
            Stock Bajo ({lowStock.length})
          </h3>
          {lowStock.length === 0 ? (
            <p style={{ color: '#4ade80', fontSize: 13, padding: '12px 0' }}>Todos los productos tienen stock suficiente</p>
          ) : (
            <div>
              {lowStock.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#8b95a5', marginTop: 2, fontFamily: "'Geist Mono', monospace" }}>{item.code}</div>
                  </div>
                  <div style={{ width: 60, height: 4, background: '#2e3138', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 2,
                      width: `${item.min_stock > 0 ? Math.min(100, (item.current / item.min_stock) * 100) : 0}%`,
                      background: item.current === 0 ? '#f87171' : '#fbbf24',
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: item.current === 0 ? '#f87171' : '#e1e2ec', minWidth: 32, textAlign: 'right' }}>{item.current}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    background: item.current === 0 ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)',
                    color: item.current === 0 ? '#f87171' : '#fbbf24',
                  }}>
                    {item.current === 0 ? 'AGOTADO' : 'REPONER'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(30,41,59,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: 20,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(77,142,255,0.12)' }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#4d8eff' }}>bolt</span>
            </span>
            Acciones rápidas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <QuickLink to="/sales" icon="point_of_sale" label="Nueva venta" color="#4d8eff" />
            <QuickLink to="/products" icon="inventory_2" label="Agregar producto" color="#4ade80" />
            <QuickLink to="/audits" icon="fact_check" label="Iniciar auditoría" color="#fbbf24" />
            <QuickLink to="/reports" icon="assessment" label="Generar informe" color="#8b95a5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div style={{
      background: 'rgba(30,41,59,0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '18px 20px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '.5px', color: '#8b95a5', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#e1e2ec', fontFamily: "'Geist Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 12, color: '#8b95a5', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

function QuickLink({ to, icon, label, color }: { to: string; icon: string; label: string; color: string }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 8,
        color: '#e1e2ec',
        fontWeight: 500,
        fontSize: 13,
        textDecoration: 'none',
        borderLeft: `3px solid ${color}`,
        transition: 'background .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
    >
      <span className="material-icons" style={{ fontSize: 18, color }}>{icon}</span>
      {label}
    </Link>
  )
}
