import { useState, useEffect } from 'react'
import { api, CustomerBrief } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface OrderItem {
  product_id: number
  code: string
  name: string
  quantity: number
  unit_price: number
}

interface PendingOrder {
  id: number
  vendor_name: string
  vendor_dni: string
  total: number
  items: OrderItem[]
  created_at: string
}

export default function Pedidos() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [customers, setCustomers] = useState<CustomerBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PendingOrder | null>(null)
  const [approvePM, setApprovePM] = useState('efectivo')
  const [approveCID, setApproveCID] = useState<number | ''>('')

  const openDetail = (order: PendingOrder) => {
    setSelected(order)
    setApprovePM('efectivo')
    setApproveCID('')
  }

  const loadOrders = async () => {
    try {
      const data = await api.get<PendingOrder[]>('/pending-orders')
      setOrders(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    api.get<CustomerBrief[]>('/customers').then(setCustomers).catch(() => { })
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const approveOrder = async (id: number) => {
    if (!confirm('¿Aprobar y descontar del stock?')) return
    const body: any = { payment_method: approvePM }
    if (approveCID !== '') body.customer_id = approveCID
    await api.post(`/pending-orders/${id}/approve`, body)
    toast('Pedido aprobado', 'success')
    setSelected(null)
    loadOrders()
  }

  const rejectOrder = async (id: number) => {
    if (!confirm('¿Rechazar este pedido?')) return
    await api.post(`/pending-orders/${id}/reject`)
    setSelected(null)
    loadOrders()
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>

  if (selected) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-lg)',
          cursor: 'pointer', background: 'none', border: 'none',
        }}>
          <MaterialIcon name="arrow_back" size={20} />
          Volver a la lista
        </button>

        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
          border: '1px solid rgba(66,71,84,0.5)', marginBottom: 'var(--space-lg)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>Pedido #{selected.id}</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, marginTop: 4 }}>
                {selected.vendor_name} (DNI {selected.vendor_dni}) &middot; {formatTime(selected.created_at)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Total</div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, lineHeight: '36px', fontWeight: 700, color: 'var(--primary-container)' }}>
                ${selected.total.toLocaleString()}
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
                <th style={th}>Producto</th>
                <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                <th style={{ ...th, textAlign: 'center' }}>Cant.</th>
                <th style={{ ...th, textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                  <td style={td}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{item.code}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)' }}>${item.unit_price.toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'center', fontFamily: 'var(--font-data)', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600 }}>${(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            marginTop: 'var(--space-lg)',
            background: 'var(--surface-container-low)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-md)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 10 }}>
              Método de pago
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['efectivo', 'tarjeta', 'transferencia', 'fiado'].map(m => (
                <button key={m}
                  onClick={() => { setApprovePM(m); if (m !== 'fiado') setApproveCID('') }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    border: approvePM === m ? '2px solid var(--primary)' : '1px solid rgba(66,71,84,0.3)',
                    background: approvePM === m ? 'rgba(77,142,255,0.1)' : 'transparent',
                    color: approvePM === m ? 'var(--primary)' : 'var(--on-surface-variant)',
                    fontSize: 13, fontWeight: 600, transition: 'all var(--transition)',
                  }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <MaterialIcon name={m === 'efectivo' ? 'payments' : m === 'tarjeta' ? 'credit_card' : m === 'transferencia' ? 'account_balance' : 'receipt_long'} size={20} />
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </div>
                </button>
              ))}
            </div>

            {approvePM === 'fiado' && (
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Cliente</label>
                <select
                  value={approveCID}
                  onChange={e => setApproveCID(e.target.value ? +e.target.value : '')}
                  style={{ width: '100%', padding: '10px 12px' }}
                >
                  <option value="">Seleccioná un cliente</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.balance > 0 ? `(debe $${c.balance})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 'var(--space-lg)' }}>
            <button onClick={() => approveOrder(selected.id)} style={{
              flex: 1, padding: 14, background: 'var(--success)', color: 'var(--bg)',
              border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <MaterialIcon name="check_circle" size={24} />
              Aprobar y descontar stock
            </button>
            <button onClick={() => rejectOrder(selected.id)} style={{
              flex: 1, padding: 14, background: 'var(--error-container)', color: 'var(--error)',
              border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <MaterialIcon name="cancel" size={24} />
              Rechazar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)',
      }}>
        <div>
          <nav style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
            color: 'var(--outline)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)',
          }}>
            <span>VENTAS</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>PEDIDOS</span>
          </nav>
          <h2 style={{
            fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)',
          }}>
            Pedidos pendientes
            {orders.length > 0 && (
              <span style={{ marginLeft: 12, fontFamily: 'var(--font-data)', fontSize: 18, color: 'var(--tertiary)',
                padding: '2px 10px', borderRadius: 20, background: 'rgba(255,183,134,0.1)' }}>
                {orders.length}
              </span>
            )}
          </h2>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
          padding: 60, textAlign: 'center', border: '1px solid rgba(66,71,84,0.5)',
        }}>
          <MaterialIcon name="inbox" size={64} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>No hay pedidos pendientes</p>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            Los pedidos que envían los empleados desde la app aparecen acá
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => openDetail(order)}
              style={{
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                border: '1px solid rgba(66,71,84,0.5)',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--on-surface)' }}>Pedido #{order.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                    {order.vendor_name} &middot; {order.items.length} items
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 20, fontWeight: 700, color: 'var(--primary-container)' }}>
                    ${order.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                    {formatTime(order.created_at)}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(66,71,84,0.2)', paddingTop: 10 }}>
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                    <span style={{ color: 'var(--on-surface)' }}>{item.quantity}x {item.name}</span>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: 12, color: 'var(--on-surface-variant)' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>+{order.items.length - 4} más</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }
const td: React.CSSProperties = { padding: '10px 0', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
