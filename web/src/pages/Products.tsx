import { useState, useEffect } from 'react'
import { api, Product, StockItem } from '../api/client'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad'
  })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get<Product[]>(`/products?search=${search}`),
      api.get<StockItem[]>('/stock'),
    ])
      .then(([prods, stk]) => { setProducts(prods); setStock(stk) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const getStock = (id: number) => stock.find(s => s.id === id)?.quantity || 0

  const handleSubmit = async () => {
    if (editing) {
      await api.put(`/products/${editing.id}`, form)
    } else {
      await api.post('/products', form)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad' })
    load()
  }

  const handleEdit = (p: Product) => {
    setEditing(p)
    setForm({ code: p.code, name: p.name, description: p.description || '', cost_price: p.cost_price, selling_price: p.selling_price, min_stock: p.min_stock, unit: p.unit })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('¿Desactivar este producto?')) {
      await api.delete(`/products/${id}`)
      load()
    }
  }

  const handleStockAdjust = async (productId: number, qty: number, type: string) => {
    await api.post('/stock/adjust', { product_id: productId, quantity: Math.abs(qty), movement_type: type, notes: `Ajuste manual desde panel` })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Productos</h2>
        <button
          onClick={() => { setEditing(null); setForm({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad' }); setShowForm(!showForm) }}
          style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
        >
          + Nuevo producto
        </button>
      </div>

      <input
        placeholder="Buscar por nombre o código..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 16, padding: '10px 14px' }}
      />

      {showForm && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Código</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={{ width: '100%' }} disabled={!!editing} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nombre</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Precio costo</label>
              <input type="number" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: +e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Precio venta</label>
              <input type="number" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: +e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock mínimo</label>
              <input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: +e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unidad</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, display: 'block' }}>Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', minHeight: 60 }} />
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={handleSubmit} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} style={{ padding: '10px 24px', background: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={th}>Código</th>
              <th style={th}>Nombre</th>
              <th style={{ ...th, textAlign: 'right' }}>P. Venta</th>
              <th style={{ ...th, textAlign: 'center' }}>Stock</th>
              <th style={{ ...th, textAlign: 'center' }}>Mínimo</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
              <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const qty = getStock(p.id)
              const isLow = qty <= p.min_stock
              const isOut = qty === 0
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={td}>{p.code}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.description}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>${p.selling_price.toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--text)' }}>
                      {qty}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>{p.min_stock}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)',
                      color: 'white',
                    }}>
                      {isOut ? 'Agotado' : isLow ? 'Bajo' : 'OK'}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button onClick={() => handleStockAdjust(p.id, 1, 'entry')} title="+1 stock" style={btnSm}>+1</button>
                      <button onClick={() => handleStockAdjust(p.id, 1, 'exit')} title="-1 stock" style={{ ...btnSm, background: 'var(--danger)' }}>-1</button>
                      <button onClick={() => handleEdit(p)} style={{ ...btnSm, background: 'var(--surface-hover)' }}>✎</button>
                      <button onClick={() => handleDelete(p.id)} style={{ ...btnSm, background: 'transparent', color: 'var(--text-muted)' }}>×</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No se encontraron productos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }
const btnSm: React.CSSProperties = { padding: '4px 8px', borderRadius: 4, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, background: 'var(--primary)', cursor: 'pointer' }
