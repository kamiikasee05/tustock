import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface BudgetItem { product_id: number; code: string; name: string; quantity: number; unit_price: number }
interface Budget { id: number; customer_name: string | null; total: number; status: string; items: BudgetItem[]; created_at: string }
interface Product { id: number; code: string; name: string; selling_price: number }

export default function Presupuestos() {
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'list' | 'new'>('list')
  const [selected, setSelected] = useState<Budget | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [cart, setCart] = useState<BudgetItem[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const loadBudgets = useCallback(async () => {
    try { const data = await api.get<Budget[]>('/budgets?status=pending'); setBudgets(data) } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadBudgets() }, [loadBudgets])
  useEffect(() => { api.get<Product[]>('/products').then(setProducts).catch(() => {}) }, [])

  const addToCart = (code: string) => {
    const prod = products.find(p => p.code === code || p.barcode === code)
    if (!prod) { toast('Producto no encontrado', 'error'); return }
    const existing = cart.find(i => i.product_id === prod.id)
    if (existing) { setCart(cart.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i)) }
    else { setCart([...cart, { product_id: prod.id, code: prod.code, name: prod.name, quantity: 1, unit_price: prod.selling_price }]) }
    setInputCode('')
  }

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const createBudget = async () => {
    if (cart.length === 0) return toast('Agrega productos al presupuesto', 'error')
    try {
      await api.post('/budgets', { customer_name: customerName || null, items: cart })
      toast('Presupuesto creado correctamente', 'success')
      setCart([]); setCustomerName(''); setTab('list'); loadBudgets()
    } catch (e: any) { toast('Error: ' + e.message, 'error') }
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>

  if (selected) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-lg)', cursor: 'pointer', background: 'none', border: 'none' }}>
          <MaterialIcon name="arrow_back" size={20} />
          Volver
        </button>
        <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>Presupuesto #{selected.id}</h2>
              {selected.customer_name && <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, marginTop: 2 }}>Cliente: {selected.customer_name}</p>}
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 12 }}>{new Date(selected.created_at).toLocaleString('es-AR')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Total</div>
              <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>${selected.total.toLocaleString()}</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
              <th style={th}>Producto</th><th style={{ ...th, textAlign: 'right' }}>Precio</th>
              <th style={{ ...th, textAlign: 'center' }}>Cant.</th><th style={{ ...th, textAlign: 'right' }}>Subtotal</th>
            </tr></thead>
            <tbody>{selected.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                <td style={td}><span style={{ fontWeight: 600 }}>{item.name}</span><br /><span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{item.code}</span></td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)' }}>${item.unit_price.toLocaleString()}</td>
                <td style={{ ...td, textAlign: 'center', fontFamily: 'var(--font-data)' }}>{item.quantity}</td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600 }}>${(item.quantity * item.unit_price).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => approveBudget(selected.id)} style={{ flex: 1, padding: 14, background: 'var(--success)', color: 'var(--bg)', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16 }}>
            <MaterialIcon name="check_circle" size={24} />
            Aprobar y vender
          </button>
          <button onClick={() => rejectBudget(selected.id)} style={{ flex: 1, padding: 14, background: 'var(--error-container)', color: 'var(--error)', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16 }}>
            <MaterialIcon name="cancel" size={24} />
            Rechazar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>
            <span>VENTAS</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>PRESUPUESTOS</span>
          </nav>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            Presupuestos
            {budgets.length > 0 && <span style={{ marginLeft: 12, fontFamily: 'var(--font-data)', fontSize: 18, color: 'var(--tertiary)', padding: '2px 10px', borderRadius: 20, background: 'rgba(255,183,134,0.1)' }}>{budgets.length}</span>}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('list')} style={{
            padding: 'var(--space-sm) var(--space-lg)',
            background: tab === 'list' ? 'var(--primary-container)' : 'transparent',
            color: tab === 'list' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
            borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 14,
            border: tab === 'list' ? 'none' : '1px solid rgba(66,71,84,0.3)',
          }}>Pendientes</button>
          <button onClick={() => setTab('new')} style={{
            padding: 'var(--space-sm) var(--space-lg)',
            background: tab === 'new' ? 'var(--primary-container)' : 'transparent',
            color: tab === 'new' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
            borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 14,
            border: tab === 'new' ? 'none' : '1px solid rgba(66,71,84,0.3)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <MaterialIcon name="add" size={18} /> Nuevo
          </button>
        </div>
      </div>

      {tab === 'new' && (
        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Cliente (opcional)</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nombre del cliente..." style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input placeholder="Escaneá o escribí codigo..." value={inputCode} onChange={e => setInputCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addToCart(inputCode) }} style={{ flex: 1, padding: '10px 14px' }} autoFocus />
              <button onClick={() => addToCart(inputCode)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                background: 'var(--primary-container)', color: 'var(--on-primary-container)',
                paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
                paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
                borderRadius: 'var(--radius)', fontWeight: 700,
              }}>
                <MaterialIcon name="add" size={18} />
                Agregar
              </button>
            </div>
            <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
                  <th style={thsty}>Producto</th><th style={{ ...thsty, textAlign: 'right' }}>Precio</th>
                  <th style={{ ...thsty, textAlign: 'center' }}>Cant.</th><th style={{ ...thsty, textAlign: 'right' }}>Subtotal</th>
                  <th style={thsty}></th>
                </tr></thead>
                <tbody>{cart.map(item => (
                  <tr key={item.product_id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                    <td style={tdsty}><span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{item.name}</span><br /><span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{item.code}</span></td>
                    <td style={{ ...tdsty, textAlign: 'right', fontFamily: 'var(--font-data)' }}>${item.unit_price.toLocaleString()}</td>
                    <td style={{ ...tdsty, textAlign: 'center' }}>
                      <input type="number" step="any" min="0.01" value={item.quantity} onChange={e => setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: +e.target.value } : i))} style={{ width: 60, textAlign: 'center', padding: '4px 6px' }} />
                    </td>
                    <td style={{ ...tdsty, textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-data)' }}>${(item.quantity * item.unit_price).toLocaleString()}</td>
                    <td style={tdsty}><button onClick={() => removeFromCart(item.product_id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}><MaterialIcon name="close" size={20} /></button></td>
                  </tr>
                ))}
                {cart.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  <MaterialIcon name="receipt_long" size={48} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  Escanea productos para armar el presupuesto</td></tr>}
              </tbody></table>
            </div>
          </div>
          <div style={{ width: window.innerWidth < 768 ? '100%' : 360 }}>
            <div style={{ background: 'var(--surface-container-high)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.3)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--on-surface)' }}>Resumen</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Productos</span><span>{cart.length}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid rgba(66,71,84,0.3)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, fontWeight: 700 }}>
                <span>TOTAL</span><span style={{ color: 'var(--primary-container)', fontFamily: 'var(--font-data)' }}>${subtotal.toLocaleString()}</span>
              </div>
              <button onClick={createBudget} disabled={cart.length === 0} style={{
                marginTop: 20, width: '100%', padding: 14,
                background: cart.length === 0 ? 'var(--surface-container-highest)' : 'var(--primary-container)',
                color: cart.length === 0 ? 'var(--on-surface-variant)' : 'var(--on-primary-container)',
                border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <MaterialIcon name="note_add" size={20} />
                Crear presupuesto
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'list' && budgets.length === 0 && (
        <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 60, textAlign: 'center', border: '1px solid rgba(66,71,84,0.5)' }}>
          <MaterialIcon name="library_books" size={64} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 16, color: 'var(--on-surface-variant)' }}>No hay presupuestos pendientes</p>
        </div>
      )}

      {tab === 'list' && budgets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {budgets.map(b => (
            <div key={b.id} onClick={() => setSelected(b)} style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid rgba(66,71,84,0.5)', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>#{b.id} {b.customer_name || 'Sin cliente'}</div>
                  <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>{b.items.length} items</div>
                </div>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 20, fontWeight: 700, color: 'var(--primary-container)' }}>${b.total.toLocaleString()}</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(66,71,84,0.2)', paddingTop: 10 }}>
                {b.items.slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                    <span style={{ color: 'var(--on-surface)' }}>{item.quantity}x {item.name}</span>
                    <span style={{ color: 'var(--on-surface-variant)', fontFamily: 'var(--font-data)' }}>${(item.quantity * item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
                {b.items.length > 3 && <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>+{b.items.length - 3} items</div>}
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
  color: active ? 'white' : 'var(--on-surface)', border: active ? 'none' : '1px solid rgba(66,71,84,0.5)',
  borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
})
const thsty: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }
const tdsty: React.CSSProperties = { padding: '12px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }
const td: React.CSSProperties = { padding: '10px 0', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
