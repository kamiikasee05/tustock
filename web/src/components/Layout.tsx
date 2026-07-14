import { ReactNode, useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { api, LowStockItem } from '../api/client'
import TrialBanner from './TrialBanner'
import SubscriptionBanner from './SubscriptionBanner'
import EulaModal from './EulaModal'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
  badgeColor?: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: '📊' },
      { to: '/sales', label: 'Ventas (POS)', icon: '💰' },
      { to: '/pedidos', label: 'Pedidos', icon: '📝' },
      { to: '/presupuestos', label: 'Presupuestos', icon: '📋' },
    ],
  },
  {
    title: 'Inventario',
    items: [
      { to: '/products', label: 'Productos', icon: '📦' },
      { to: '/audits', label: 'Auditorías', icon: '🔍' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { to: '/customers', label: 'Clientes', icon: '👥' },
      { to: '/vendors', label: 'Vendedores', icon: '👤' },
      { to: '/reports', label: 'Informes', icon: '📊' },
    ],
  },
  {
    title: 'Utilidades',
    items: [
      { to: '/scanner', label: 'Scanner', icon: '📱' },
    ],
  },
]

const bottomItems: NavItem[] = [
  { to: '/upgrade', label: 'Planes', icon: '⭐' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
]

function SidebarContent({
  alerts,
  pendingCount,
  serverStatus,
  onLinkClick,
}: {
  alerts: LowStockItem[]
  pendingCount: number
  serverStatus: 'checking' | 'online' | 'offline'
  onLinkClick?: () => void
}) {
  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 16px',
    color: isActive ? 'var(--primary)' : 'var(--text)',
    background: isActive ? 'var(--surface-hover)' : 'transparent',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'background var(--transition)',
    borderRadius: 'var(--radius-sm)',
    margin: '0 8px',
  })

  const groupLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    padding: '12px 16px 4px',
    opacity: 0.7,
  }

  const separatorStyle: React.CSSProperties = {
    height: 1,
    background: 'var(--border)',
    margin: '6px 16px',
    opacity: 0.5,
  }

  const navWithBadges: NavGroup[] = navGroups.map(g => ({
    ...g,
    items: g.items.map(item => {
      if (item.to === '/') return { ...item, badge: alerts.length, badgeColor: 'var(--danger)' }
      if (item.to === '/pedidos') return { ...item, badge: pendingCount, badgeColor: 'var(--warning)' }
      return item
    }),
  }))

  const allGroups = [
    ...navWithBadges,
    { title: '_bottom', items: bottomItems },
  ]

  return (
    <>
      <div style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>TUSTOCK</h1>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {serverStatus === 'checking' && 'Conectando...'}
          {serverStatus === 'online' && '● Servidor conectado'}
          {serverStatus === 'offline' && '● Sin conexión - Inicie el servidor'}
        </span>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {allGroups.map((group, gi) => {
          const isBottom = group.title === '_bottom'
          return (
            <div key={gi}>
              {isBottom && <div style={separatorStyle} />}
              {!isBottom && <div style={groupLabelStyle}>{group.title}</div>}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onLinkClick}
                  style={({ isActive }) => linkStyle(isActive)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.badge != null && item.badge > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: item.badgeColor || 'var(--primary)',
                      color: item.to === '/pedidos' ? '#000' : 'white',
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )
        })}
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
    </>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [alerts, setAlerts] = useState<LowStockItem[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

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

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <EulaModal />
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' }}>
          <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 52,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 12,
            zIndex: 1100,
          }}>
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menú"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontSize: 22,
                padding: 4,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>TUSTOCK</span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: serverStatus === 'online' ? 'var(--success)' : serverStatus === 'offline' ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {serverStatus === 'online' ? '● Online' : serverStatus === 'offline' ? '● Offline' : '...'}
            </span>
          </header>

          {mobileOpen && (
            <div
              onClick={closeMobile}
              style={{
                position: 'fixed',
                inset: 0,
                top: 52,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1050,
              }}
            />
          )}

          <aside style={{
            position: 'fixed',
            top: 52,
            left: 0,
            bottom: 0,
            width: 260,
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            padding: '12px 0',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1100,
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
          }}>
            <SidebarContent
              alerts={alerts}
              pendingCount={pendingCount}
              serverStatus={serverStatus}
              onLinkClick={closeMobile}
            />
          </aside>

          <div style={{ flex: 1, marginTop: 52, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <TrialBanner />
            <SubscriptionBanner />
            <main style={{ flex: 1, padding: 16 }}>
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', width: '100%' }}>
          <aside style={{
            width: 220,
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            flexShrink: 0,
          }}>
            <SidebarContent
              alerts={alerts}
              pendingCount={pendingCount}
              serverStatus={serverStatus}
            />
          </aside>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <TrialBanner />
            <SubscriptionBanner />
            <main style={{ flex: 1, padding: 24 }}>
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  )
}
