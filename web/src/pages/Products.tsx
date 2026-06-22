import { useState, useEffect } from 'react'
import { api, Product, StockItem } from '../api/client'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad'
  })

  const load = () => {
    setLoading(true)
    const qs = `?search=${encodeURIComponent(search)}&include_inactive=${showInactive}`
    Promise.all([
      api.get<Product[]>(`/products${qs}`),
      api.get<StockItem[]>('/stock'),
    ])
      .then(([prods, stk]) => { setProducts(prods); setStock(stk) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, showInactive])

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

  const handleDelete = async (p: Product) => {
    const msg = p.is_active
      ? `¿Desactivar "${p.name}"?\n\nEl producto se ocultara de las listas pero se conservan sus ventas y movimientos de stock.`
      : `¿Eliminar definitivamente "${p.name}"? Esta accion no se puede deshacer.`
    if (!confirm(msg)) return
    await api.delete(`/products/${p.id}`)
    load()
  }

  const handleReactivate = async (id: number) => {
    await api.post(`/products/${id}/reactivate`)
    load()
  }

  const handleStockAdjust = async (productId: number, qty: number, type: string) => {
    await api.post('/stock/adjust', { product_id: productId, quantity: Math.abs(qty), movement_type: type, notes: `Ajuste manual desde panel` })
    load()
  }

  const activeCount = products.filter(p => p.is_active).length
  const inactiveCount = products.filter(p => !p.is_active).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>
          Productos
          {inactiveCount > 0 && showInactive && (
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
              ({activeCount} activos, {inactiveCount} inactivos)
            </span>
          )}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowInactive(!showInactive); setSearch('') }}
            style={{
              padding: '10px 16px',
              background: showInactive ? 'var(--warning)' : 'var(--surface)',
              color: showInactive ? '#000' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showInactive ? '✓ Inactivos' : '☠ Ver inactivos'}
          </button>
          <button
            onClick={() => { setEditing(null); setForm({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad' }); setShowForm(!showForm) }}
            style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 }}
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 14px' }}
        />
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, marginBottom: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: 16 }}>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Codigo</label>
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
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock minimo</label>
              <input type="number" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: +e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unidad</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, display: 'block' }}>Descripcion</label>
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
              <th style={th}>Codigo</th>
              <th style={th}>Nombre</th>
              <th style={{ ...th, textAlign: 'right' }}>P. Venta</th>
              <th style={{ ...th, textAlign: 'center' }}>Stock</th>
              <th style={{ ...th, textAlign: 'center' }}>Min</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
              <th style={{ ...th, textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const qty = getStock(p.id)
              const isLow = qty <= p.min_stock
              const isOut = qty === 0
              const inactive = !p.is_active
              return (
                <tr key={p.id} style={{
                  borderBottom: '1px solid var(--border)',
                  opacity: inactive ? 0.5 : 1,
                  background: inactive ? 'var(--bg)' : 'transparent',
                }}>
                  <td style={td}>{p.code}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>
                      {p.name}
                      {inactive && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--danger)' }}>INACTIVO</span>}
                    </div>
                    {p.description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.description}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: inactive ? 'var(--text-muted)' : 'var(--success)' }}>
                    ${p.selling_price.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 700, fontSize: 16,
                      color: inactive ? 'var(--text-muted)' : isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--text)',
                    }}>
                      {qty}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>{p.min_stock}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: inactive ? 'var(--text-muted)' : isOut ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--success)',
                      color: inactive ? '#000' : 'white',
                    }}>
                      {inactive ? 'Inactivo' : isOut ? 'Agotado' : isLow ? 'Bajo' : 'OK'}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    {inactive ? (
                      <button
                        onClick={() => handleReactivate(p.id)}
                        style={{ padding: '4px 12px', borderRadius: 4, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, background: 'var(--success)', cursor: 'pointer' }}
                      >
                        Reactivar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button onClick={() => handleStockAdjust(p.id, 1, 'entry')} title="+1 stock" style={btnSm}>+1</button>
                        <button onClick={() => handleStockAdjust(p.id, 1, 'exit')} title="-1 stock" style={{ ...btnSm, background: 'var(--danger)' }}>-1</button>
                        <button onClick={() => handleEdit(p)} style={{ ...btnSm, background: 'var(--surface-hover)' }}>✎</button>
                        <button onClick={() => handleDelete(p)} style={{ ...btnSm, background: 'transparent', color: 'var(--text-muted)' }}>×</button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                {showInactive ? 'No hay productos inactivos' : 'No se encontraron productos'}
              </td></tr>
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
