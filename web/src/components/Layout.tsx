import { ReactNode, useState, useEffect, useCallback } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { api, LowStockItem } from '../api/client'
import TrialBanner from './TrialBanner'
import SubscriptionBanner from './SubscriptionBanner'
import EulaModal from './EulaModal'
import MaterialIcon from './ui/MaterialIcon'

interface NavItem {
  to: string
  label: string
  icon: string
  badge?: number
  badgeColor?: string
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/sales', label: 'Ventas (POS)', icon: 'payments' },
  { to: '/pedidos', label: 'Pedidos', icon: 'shopping_cart' },
  { to: '/presupuestos', label: 'Presupuestos', icon: 'description' },
  { to: '/products', label: 'Productos', icon: 'inventory_2' },
  { to: '/audits', label: 'Auditorias', icon: 'history_edu' },
  { to: '/customers', label: 'Clientes', icon: 'group' },
  { to: '/vendors', label: 'Vendedores', icon: 'badge' },
  { to: '/reports', label: 'Informes', icon: 'analytics' },
]

const bottomNavItems: NavItem[] = [
  { to: '/scanner', label: 'Scanner', icon: 'barcode_scanner' },
  { to: '/upgrade', label: 'Planes', icon: 'workspace_premium' },
  { to: '/settings', label: 'Ajustes', icon: 'settings' },
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
    color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
    background: isActive ? 'var(--surface-container-highest)' : 'transparent',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: isActive ? 700 : 500,
    transition: 'background var(--transition)',
    borderRadius: 'var(--radius)',
    borderRight: isActive ? '2px solid var(--primary)' : '2px solid transparent',
  })

  const allItems = navItems.map(item => {
    if (item.to === '/') return { ...item, badge: alerts.length, badgeColor: 'var(--error)' }
    if (item.to === '/pedidos') return { ...item, badge: pendingCount, badgeColor: 'var(--tertiary)' }
    return item
  })

  return (
    <>
      <div style={{
        padding: '0 16px 16px',
        borderBottom: '1px solid var(--border)',
        marginBottom: 8,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-body)',
          fontSize: 20,
          fontWeight: 600,
          color: 'var(--primary)',
          letterSpacing: '-0.01em',
        }}>TUSTOCK</h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--on-surface-variant)',
          marginTop: 2,
        }}>
          {serverStatus === 'checking' && 'Conectando...'}
          {serverStatus === 'online' && 'Gestion Minorista'}
          {serverStatus === 'offline' && 'Sin conexion'}
        </p>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {allItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onLinkClick}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <MaterialIcon
              name={item.icon}
              filled={false}
              size={20}
            />
            {item.label}
            {item.badge != null && item.badge > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: item.badgeColor || 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                borderRadius: 'var(--radius-full)',
                padding: '1px 7px',
                fontSize: 11,
                fontWeight: 700,
              }}>
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid rgba(66, 71, 84, 0.3)', marginTop: 'var(--space-sm)', paddingTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {bottomNavItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onLinkClick}
            style={({ isActive }) => linkStyle(isActive)}
          >
            <MaterialIcon
              name={item.icon}
              filled={false}
              size={20}
            />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div style={{
        marginTop: 'auto',
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          objectFit: 'cover',
          border: '1px solid var(--outline-variant)',
          background: 'var(--surface-container-highest)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialIcon name="person" size={18} color="var(--on-surface-variant)" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--on-surface)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>Usuario</p>
          <p style={{
            fontSize: 10,
            color: 'var(--on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Administrador</p>
        </div>
      </div>
    </>
  )
}

const mobileBottomItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/products', label: 'Productos', icon: 'inventory_2' },
  { to: '/sales', label: 'Ventas', icon: 'payments' },
  { to: '/customers', label: 'Clientes', icon: 'group' },
  { to: '/settings', label: 'Ajustes', icon: 'settings' },
]

function BottomNav({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      height: 64,
      paddingLeft: 'var(--margin-mobile)',
      paddingRight: 'var(--margin-mobile)',
      background: 'var(--surface-container)',
      borderTop: '1px solid rgba(66, 71, 84, 0.5)',
      position: 'fixed',
      bottom: 0,
      zIndex: 50,
    }}>
      {mobileBottomItems.slice(0, 2).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onLinkClick}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
            textDecoration: 'none',
          })}
        >
          <MaterialIcon
            name={item.icon}
            filled={false}
            size={24}
          />
          <span style={{
            fontSize: 10,
            fontWeight: 'inherit',
            color: 'inherit',
          }}>{item.label}</span>
        </NavLink>
      ))}

      <div style={{ position: 'relative', top: -16 }}>
        <NavLink to="/sales" onClick={onLinkClick}
          style={{
            width: 56,
            height: 56,
            background: 'var(--primary-container)',
            color: 'var(--on-primary-container)',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 16px rgba(77, 142, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease',
            textDecoration: 'none',
          }}
        >
          <MaterialIcon name="add" size={32} filled />
        </NavLink>
      </div>

      {mobileBottomItems.slice(2, 4).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onLinkClick}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
            textDecoration: 'none',
          })}
        >
          <MaterialIcon
            name={item.icon}
            filled={false}
            size={24}
          />
          <span style={{
            fontSize: 10,
            fontWeight: 'inherit',
            color: 'inherit',
          }}>{item.label}</span>
        </NavLink>
      ))}

      {mobileBottomItems.slice(4).map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onLinkClick}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? 'var(--primary)' : 'var(--on-surface-variant)',
            textDecoration: 'none',
          })}
        >
          <MaterialIcon
            name={item.icon}
            filled={false}
            size={24}
          />
          <span style={{
            fontSize: 10,
            fontWeight: 'inherit',
            color: 'inherit',
          }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<LowStockItem[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
            height: 64,
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 'var(--margin-mobile)',
            paddingRight: 'var(--margin-mobile)',
            background: 'rgba(16, 19, 26, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
          }}>
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--on-surface)',
                fontSize: 22,
                padding: 4,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              <MaterialIcon name={mobileOpen ? 'close' : 'menu'} size={24} />
            </button>

            <h1 style={{
              fontFamily: 'var(--font-body)',
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--primary)',
            }}>TUSTOCK</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <button style={{
                padding: 'var(--space-sm)',
                color: 'var(--on-surface-variant)',
                borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition)',
              }}>
                <MaterialIcon name="notifications" size={20} />
              </button>
            </div>
          </header>

          {mobileOpen && (
            <div
              onClick={closeMobile}
              style={{
                position: 'fixed',
                inset: 0,
                top: 64,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 1050,
              }}
            />
          )}

          <aside style={{
            position: 'fixed',
            top: 64,
            left: 0,
            bottom: 0,
            width: 240,
            background: 'var(--surface-container)',
            borderRight: '1px solid rgba(66, 71, 84, 0.5)',
            padding: '16px 0',
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

          <div style={{
            flex: 1,
            marginTop: 64,
            marginBottom: 64,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
          }}>
            <TrialBanner />
            <SubscriptionBanner />
            <main style={{
              flex: 1,
              padding: 'var(--margin-mobile)',
              animation: 'slideUp 0.3s ease forwards',
            }}>
              {children}
            </main>
          </div>

          <BottomNav onLinkClick={closeMobile} />
        </div>
      ) : (
        <div style={{ display: 'flex', width: '100%' }}>
          <aside style={{
            height: '100vh',
            width: 220,
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-container)',
            borderRight: '1px solid rgba(66, 71, 84, 0.5)',
            padding: '16px 0',
            flexShrink: 0,
          }}>
            <SidebarContent
              alerts={alerts}
              pendingCount={pendingCount}
              serverStatus={serverStatus}
            />
          </aside>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', minHeight: '100vh' }}>
            <header style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: 64,
              paddingLeft: 'var(--margin-desktop)',
              paddingRight: 'var(--margin-desktop)',
              position: 'sticky',
              top: 0,
              zIndex: 40,
              background: 'rgba(16, 19, 26, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(66, 71, 84, 0.5)',
            }}>
              <div style={{
                display: 'flex',
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-full)',
                paddingLeft: 'var(--space-md)',
                paddingRight: 'var(--space-md)',
                paddingTop: 'var(--space-xs)',
                paddingBottom: 'var(--space-xs)',
                border: '1px solid var(--outline-variant)',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                minWidth: 320,
              }}>
                <MaterialIcon name="search" size={20} color="var(--outline)" />
                <input
                  placeholder="Busca productos, ventas o clientes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--on-surface)',
                    fontSize: 14,
                    fontFamily: 'var(--font-body)',
                    width: '100%',
                    padding: 0,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <button style={{
                  padding: 'var(--space-sm)',
                  color: 'var(--on-surface-variant)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all var(--transition)',
                }}>
                  <MaterialIcon name="notifications" size={20} />
                </button>
                <button
                  onClick={() => navigate('/sales')}
                  style={{
                    background: 'var(--primary-container)',
                    color: 'var(--on-primary-container)',
                    paddingLeft: 'var(--space-lg)',
                    paddingRight: 'var(--space-lg)',
                    paddingTop: 'var(--space-sm)',
                    paddingBottom: 'var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                    fontSize: 14,
                    transition: 'all var(--transition)',
                    boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                  }}
                >
                  <MaterialIcon name="add_shopping_cart" size={18} />
                  Nueva Venta
                </button>
              </div>
            </header>

            <TrialBanner />
            <SubscriptionBanner />
            <main style={{
              flex: 1,
              padding: 'var(--margin-desktop)',
              animation: 'slideUp 0.3s ease forwards',
            }}>
              {children}
            </main>
          </div>
        </div>
      )}
    </>
  )
}