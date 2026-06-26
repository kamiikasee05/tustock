import { ReactNode, useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { api, LowStockItem } from '../api/client'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/pedidos', label: 'Pedidos', icon: '📝' },
  { to: '/presupuestos', label: 'Presupuestos', icon: '📋' },
  { to: '/products', label: 'Productos', icon: '📦' },
  { to: '/sales', label: 'Ventas', icon: '💰' },
  { to: '/customers', label: 'Clientes', icon: '👥' },
  { to: '/audits', label: 'Auditorías', icon: '🔍' },
  { to: '/reports', label: 'Informes', icon: '📊' },
  { to: '/scanner', label: 'Scanner', icon: '📱' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [alerts, setAlerts] = useState<LowStockItem[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    api.get('/health')
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'))
  }, [])

  useEffect(() => {
    if (serverStatus === 'online') {
      const poll = () => {
        api.get<LowStockItem[]>('/products/alerts/low-stock').then(setAlerts).catch(() => {})
        api.get<any[]>('/pending-orders').then(o => setPendingCount(o.length)).catch(() => {})
      }
      poll()
      const interval = setInterval(poll, 10000)
      return () => clearInterval(interval)
    }
  }, [serverStatus])

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        padding: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>TUSTOCK</h1>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {serverStatus === 'checking' && 'Conectando...'}
            {serverStatus === 'online' && '● Servidor conectado'}
            {serverStatus === 'offline' && '● Sin conexión - Inicie el servidor'}
          </span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                color: isActive ? 'var(--primary)' : 'var(--text)',
                background: isActive ? 'var(--surface-hover)' : 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.15s',
              })}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.to === '/' && alerts.length > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--danger)',
                  color: 'white',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {alerts.length}
                </span>
              )}
              {item.to === '/pedidos' && pendingCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'var(--warning)',
                  color: '#000',
                  borderRadius: 10,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {alerts.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600, marginBottom: 6 }}>
              ⚠ Stock bajo ({alerts.length})
            </div>
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>
                {a.name}: <b style={{ color: 'var(--danger)' }}>{a.current}</b> / {a.min_stock}
              </div>
            ))}
            {alerts.length > 3 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{alerts.length - 3} más</div>
            )}
          </div>
        )}
      </aside>

      <main style={{ flex: 1, padding: 24, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
