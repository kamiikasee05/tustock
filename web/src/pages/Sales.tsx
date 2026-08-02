import { useState, useEffect } from 'react'
import { api, Sale, Product, StockItem, CustomerBrief } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface CartItem {
  product_id: number
  code: string
  name: string
  quantity: number
  unit_price: number
}

export default function Sales() {
  const { toast } = useToast()
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [customers, setCustomers] = useState<CustomerBrief[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [inputCode, setInputCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState<'new' | 'history'>('new')

  const loadSales = () => {
    api.get<Sale[]>('/sales?limit=50').then(setSales).catch(() => {})
  }

  const loadAllProducts = async (): Promise<Product[]> => {
    const all: Product[] = []
    let page = 1
    let totalPages = 1
    do {
      const data = await api.get<{ products: Product[]; total: number; total_pages: number }>(
        `/products?page=${page}&page_size=200`
      )
      all.push(...data.products)
      totalPages = data.total_pages
      page++
    } while (page <= totalPages)
    return all
  }

  useEffect(() => {
    Promise.all([
      loadAllProducts(),
      api.get<StockItem[]>('/stock'),
      api.get<Sale[]>('/sales?limit=50'),
      api.get<CustomerBrief[]>('/customers'),
    ])
      .then(([prods, stk, s, c]) => { setProducts(prods); setStock(stk); setSales(s); setCustomers(c) })
      .catch(() => toast('Error al cargar datos', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (code: string) => {
    const prod = products.find(p => p.code === code || p.barcode === code)
    if (!prod) {
      toast(`Código no encontrado: ${code}`, 'error')
      return
    }
    setCart(prev => {
      const existing = prev.find(i => i.product_id === prod.id)
      if (existing) {
        return prev.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product_id: prod.id, code: prod.code, name: prod.name, quantity: 1, unit_price: prod.selling_price }]
    })
    setInputCode('')
  }

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const total = subtotal - discount

  const completeSale = async () => {
    if (cart.length === 0) return toast('Agregá productos al carrito', 'error')
    if (paymentMethod === 'fiado' && selectedCustomer === '') return toast('Seleccioná un cliente para vender fiado', 'error')
    setSubmitting(true)
    try {
      const result = await api.post<any>('/sales', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        discount,
        payment_method: paymentMethod,
        customer_id: selectedCustomer !== '' ? selectedCustomer : null,
        cashier: 'Mostrador',
      })
      toast(`Venta #${result.id} registrada - $${result.total.toLocaleString()}`, 'success')
      setCart([])
      setDiscount(0)
      setSelectedCustomer('')
      loadSales()
      api.get<StockItem[]>('/stock').then(setStock)
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(i => i.product_id !== productId))
  }

  const payments = [
    { value: 'efectivo', label: 'Efectivo', icon: 'payments' },
    { value: 'debito', label: 'Débito', icon: 'credit_card' },
    { value: 'credito', label: 'Crédito', icon: 'credit_score' },
    { value: 'transferencia', label: 'Transferencia', icon: 'account_balance' },
    { value: 'fiado', label: 'Fiado', icon: 'receipt_long' },
    { value: 'otro', label: 'Otro', icon: 'more_horiz' },
  ]

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 'var(--space-xl)' }}>
        <button onClick={() => setTab('new')} style={{
          padding: '6px 12px',
          background: tab === 'new' ? 'var(--primary-container)' : 'var(--surface-container)',
          color: tab === 'new' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          fontWeight: 700, fontSize: 14, letterSpacing: '0.01em',
          border: tab === 'new' ? 'none' : '1px solid rgba(66,71,84,0.3)',
          borderBottom: tab === 'new' ? '2px solid var(--primary-container)' : '1px solid rgba(66,71,84,0.3)',
          transition: 'all var(--transition)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <MaterialIcon name="add_shopping_cart" size={16} />
            <span>Nueva venta</span>
          </div>
        </button>
        <button onClick={() => setTab('history')} style={{
          padding: '6px 12px',
          background: tab === 'history' ? 'var(--primary-container)' : 'var(--surface-container)',
          color: tab === 'history' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          fontWeight: 700, fontSize: 14, letterSpacing: '0.01em',
          border: tab === 'history' ? 'none' : '1px solid rgba(66,71,84,0.3)',
          borderBottom: tab === 'history' ? '2px solid var(--primary-container)' : '1px solid rgba(66,71,84,0.3)',
          transition: 'all var(--transition)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <MaterialIcon name="history" size={16} />
            <span>Historial</span>
          </div>
        </button>
      </div>

      {tab === 'new' && (
        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{
              background: 'var(--surface-container)',
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(66,71,84,0.3)',
            }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', color: 'var(--on-surface-variant)',
                marginBottom: 8,
              }}>
                Escaneá o ingresá el código
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MaterialIcon name="barcode_scanner" size={20} color="var(--primary)" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  }} />
                  <input
                    placeholder="Código de barras, SKU o nombre..."
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addToCart(inputCode) }}
                    style={{
                      width: '100%', background: 'var(--surface)',
                      border: '2px solid var(--outline-variant)',
                      borderRadius: 'var(--radius)',
                      paddingLeft: 44, paddingRight: 12,
                      paddingTop: 12, paddingBottom: 12,
                      fontFamily: 'var(--font-data)', fontSize: 14,
                      fontWeight: 500, color: 'var(--on-surface)',
                      outline: 'none',
                      transition: 'border-color var(--transition), box-shadow var(--transition)',
                    }}
                    autoFocus
                  />
                  <kbd style={{
                    position: 'absolute', right: 'var(--space-md)', top: '50%', transform: 'translateY(-50%)',
                    background: 'var(--surface-container-highest)',
                    paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                    paddingTop: 4, paddingBottom: 4,
                    borderRadius: 'var(--radius-sm)', fontSize: 12,
                    fontFamily: 'var(--font-data)', fontWeight: 500,
                    color: 'var(--outline)', border: '1px solid rgba(66,71,84,0.3)',
                  }}>Enter</kbd>
                </div>
              </div>
            </div>

            <div style={{
              flex: 1, background: 'var(--surface-container)',
              padding: 12,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(66,71,84,0.3)',
              display: 'flex', flexDirection: 'column', minHeight: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>
                  Carrito actual
                </h3>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--on-surface-variant)' }}>
                  {cart.length} items
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)' }}>
                      <th style={cartTh}>Producto</th>
                      <th style={{ ...cartTh, textAlign: 'center' }}>Cant.</th>
                      <th style={{ ...cartTh, textAlign: 'right' }}>Precio</th>
                      <th style={{ ...cartTh, textAlign: 'right' }}>Subtotal</th>
                      <th style={{ ...cartTh, width: 48 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid rgba(66,71,84,0.2)', transition: 'background var(--transition)' }}>
                        <td style={{ paddingTop: 6, paddingBottom: 6 }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>{item.name}</span>
                          <br />
                          <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--outline)' }}>{item.code}</span>
                        </td>
                        <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                            <button onClick={() => setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: Math.max(0.01, i.quantity - 1) } : i))} style={{
                              width: 26, height: 26, borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--outline-variant)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--on-surface)', transition: 'background var(--transition)',
                            }}><MaterialIcon name="remove" size={14} /></button>
                            <input type="number" step="any" min="0.01" value={item.quantity}
                              onChange={e => { const v = parseFloat(e.target.value); if (v > 0) setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: v } : i)) }}
                              style={{ width: 52, textAlign: 'center', padding: '2px 4px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: 12, fontFamily: 'var(--font-data)', fontWeight: 500, color: 'var(--on-surface)' }}
                            />
                            <button onClick={() => setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i))} style={{
                              width: 26, height: 26, borderRadius: 'var(--radius-full)',
                              border: '1px solid var(--outline-variant)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--on-surface)', transition: 'background var(--transition)',
                            }}><MaterialIcon name="add" size={14} /></button>
                          </div>
                        </td>
                        <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 500 }}>
                          ${item.unit_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: 'right', fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 500, color: 'var(--primary)' }}>
                          ${(item.quantity * item.unit_price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ paddingTop: 6, paddingBottom: 6, textAlign: 'right' }}>
                          <button onClick={() => removeFromCart(item.product_id)} style={{ color: 'rgba(255,180,171,0.4)', padding: 'var(--space-sm)', transition: 'color var(--transition)' }}>
                            <MaterialIcon name="delete" size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                        <MaterialIcon name="shopping_cart" size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                        Carrito vacío — escaneá o escribí un código
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{
            width: window.innerWidth < 768 ? '100%' : 320,
            background: 'var(--surface-container-high)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(66,71,84,0.3)',
            padding: 14,
            display: 'flex', flexDirection: 'column',
            height: 'fit-content',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>TOTAL</span>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--primary-container)' }}>
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--on-surface-variant)', flex: 1 }}>Descuento</span>
              <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-xs) var(--space-md)',
                border: '1px solid rgba(66,71,84,0.3)',
              }}>
                <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>$</span>
                <input type="number" step="0.01" value={discount} onChange={e => setDiscount(+e.target.value)}
                  style={{ width: 80, background: 'transparent', border: 'none', color: 'var(--on-surface)', fontSize: 14, fontFamily: 'var(--font-data)', textAlign: 'right', outline: 'none', padding: 0 }} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(66,71,84,0.3)', margin: '10px 0' }} />

            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-sm)' }}>
              Método de pago
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {payments.map(pm => (
                <button
                  key={pm.value}
                  onClick={() => { setPaymentMethod(pm.value); if (pm.value !== 'fiado') setSelectedCustomer('') }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 2,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-lg)',
                    border: paymentMethod === pm.value ? '2px solid var(--primary)' : '2px solid var(--outline-variant)',
                    background: paymentMethod === pm.value ? 'rgba(77,142,255,0.1)' : 'transparent',
                    color: paymentMethod === pm.value ? 'var(--primary)' : 'var(--on-surface-variant)',
                    transition: 'all var(--transition)',
                    cursor: 'pointer',
                  }}>
                    <MaterialIcon name={pm.icon} size={18} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{pm.label}</span>
                  </button>
                ))}
            </div>

            {paymentMethod === 'fiado' && (
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 4, display: 'block' }}>Cliente</label>
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value ? +e.target.value : '')} style={{
                  width: '100%', padding: '10px 12px',
                  background: 'var(--surface)', border: '1px solid rgba(66,71,84,0.3)',
                  borderRadius: 'var(--radius)', color: 'var(--on-surface)', fontSize: 14,
                }}>
                  <option value="">Seleccionar cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.balance > 0 ? ` (adeuda $${c.balance.toLocaleString()})` : ''}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 10 }}>
              <div style={{
                marginBottom: 8,
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>Items</span>
                <span style={{ fontFamily: 'var(--font-data)', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>{cart.length}</span>
              </div>
              <button
                onClick={completeSale}
                disabled={cart.length === 0 || submitting}
                style={{
                  width: '100%',
                  padding: 10,
                  background: cart.length === 0 || submitting ? 'var(--surface-container-highest)' : 'var(--primary-container)',
                  color: cart.length === 0 || submitting ? 'var(--on-surface-variant)' : 'var(--on-primary-container)',
                  borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: 14,
                  boxShadow: cart.length === 0 ? 'none' : '0 4px 16px rgba(77,142,255,0.3)',
                  transition: 'all var(--transition)',
                  cursor: cart.length === 0 || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Procesando...' : `Cobrar $${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)', background: 'var(--surface-container-high)' }}>
                <th style={th}>#</th>
                <th style={th}>Fecha</th>
                <th style={{ ...th, textAlign: 'right' }}>Total</th>
                <th style={{ ...th, textAlign: 'center' }}>Pago</th>
                <th style={{ ...th, textAlign: 'center' }}>Cliente</th>
                <th style={{ ...th, textAlign: 'center' }}>Items</th>
                <th style={th}>Cajero</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(66,71,84,0.2)', transition: 'background var(--transition)' }}>
                  <td style={td}>#{s.id}</td>
                  <td style={td}>{s.sale_date}{s.created_at ? ' ' + (s.created_at.split('T')[1] || s.created_at.split(' ')[1] || '').slice(0, 5) : ''}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--success)' }}>
                    ${s.total.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{
                      paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                      paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)',
                      borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                      background: s.payment_method === 'fiado' ? 'rgba(255,183,134,0.15)' : 'var(--surface-container-highest)',
                      color: s.payment_method === 'fiado' ? 'var(--tertiary)' : 'var(--on-surface-variant)',
                    }}>{s.payment_method}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'center', fontSize: 13 }}>{s.customer_name || '-'}</td>
                  <td style={{ ...td, textAlign: 'center', fontFamily: 'var(--font-data)', fontSize: 14 }}>{s.items_count ?? '-'}</td>
                  <td style={td}>{s.cashier || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const cartTh: React.CSSProperties = {
  paddingBottom: 8, fontSize: 11, fontWeight: 700,
  letterSpacing: '0.05em', textTransform: 'uppercase',
  color: 'var(--on-surface-variant)', textAlign: 'left',
}
const th: React.CSSProperties = {
  paddingLeft: 10, paddingRight: 10,
  paddingTop: 8, paddingBottom: 8,
  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: 'var(--outline)', textAlign: 'left',
}
const td: React.CSSProperties = {
  padding: '8px 10px', fontSize: 13,
  fontFamily: 'var(--font-body)', color: 'var(--on-surface)',
}
