import { useState, useEffect } from 'react'
import { api, Sale, Product, StockItem } from '../api/client'
import { useToast } from '../components/Toast'

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
  const [cart, setCart] = useState<CartItem[]>([])
  const [inputCode, setInputCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'new' | 'history'>('new')

  const loadSales = () => {
    api.get<Sale[]>('/sales?limit=50').then(setSales)
  }

  useEffect(() => {
    Promise.all([
      api.get<Product[]>('/products'),
      api.get<StockItem[]>('/stock'),
      api.get<Sale[]>('/sales?limit=50'),
    ])
      .then(([prods, stk, s]) => { setProducts(prods); setStock(stk); setSales(s) })
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (code: string) => {
    const prod = products.find(p => p.code === code)
    if (!prod) {
      toast(`Código no encontrado: ${code}`, 'error')
      return
    }
    const existing = cart.find(i => i.product_id === prod.id)
    if (existing) {
      setCart(cart.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { product_id: prod.id, code: prod.code, name: prod.name, quantity: 1, unit_price: prod.selling_price }])
    }
    setInputCode('')
  }

  const subtotal = cart.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const total = subtotal - discount

  const completeSale = async () => {
    if (cart.length === 0) return toast('Agregá productos al carrito', 'error')
    try {
      const result = await api.post<any>('/sales', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
        discount,
        payment_method: paymentMethod,
        cashier: 'Mostrador',
      })
      toast(`Venta #${result.id} registrada - $${result.total.toLocaleString()}`, 'success')
      setCart([])
      setDiscount(0)
      loadSales()
      api.get<StockItem[]>('/stock').then(setStock)
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    }
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(i => i.product_id !== productId))
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Ventas</h2>

      <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
        <button onClick={() => setTab('new')} style={tabBtn(tab === 'new')}>Nueva venta</button>
        <button onClick={() => setTab('history')} style={tabBtn(tab === 'history')}>Historial</button>
      </div>

      {tab === 'new' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                placeholder="Escanear o escribir código de producto..."
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addToCart(inputCode) }}
                style={{ flex: 1, padding: '12px 16px', fontSize: 16 }}
                autoFocus
              />
              <button onClick={() => addToCart(inputCode)} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
                Agregar
              </button>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ ...thSty, textAlign: 'left' }}>Producto</th>
                    <th style={{ ...thSty, textAlign: 'right' }}>Precio</th>
                    <th style={{ ...thSty, textAlign: 'center' }}>Cant.</th>
                    <th style={{ ...thSty, textAlign: 'right' }}>Subtotal</th>
                    <th style={{ ...thSty }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.product_id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={tdSty}>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div>
                      </td>
                      <td style={{ ...tdSty, textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ ...tdSty, textAlign: 'center' }}>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => setCart(cart.map(i => i.product_id === item.product_id ? { ...i, quantity: +e.target.value } : i))}
                          style={{ width: 60, textAlign: 'center', padding: '4px 6px' }}
                        />
                      </td>
                      <td style={{ ...tdSty, textAlign: 'right', fontWeight: 600 }}>${(item.quantity * item.unit_price).toFixed(2)}</td>
                      <td style={tdSty}>
                        <button onClick={() => removeFromCart(item.product_id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', fontSize: 18 }}>×</button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Carrito vacío - Escaneá o escribí un código</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Resumen</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>Descuento</span>
                <input type="number" value={discount} onChange={e => setDiscount(+e.target.value)} style={{ width: 100, textAlign: 'right', padding: '4px 8px' }} />
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700 }}>
                <span>TOTAL</span>
                <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Método de pago</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px 12px' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <button
                onClick={completeSale}
                disabled={cart.length === 0}
                style={{
                  marginTop: 20, width: '100%', padding: '14px',
                  background: cart.length === 0 ? 'var(--border)' : 'var(--success)',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700,
                  cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Cobrar ${total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={thSty}>#</th>
                <th style={thSty}>Fecha</th>
                <th style={{ ...thSty, textAlign: 'right' }}>Total</th>
                <th style={{ ...thSty, textAlign: 'center' }}>Pago</th>
                <th style={{ ...thSty, textAlign: 'center' }}>Ítems</th>
                <th style={thSty}>Cajero</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdSty}>#{s.id}</td>
                  <td style={tdSty}>{s.sale_date}{s.created_at ? ' ' + s.created_at.split('T')[1]?.slice(0, 5) : ''}</td>
                  <td style={{ ...tdSty, textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>${s.total.toLocaleString()}</td>
                  <td style={{ ...tdSty, textAlign: 'center' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, background: 'var(--bg)' }}>{s.payment_method}</span>
                  </td>
                  <td style={{ ...tdSty, textAlign: 'center' }}>{s.items_count ?? '-'}</td>
                  <td style={tdSty}>{s.cashier || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '10px 24px',
  background: active ? 'var(--primary)' : 'var(--surface)',
  color: active ? 'white' : 'var(--text)',
  border: active ? 'none' : '1px solid var(--border)',
  borderRadius: '8px 8px 0 0',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
})

const thSty: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const tdSty: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }
