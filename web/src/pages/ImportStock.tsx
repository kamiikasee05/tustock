import { useState, useRef } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface ImportItem {
  product_id: number
  code: string
  barcode: string
  scanned: string
  name: string
  price?: number
  theoretical_qty: number
  counted_qty: number
  difference: number
  original_qty: number
}

interface ImportError {
  line?: number
  barcode?: string
  name?: string
  quantity?: number
  price?: number
  message: string
  malformed?: boolean
}

interface NameInputState {
  [barcode: string]: string
}

interface PriceInputState {
  [barcode: string]: string
}

interface ImportPreview {
  audit_id: number | null
  status: string
  total_items: number
  matched: number
  skipped: number
  malformed: ImportError[]
  errors: ImportError[]
  items: ImportItem[]
}

const fmt = (n: number | null | undefined) => {
  if (n === null || n === undefined) return '—'
  return String(n).replace(/\.0$/, '')
}

const fmtPrice = (n: number | null | undefined) => {
  if (n === null || n === undefined || n <= 0) return '$0'
  return '$' + String(n).replace(/\.0$/, '')
}

export default function ImportStock() {
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'upload' | 'preview' | 'result'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [items, setItems] = useState<ImportItem[]>([])
  const [errors, setErrors] = useState<ImportError[]>([])
  const [result, setResult] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const [nameInputs, setNameInputs] = useState<NameInputState>({})
  const [priceInputs, setPriceInputs] = useState<PriceInputState>({})

  const getPrice = (barcode: string, fallback?: number): number => {
    const raw = (priceInputs[barcode] || '').trim()
    if (raw !== '') {
      const p = parseFloat(raw.replace(',', '.'))
      if (!isNaN(p) && p > 0) return p
    }
    return fallback && fallback > 0 ? fallback : 0
  }

  const doImport = async () => {
    if (!file) return
    setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await api.upload<ImportPreview>('/audits/import-csv', fd)
      setPreview(data)
      setItems(data.items.map(it => ({ ...it, original_qty: it.counted_qty })))
      setErrors([...data.errors, ...data.malformed.map(m => ({ ...m, malformed: true }))])
      setPhase('preview')
      if (data.matched === 0 && data.errors.length === 0) {
        toast('El CSV no tiene productos válidos', 'error')
      } else if (data.matched === 0) {
        toast('Todos los productos son nuevos — registralos con "Registrar todos"', 'info')
      } else {
        toast(`Importados ${data.matched} productos del CSV`, 'success')
      }
    } catch (e: any) {
      toast('Error al importar: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const setQty = (productId: number, value: string) => {
    const q = parseFloat(value.replace(',', '.'))
    const val = isNaN(q) || q < 0 ? 0 : q
    setItems(prev => prev.map(it =>
      it.product_id === productId ? { ...it, counted_qty: val, difference: val - it.theoretical_qty } : it
    ))
  }

  const registerProduct = async (err: ImportError) => {
    if (!preview?.audit_id || !err.barcode) return
    const name = (nameInputs[err.barcode] || err.name || '').trim()
    if (!name) {
      toast('Escribí un nombre para el producto', 'error')
      return
    }
    setBusy(true)
    try {
      const res = await api.post<any>('/audits/import-register', {
        audit_id: preview.audit_id,
        barcode: err.barcode,
        name,
        quantity: err.quantity ?? 0,
        price: getPrice(err.barcode, err.price),
      })
      setItems(prev => [...prev, { ...res, original_qty: res.counted_qty }])
      setErrors(prev => prev.filter(e => e.barcode !== err.barcode))
      toast(`Producto "${res.name}" registrado`, 'success')
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const registerAll = async () => {
    if (!preview?.audit_id) return
    const pendientes = errors.filter(e => !e.malformed && e.barcode)
    const conNombre = pendientes.filter(e => e.name || nameInputs[e.barcode!])
    const sinNombre = pendientes.filter(e => !e.name && !nameInputs[e.barcode!])
    if (pendientes.length === 0) return
    if (sinNombre.length > 0) {
      toast(`Falta nombre para ${sinNombre.length} producto(s) — escribí el nombre en la fila correspondiente`, 'error')
      return
    }
    const sinPrecio = pendientes.filter(e => getPrice(e.barcode!, e.price) <= 0)
    const msg = sinPrecio.length > 0
      ? `¿Registrar ${pendientes.length} producto(s) nuevo(s)?\n${sinPrecio.length} sin precio (quedan a $0 — cargalo en el input de precio o después en Productos).`
      : `¿Registrar ${pendientes.length} producto(s) nuevo(s)?\nSe crean con el nombre, el precio y el stock contado.`
    if (!confirm(msg)) return
    setBusy(true)
    try {
      const res = await api.post<any>('/audits/import-register-batch', {
        audit_id: preview.audit_id,
        products: pendientes.map(e => ({
          barcode: e.barcode,
          name: nameInputs[e.barcode!] || e.name || '',
          quantity: e.quantity ?? 0,
          price: getPrice(e.barcode!, e.price),
        })),
      })
      const createdBarcodes = new Set((res.created || []).map((c: any) => c.scanned))
      setItems(prev => [...prev, ...(res.created || []).map((c: any) => ({ ...c, original_qty: c.counted_qty }))])
      setErrors(prev => {
        const submitted = new Set(pendientes.map(e => e.barcode))
        const kept = prev.filter(e => !submitted.has(e.barcode))
        const map = new Map<string, ImportError>()
        for (const e of [...kept, ...(res.errors || [])]) {
          if (e.barcode) map.set(e.barcode, e)
          else map.set(`line-${e.line}-${kept.length}-${Math.random()}`, e)
        }
        return [...map.values()]
      })
      toast(`Se registraron ${res.created?.length || 0} producto(s)`, 'success')
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const skipError = (barcode?: string) => {
    if (!barcode) return
    setErrors(prev => prev.filter(e => e.barcode !== barcode))
  }

  const applyCorrections = async () => {
    if (!preview?.audit_id) return
    if (!confirm('¿Aplicar las correcciones de stock?')) return
    setBusy(true)
    try {
      const changed = items.filter(it => it.counted_qty !== it.original_qty)
      for (const it of changed) {
        await api.put(`/audits/${preview.audit_id}/items`, {
          product_id: it.product_id,
          counted_qty: it.counted_qty,
        })
      }
      const res = await api.post<any>(`/audits/${preview.audit_id}/complete?apply_corrections=true`)
      setResult(res)
      setPhase('result')
      toast('Correcciones aplicadas correctamente', 'success')
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setPhase('upload')
    setFile(null)
    setPreview(null)
    setItems([])
    setErrors([])
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
    background: 'var(--primary-container)', color: 'var(--on-primary-container)',
    paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
    paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
    borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 14,
    boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
  }
  const ghostBtn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
    background: 'var(--surface-container)', color: 'var(--on-surface)',
    paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
    paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
    borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 14,
    border: '1px solid var(--outline-variant)',
  }
  const inputStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--on-surface)',
    fontSize: 14, fontFamily: 'var(--font-data)', width: 90, textAlign: 'right',
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--outline)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)',
        }}>
          <span>INVENTARIO</span>
          <MaterialIcon name="chevron_right" size={12} />
          <span style={{ color: 'var(--primary-fixed-dim)' }}>IMPORTAR STOCK</span>
        </nav>
        <h2 style={{
          fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px',
          fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)',
        }}>Importar toma de stock</h2>
        <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 4 }}>
          Cargá el CSV generado por la app Stock (escaneo del local) y aplicá el conteo real.
        </p>
      </div>

      {phase === 'upload' && (
        <>
          <div style={{
            background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(66,71,84,0.5)', padding: 'var(--space-xl)',
          }}>
            <label
              onClick={() => fileRef.current?.click()}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)',
                padding: 'var(--space-2xl) var(--space-lg)', border: '2px dashed var(--outline-variant)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center',
                background: file ? 'rgba(80,216,144,0.06)' : 'transparent',
                transition: 'border-color var(--transition), background var(--transition)',
              }}
            >
              <MaterialIcon name="upload_file" size={48} color="var(--primary)" />
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>
                  {file ? file.name : 'Elegí el archivo CSV de la toma'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                  {file
                    ? `${(file.size / 1024).toFixed(1)} KB — tocan para cambiarlo`
                    : 'Formato: barcode;cantidad;nombre;precio — el mismo que exporta la app Stock'}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={e => setFile(e.target.files?.[0] || null)}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div style={{
            marginTop: 'var(--space-lg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-lg)',
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap',
              background: 'var(--surface-container-low)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md) var(--space-lg)', border: '1px solid rgba(66,71,84,0.4)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <MaterialIcon name="info" size={16} />
                Duplicados se <b>suman</b> (contás 2 veces → suma).
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <MaterialIcon name="warning_amber" size={16} />
                No abras el CSV en Excel antes de importar (puede borrar ceros del código).
              </div>
            </div>
            <button onClick={doImport} disabled={!file || busy} style={{
              ...inputBtn, opacity: !file || busy ? 0.5 : 1, cursor: !file || busy ? 'not-allowed' : 'pointer',
            }}>
              <MaterialIcon name="cloud_upload" size={20} />
              {busy ? 'Importando...' : 'Importar CSV'}
            </button>
          </div>
        </>
      )}

      {phase === 'preview' && preview && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--space-md)', marginBottom: 'var(--space-lg)',
          }}>
            {[
              { label: 'Productos en CSV', value: preview.total_items, color: 'var(--on-surface)', icon: 'list_alt' },
              { label: 'Coinciden', value: preview.matched, color: 'var(--success)', icon: 'check_circle' },
              { label: 'Errores', value: errors.length, color: errors.length > 0 ? 'var(--error)' : 'var(--success)', icon: 'error' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--surface-container)', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(66,71,84,0.5)', padding: 'var(--space-md) var(--space-lg)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
              }}>
                <MaterialIcon name={s.icon} size={28} color={s.color} />
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-data)', color: s.color, lineHeight: '28px' }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden', marginBottom: 'var(--space-lg)',
          }}>
            <div style={{
              padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid rgba(66,71,84,0.3)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--surface-container-high)',
            }}>
              <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <MaterialIcon name="fact_check" size={20} />
                Conteo del CSV — revisá y ajustá las cantidades
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
                    <th style={th}>Producto</th>
                    <th style={th}>Código escaneado</th>
                    <th style={{ ...th, textAlign: 'right' }}>Precio</th>
                    <th style={{ ...th, textAlign: 'right' }}>Stock en sistema</th>
                    <th style={{ ...th, textAlign: 'right' }}>Conteo CSV</th>
                    <th style={{ ...th, textAlign: 'right' }}>Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(it => {
                    const diff = it.difference
                    return (
                      <tr key={it.product_id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                        <td style={td}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--on-surface)' }}>{it.name}</span>
                          <br />
                          <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{it.code}</span>
                        </td>
                        <td style={{ ...td, fontFamily: 'var(--font-data)', color: 'var(--on-surface-variant)' }}>{it.scanned}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)', color: 'var(--on-surface-variant)' }}>{fmtPrice(it.price)}</td>
                        <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)' }}>{fmt(it.theoretical_qty)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={it.counted_qty}
                            onChange={e => setQty(it.product_id, e.target.value)}
                            style={inputStyle}
                          />
                        </td>
                        <td style={{
                          ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 700,
                          color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--error)' : 'var(--on-surface-variant)',
                        }}>
                          {diff > 0 ? '+' : ''}{fmt(diff)}
                        </td>
                      </tr>
                    )
                  })}
                  {items.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      No hay productos que coincidan en el CSV
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {errors.length > 0 && (
            <div style={{
              background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--danger-border)', overflow: 'hidden', marginBottom: 'var(--space-lg)',
            }}>
              <div style={{
                padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid rgba(255,180,171,0.2)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                color: 'var(--danger)', fontWeight: 600, fontSize: 14,
                justifyContent: 'space-between', flexWrap: 'wrap',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <MaterialIcon name="error" size={20} />
                  {errors.length} línea{errors.length !== 1 ? 's' : ''} sin resolver
                </span>
                {errors.some(e => !e.malformed && e.barcode && (e.name || nameInputs[e.barcode])) && (
                  <button onClick={registerAll} disabled={busy} style={{
                    ...inputBtn,
                    background: 'var(--danger)', color: 'var(--bg)',
                    opacity: busy ? 0.5 : 1, cursor: busy ? 'not-allowed' : 'pointer',
                  }}>
                    <MaterialIcon name="playlist_add_check" size={16} />
                    {busy ? 'Registrando...' : 'Registrar todos los pendientes'}
                  </button>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,180,171,0.15)' }}>
                      <th style={{ ...th, color: 'var(--danger)' }}>Código / línea</th>
                      <th style={{ ...th, color: 'var(--danger)' }}>Motivo</th>
                      <th style={{ ...th, textAlign: 'center', color: 'var(--danger)' }}>Precio</th>
                      <th style={{ ...th, textAlign: 'center', color: 'var(--danger)' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((err, i) => (
                      <tr key={`${err.barcode || 'line'}-${i}`} style={{ borderBottom: '1px solid rgba(255,180,171,0.1)' }}>
                        <td style={td}>
                          <span style={{ fontFamily: 'var(--font-data)', color: 'var(--on-surface)', fontWeight: 600 }}>
                            {err.barcode || `línea ${err.line}`}
                          </span>
                          {err.name && (
                            <span style={{ display: 'block', fontSize: 12, color: 'var(--on-surface-variant)' }}>{err.name}</span>
                          )}
                        </td>
                        <td style={{ ...td, color: 'var(--on-surface-variant)' }}>{err.message}</td>
                        <td style={{ ...td, textAlign: 'center' }}>
                          {err.malformed || !err.barcode ? (
                            <span style={{ color: 'var(--on-surface-variant)' }}>—</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              step="any"
                              placeholder="Precio $"
                              value={priceInputs[err.barcode] ?? (err.price && err.price > 0 ? String(err.price).replace(/\.0$/, '') : '')}
                              onChange={e => setPriceInputs(prev => ({ ...prev, [err.barcode!]: e.target.value }))}
                              style={{
                                ...inputStyle, width: 100,
                                borderColor: priceInputs[err.barcode] ? 'var(--primary)' : 'var(--outline-variant)',
                              }}
                            />
                          )}
                        </td>
                        <td style={{ ...td, textAlign: 'center' }}>
                          {err.malformed ? (
                            <button onClick={() => setErrors(prev => prev.filter((_, x) => x !== i))} style={ghostBtn}>
                              <MaterialIcon name="close" size={16} />
                              Ignorar
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', alignItems: 'center' }}>
                              {(!err.name && err.barcode) && (
                                <input
                                  type="text"
                                  placeholder="Nombre del producto"
                                  value={nameInputs[err.barcode] || ''}
                                  onChange={e => setNameInputs(prev => ({ ...prev, [err.barcode!]: e.target.value }))}
                                  style={{
                                    ...inputStyle, width: 160,
                                    borderColor: nameInputs[err.barcode] ? 'var(--primary)' : 'var(--outline-variant)',
                                  }}
                                />
                              )}
                              <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                                <button onClick={() => registerProduct(err)} disabled={busy} style={inputBtn}>
                                  <MaterialIcon name="add_box" size={16} />
                                  Registrar producto
                                </button>
                                <button onClick={() => skipError(err.barcode)} disabled={busy} style={ghostBtn}>
                                  <MaterialIcon name="skip_next" size={16} />
                                  Saltar
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={reset} disabled={busy} style={ghostBtn}>
              <MaterialIcon name="arrow_back" size={18} />
              Volver
            </button>
            <button onClick={applyCorrections} disabled={busy || items.length === 0} style={{
              ...inputBtn, opacity: busy || items.length === 0 ? 0.5 : 1,
              cursor: busy || items.length === 0 ? 'not-allowed' : 'pointer',
              background: 'var(--success)', color: 'var(--bg)',
            }}>
              <MaterialIcon name="check_circle" size={18} />
              {busy ? 'Aplicando...' : 'Aplicar correcciones'}
            </button>
          </div>
        </>
      )}

      {phase === 'result' && result && (
        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(80,216,144,0.3)', padding: 'var(--space-xl)',
          textAlign: 'center', maxWidth: 560, margin: '0 auto',
        }}>
          <MaterialIcon name="check_circle" size={64} color="var(--success)" />
          <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface)', marginTop: 'var(--space-md)' }}>
            Toma de stock aplicada
          </h3>
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', marginTop: 'var(--space-sm)' }}>
            Se aplicaron {result.discrepancies?.length || 0} correcciones de stock.
          </p>
          <button onClick={reset} style={{ ...inputBtn, marginTop: 'var(--space-lg)' }}>
            <MaterialIcon name="upload_file" size={18} />
            Importar otra toma
          </button>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = {
  paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
  paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)',
  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: 'var(--outline)', textAlign: 'left',
  whiteSpace: 'nowrap',
}
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
