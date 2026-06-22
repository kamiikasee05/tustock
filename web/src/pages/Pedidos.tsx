import { useState, useEffect } from 'react'
import { api } from '../api/client'

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
  const [orders, setOrders] = useState<PendingOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PendingOrder | null>(null)

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
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const approveOrder = async (id: number) => {
    if (!confirm('¿Aprobar y descontar del stock?')) return
    await api.post(`/pending-orders/${id}/approve`)
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
          ← Volver a la lista
        </button>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pedido #{selected.id}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                    {selected.vendor_name} (DNI {selected.vendor_dni}) · {formatTime(selected.created_at)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>${selected.total.toLocaleString()}</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={th}>Producto</th>
                    <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                    <th style={{ ...th, textAlign: 'center' }}>Cant.</th>
                    <th style={{ ...th, textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={td}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>${item.unit_price.toLocaleString()}</td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                        ${(item.quantity * item.unit_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => approveOrder(selected.id)} style={{
                flex: 1, padding: '14px', background: 'var(--success)', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}>
                Aprobar y descontar stock
              </button>
              <button onClick={() => rejectOrder(selected.id)} style={{
                flex: 1, padding: '14px', background: 'var(--danger)', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}>
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          Pedidos pendientes
          {orders.length > 0 && (
            <span style={{ marginLeft: 8, background: 'var(--warning)', color: '#000', padding: '2px 10px', borderRadius: 20, fontSize: 14 }}>
              {orders.length}
            </span>
          )}
        </h2>
      </div>

      {orders.length === 0 ? (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 60, textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No hay pedidos pendientes</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Los pedidos que envian los empleados desde la app aparecen aca
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => setSelected(order)}
              style={{
                background: 'var(--surface)',
                borderRadius: 12,
                padding: 20,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Pedido #{order.id}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {order.vendor_name} · {order.items.length} items
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
                    ${order.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatTime(order.created_at)}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {order.items.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                    <span style={{ color: 'var(--text)' }}>{item.quantity}x {item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{order.items.length - 4} más</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '10px 0', fontSize: 14 }
