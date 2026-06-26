import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

interface BudgetItem {
  product_id: number
  code: string
  name: string
  quantity: number
  unit_price: number
}

interface Budget {
  id: number
  customer_name: string | null
  total: number
  status: string
  items: BudgetItem[]
  created_at: string
}

interface Product {
  id: number
  code: string
  name: string
  selling_price: number
}

export default function Presupuestos() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'new'>('list')
  const [selected, setSelected] = useState<Budget | null>(null)

  // New budget form
  const [customerName, setCustomerName] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [cart, setCart] = useState<BudgetItem[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const loadBudgets = useCallback(async () => {
    try {
      const data = await api.get<Budget[]>('/budgets?status=pending')
      setBudgets(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBudgets() }, [loadBudgets])

  useEffect(() => {
    api.get<Product[]>('/products').then(setProducts).catch(() => {})
  }, [])

  const addToCart = (code: string) => {
    const prod = products.find(p => p.code === code)
    if (!prod) { alert('Producto no encontrado'); return }
    const existing = cart.find(i => i.product_id === prod.id)
    if (existing) {
      setCart(cart.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { product_id: prod.id, code: prod.code, name: prod.name, quantity: 1, unit_price: prod.selling_price }])
    }
    setInputCode('')
  }

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const createBudget = async () => {
    if (cart.length === 0) return alert('Agrega productos al presupuesto')
    try {
      await api.post('/budgets', { customer_name: customerName || null, items: cart })
      alert('Presupuesto creado')
      setCart([])
      setCustomerName('')
      setTab('list')
      loadBudgets()
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
  }

  const approveBudget = async (id: number) => {
    if (!confirm('Aprobar y descontar del stock?')) return
    await api.post(`/budgets/${id}/approve`)
    setSelected(null)
    loadBudgets()
  }

  const rejectBudget = async (id: number) => {
    if (!confirm('Rechazar presupuesto?')) return
    await api.post(`/budgets/${id}/reject`)
    setSelected(null)
    loadBudgets()
  }

  const removeFromCart = (pid: number) => setCart(cart.filter(i => i.product_id !== pid))

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>← Volver</button>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Presupuesto #{selected.id}</h2>
              {selected.customer_name && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Cliente: {selected.customer_name}</p>}
              <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(selected.created_at).toLocaleString('es-AR')}</p>
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
                  <td style={td}><div style={{ fontWeight: 500 }}>{item.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div></td>
                  <td style={{ ...td, textAlign: 'right' }}>${item.unit_price.toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>${(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => approveBudget(selected.id)} style={{ flex: 1, padding: 14, background: 'var(--success)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Aprobar y vender</button>
          <button onClick={() => rejectBudget(selected.id)} style={{ flex: 1, padding: 14, background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Rechazar</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          Presupuestos
          {budgets.length > 0 && <span style={{ marginLeft: 8, background: 'var(--warning)', color: '#000', padding: '2px 10px', borderRadius: 20, fontSize: 14 }}>{budgets.length}</span>}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('list')} style={tabBtn(tab === 'list')}>Pendientes</button>
          <button onClick={() => setTab('new')} style={tabBtn(tab === 'new')}>Nuevo</button>
        </div>
      </div>

      {tab === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Cliente (opcional)</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nombre del cliente..." style={{ width: '100%', padding: '10px 14px' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input placeholder="Escanear o escribir codigo..." value={inputCode} onChange={e => setInputCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addToCart(inputCode) }} style={{ flex: 1, padding: '10px 14px' }} autoFocus />
              <button onClick={() => addToCart(inputCode)} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Agregar</button>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ ...thSty, textAlign: 'left' }}>Producto</th>
                    <th style={{ ...thSty, textAlign: 'right' }}>Precio</th>
                    <th style={{ ...thSty, textAlign: 'center' }}>Cant.</th>
                    <th style={{ ...thSty, textAlign: 'right' }}>Subtotal</th>
                    <th style={thSty}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.product_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdSty}><div style={{ fontWeight: 500 }}>{item.name}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div></td>
                      <td style={{ ...tdSty, textAlign: 'right' }}>${item.unit_price.toLocaleString()}</td>
                      <td style={{ ...tdSty, textAlign: 'center' }}>
                        <input type="number" min={1} value={item.quantity} onChange={e => setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: +e.target.value } : i))} style={{ width: 60, textAlign: 'center', padding: '4px 6px' }} />
                      </td>
                      <td style={{ ...tdSty, textAlign: 'right', fontWeight: 600 }}>${(item.quantity * item.unit_price).toLocaleString()}</td>
                      <td style={tdSty}><button onClick={() => removeFromCart(item.product_id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button></td>
                    </tr>
                  ))}
                  {cart.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Escanea productos para armar el presupuesto</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Resumen</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Productos</span><span>{cart.length}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
              <span>TOTAL</span><span style={{ color: 'var(--primary)' }}>${subtotal.toLocaleString()}</span>
            </div>
            <button onClick={createBudget} disabled={cart.length === 0} style={{ marginTop: 20, width: '100%', padding: 14, background: cart.length === 0 ? 'var(--border)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: cart.length === 0 ? 'not-allowed' : 'pointer' }}>Crear presupuesto</button>
          </div>
        </div>
      )}

      {tab === 'list' && budgets.length === 0 && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 60, textAlign: 'center', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>No hay presupuestos pendientes</p>
        </div>
      )}

      {tab === 'list' && budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {budgets.map(b => (
            <div key={b.id} onClick={() => setSelected(b)} style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>#{b.id} {b.customer_name || 'Sin cliente'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.items.length} items</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>${b.total.toLocaleString()}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                {b.items.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
                {b.items.length > 3 && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{b.items.length - 3} mas</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '10px 24px', background: active ? 'var(--primary)' : 'var(--surface)',
  color: active ? 'white' : 'var(--text)', border: active ? 'none' : '1px solid var(--border)',
  borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
})
const thSty: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const tdSty: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '10px 0', fontSize: 14 }
