import { useState, useEffect } from 'react'
import { api, Product, StockItem } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface Category { id: number; name: string; parent_id: number | null }

export default function Products() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<number | ''>('')
  const [showInactive, setShowInactive] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad', category_id: '' as number | '', barcode: '' as string
  })

  const load = () => {
    setLoading(true)
    let qs = `?search=${encodeURIComponent(search)}&include_inactive=${showInactive}`
    if (filterCat !== '') qs += `&category_id=${filterCat}`
    Promise.all([
      api.get<Product[]>(`/products${qs}`),
      api.get<StockItem[]>('/stock'),
      api.get<Category[]>('/products/categories'),
    ])
      .then(([prods, stk, cats]) => { setProducts(prods); setStock(stk); setCategories(cats) })
      .catch(() => toast('Error al cargar productos', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, showInactive, filterCat])

  const getStock = (id: number) => stock.find(s => s.id === id)?.quantity || 0

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const body = form.category_id !== '' ? { ...form, category_id: form.category_id } : { ...form, category_id: null }
      if (editing) {
        await api.put(`/products/${editing.id}`, body)
      } else {
        await api.post('/products', body)
      }
      setShowForm(false)
      setEditing(null)
      setForm({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad', category_id: '', barcode: '' })
      load()
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (p: Product) => {
    setEditing(p)
    setForm({ code: p.code, name: p.name, description: p.description || '', cost_price: p.cost_price, selling_price: p.selling_price, min_stock: p.min_stock, unit: p.unit, category_id: p.category_id ?? '', barcode: p.barcode || '' })
    setShowForm(true)
  }

  const handleDelete = async (p: Product) => {
    const msg = p.is_active
      ? `Desactivar "${p.name}"?\n\nEl producto se ocultara de las listas pero se conservan sus ventas y movimientos de stock.`
      : `Eliminar definitivamente "${p.name}"? Esta accion no se puede deshacer.`
    if (!confirm(msg)) return
    await api.delete(`/products/${p.id}`)
    load()
  }

  const handleReactivate = async (id: number) => {
    await api.post(`/products/${id}/reactivate`)
    load()
  }

  const handleStockAdjust = async (productId: number, qty: number, type: string) => {
    await api.post('/stock/adjust', { product_id: productId, quantity: Math.abs(qty), movement_type: type, notes: 'Ajuste manual desde panel' })
    load()
  }

  const activeCount = products.filter(p => p.is_active).length
  const outOfStockCount = products.filter(p => { const q = getStock(p.id); return q === 0 && p.is_active }).length

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: 'var(--on-surface)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    lineHeight: '20px',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--outline)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 'var(--space-lg)' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            <span>INVENTARIO</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>PRODUCTOS</span>
          </nav>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 22, fontWeight: 700, color: 'var(--on-surface)' }}>
            Gestión de Productos
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-container-low)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid rgba(66,71,84,0.3)' }}>
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', paddingLeft: 8 }}>Ver inactivos</span>
            <button
              onClick={() => { setShowInactive(!showInactive); setSearch('') }}
              style={{
                position: 'relative', display: 'inline-flex', height: 24, width: 44,
                alignItems: 'center', borderRadius: 'var(--radius-full)',
                background: showInactive ? 'var(--primary-container)' : 'var(--surface-container-highest)',
                transition: 'background var(--transition)', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{
                display: 'inline-block', height: 16, width: 16,
                borderRadius: 'var(--radius-full)',
                background: showInactive ? 'var(--on-primary-container)' : 'var(--outline)',
                transition: 'transform var(--transition), background var(--transition)',
                transform: showInactive ? 'translateX(24px)' : 'translateX(4px)',
              }} />
            </button>
          </div>
          <button
            onClick={() => { setEditing(null); setForm({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad', category_id: '', barcode: '' }); setShowForm(!showForm) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
              boxShadow: '0 2px 8px rgba(77,142,255,0.15)',
              transition: 'all var(--transition)',
            }}
          >
            <MaterialIcon name="add" size={18} />
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {/* ── FILTERS + STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--gutter)', marginBottom: 'var(--space-lg)' }}>
        <div style={{
          background: 'var(--surface-container)', border: '1px solid rgba(66,71,84,0.5)',
          borderRadius: 'var(--radius-md)', padding: 12,
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MaterialIcon name="search" size={18} color="var(--outline)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Filtrá por descripción, marca o EAN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value ? +e.target.value : '')} style={{ ...inputStyle, width: 240, flexShrink: 0, appearance: 'none' as const, cursor: 'pointer' }}>
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)',
            color: 'var(--secondary)', fontSize: 13, fontWeight: 500,
            background: 'transparent', transition: 'background var(--transition)',
          }}>
            <MaterialIcon name="filter_list" size={18} />
            <span>Más filtros</span>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{
            background: 'var(--surface-container)', border: '1px solid rgba(66,71,84,0.5)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-md)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 4 }}>TOTAL ITEMS</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>{activeCount}</span>
          </div>
          <div style={{
            background: 'var(--surface-container)', border: '1px solid rgba(66,71,84,0.5)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-md)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--error)', marginBottom: 4 }}>SIN STOCK</span>
            <span style={{ fontFamily: 'var(--font-data)', fontSize: 18, fontWeight: 600, color: 'var(--error)' }}>{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* ── PRODUCT FORM ── */}
      {showForm && (
        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-md)',
          padding: 20, marginBottom: 'var(--space-lg)',
          border: '1px solid rgba(66,71,84,0.5)',
        }}>
          <h3 style={{ marginBottom: 16, color: 'var(--on-surface)', fontSize: 18, fontWeight: 600 }}>
            {editing ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} style={{ ...inputStyle, flex: 1 }} disabled={!!editing} />
                {!editing && (
                  <button type="button" onClick={async () => { try { const data = await api.get<{ code: string }>('/products/generate-code'); setForm({ ...form, code: data.code }) } catch (e) {} }}
                    style={{ padding: '8px 14px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                    Generar
                  </button>
                )}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Código de barras</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} style={{ ...inputStyle, flex: 1 }} placeholder="Ej: 7791234567890" />
                <button type="button" onClick={async () => { try { const data = await api.get<{ barcode: string }>('/products/barcode/next'); setForm({ ...form, barcode: data.barcode }) } catch (e) {} }}
                  style={{ padding: '8px 14px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                  Generar
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Precio costo</label>
              <input type="number" step="0.01" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: +e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Precio venta</label>
              <input type="number" step="0.01" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: +e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Stock mínimo</label>
              <input type="number" step="1" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: +e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Unidad</label>
              <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value ? +e.target.value : '' })} style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={async () => { const name = prompt('Nombre de la nueva categoría:'); if (name) { await api.post('/products/categories', { name }); const cats = await api.get<Category[]>('/products/categories'); setCategories(cats) } }}
                  style={{ padding: '8px 12px', background: 'var(--surface-container-highest)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  + Nueva
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button onClick={handleSubmit} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
              boxShadow: '0 2px 8px rgba(77,142,255,0.15)',
            }}>
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} style={{
              padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 500, fontSize: 13,
              background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{
        background: 'var(--surface-container)', border: '1px solid rgba(66,71,84,0.5)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)', background: 'var(--surface-container-high)' }}>
              <th style={thStyle}>Barcode</th>
              <th style={thStyle}>Producto / Descripción</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Stock</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const qty = getStock(p.id)
              const isLow = qty <= p.min_stock && qty > 0
              const isOut = qty === 0
              const inactive = !p.is_active
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid rgba(66,71,84,0.2)',
                    opacity: inactive ? 0.5 : 1,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!inactive) e.currentTarget.style.background = 'var(--surface-container-highest)' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent' }
                >
                  {/* Barcode */}
                  <td style={tdStyle}>
                    <div style={{ width: 48, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(66,71,84,0.2)', overflow: 'hidden' }}>
                      {p.barcode ? (
                        <img src={`/api/products/${p.id}/barcode.png`} alt={p.barcode} style={{ height: '100%', objectFit: 'contain', mixBlendMode: 'screen', opacity: 0.8 }} />
                      ) : (
                        <button
                          onClick={async () => { try { await api.post(`/products/${p.id}/barcode`); load() } catch (e) {} }}
                          style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--surface-container-highest)', color: 'var(--on-surface-variant)', fontSize: 9, fontWeight: 600, border: '1px solid var(--outline-variant)', cursor: 'pointer', lineHeight: 1 }}
                        >
                          Generar
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Product name + description */}
                  <td style={{ ...tdStyle, maxWidth: 240 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: 13, lineHeight: '18px' }}>
                        {p.name}
                        {inactive && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--error)' }}>INACTIVO</span>}
                      </span>
                      <span style={{ color: 'var(--outline)', fontSize: 11, lineHeight: '14px' }}>
                        {(p as any).category_name || 'Sin categoría'} · {p.code}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td style={tdStyle}>
                    <span style={{
                      fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 500, lineHeight: '18px',
                      color: inactive ? 'var(--on-surface-variant)' : 'var(--success)',
                    }}>
                      $ {p.selling_price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Stock */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      fontFamily: 'var(--font-data)', fontSize: 14, fontWeight: 700, lineHeight: '18px',
                      color: inactive ? 'var(--on-surface-variant)' : isOut ? 'var(--error)' : isLow ? 'var(--tertiary)' : 'var(--on-surface)',
                    }}>
                      {String(qty).padStart(2, '0')}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    {inactive ? (
                      <span style={badgeStyle('var(--surface-container-highest)', 'var(--on-surface-variant)')}>INACTIVO</span>
                    ) : isOut ? (
                      <span style={badgeStyle('var(--danger-bg)', 'var(--error)')}>SIN STOCK</span>
                    ) : isLow ? (
                      <span style={badgeStyle('var(--warning-bg)', 'var(--tertiary)')}>STOCK BAJO</span>
                    ) : (
                      <span style={badgeStyle('var(--success-bg)', 'var(--success)')}>EN STOCK</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {inactive ? (
                      <button onClick={() => handleReactivate(p.id)} style={{
                        padding: '4px 12px', borderRadius: 'var(--radius)',
                        background: 'var(--success)', color: 'var(--bg)', fontWeight: 600, fontSize: 12,
                      }}>
                        Reactivar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <input type="number" step="any" min="0.01" defaultValue={1}
                          style={{ width: 56, textAlign: 'center', padding: '3px 4px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: 12, fontFamily: 'var(--font-data)', color: 'var(--on-surface)' }}
                          id={`stock-adj-${p.id}`}
                        />
                        <button onClick={() => { const inp = document.getElementById(`stock-adj-${p.id}`) as HTMLInputElement; const qty = parseFloat(inp?.value || '1'); if (qty > 0) handleStockAdjust(p.id, qty, 'exit') }} style={actionBtnStyle}>
                          <MaterialIcon name="remove" size={16} />
                        </button>
                        <button onClick={() => { const inp = document.getElementById(`stock-adj-${p.id}`) as HTMLInputElement; const qty = parseFloat(inp?.value || '1'); if (qty > 0) handleStockAdjust(p.id, qty, 'entry') }} style={actionBtnStyle}>
                          <MaterialIcon name="add" size={16} />
                        </button>
                        <button onClick={() => handleEdit(p)} style={actionBtnStyle}>
                          <MaterialIcon name="edit" size={16} />
                        </button>
                        <button onClick={() => handleDelete(p)} style={actionBtnStyle}>
                          <MaterialIcon name="delete" size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 14 }}>
                  {showInactive ? 'No hay productos inactivos' : 'No se encontraron productos'}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ── PAGINATION ── */}
        <div style={{
          background: 'var(--surface-container-high)',
          padding: '10px 16px',
          borderTop: '1px solid rgba(66,71,84,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
            Mostrando {products.length} de {products.length} productos
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={paginationBtnStyle}>Anterior</button>
            <button style={{ ...paginationBtnStyle, width: 32, height: 32, padding: 0, justifyContent: 'center', background: 'var(--primary-container)', color: 'var(--on-primary-container)', fontWeight: 700, border: 'none', fontFamily: 'var(--font-data)', fontSize: 12 }}>1</button>
            <button style={paginationBtnStyle}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Shared style objects ── */

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--outline)',
  textAlign: 'left',
  lineHeight: '16px',
}

const tdStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 13,
  lineHeight: '18px',
}

const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  lineHeight: '14px',
  background: bg,
  color: fg,
})

const actionBtnStyle: React.CSSProperties = {
  padding: 4,
  borderRadius: 'var(--radius)',
  background: 'transparent',
  color: 'var(--on-surface-variant)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s ease',
}

const paginationBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 6,
  border: '1px solid rgba(66,71,84,0.5)',
  color: 'var(--on-surface-variant)',
  fontSize: 13,
  background: 'transparent',
  fontWeight: 500,
  transition: 'background 0.15s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}
