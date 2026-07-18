import { useState, useEffect } from 'react'
import { api } from '../api/client'
import MaterialIcon from '../components/ui/MaterialIcon'

interface Vendor { id: number; dni: string; name: string; is_active: boolean }

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dni: '', name: '' })

  const load = async () => {
    try { const data = await api.get<Vendor[]>('/vendors'); setVendors(data) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const createVendor = async () => {
    if (!form.dni || !form.name) return
    try { await api.post('/vendors', form); setForm({ dni: '', name: '' }); setShowForm(false); load() } catch (e: any) { alert('Error: ' + e.message) }
  }

  const deactivateVendor = async (id: number, name: string) => {
    if (!confirm(`Desactivar vendedor "${name}"?`)) return
    await api.delete(`/vendors/${id}`)
    load()
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>
            <span>RRHH</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>VENDEDORES</span>
          </nav>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
            Vendedores
          </h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          background: 'var(--primary-container)', color: 'var(--on-primary-container)',
          paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
          paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
          borderRadius: 'var(--radius)', fontWeight: 700,
          boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
        }}>
          <MaterialIcon name="person_add" />
          Nuevo vendedor
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>DNI *</label>
            <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Ej: 12345678" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Nombre *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} placeholder="Nombre completo" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={createVendor} disabled={!form.dni || !form.name} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: (!form.dni || !form.name) ? 'var(--surface-container-highest)' : 'var(--primary-container)',
              color: (!form.dni || !form.name) ? 'var(--on-surface-variant)' : 'var(--on-primary-container)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700, cursor: (!form.dni || !form.name) ? 'not-allowed' : 'pointer',
            }}>
              <MaterialIcon name="check" size={18} />
              Crear
            </button>
            <button onClick={() => setShowForm(false)} style={{
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 500,
              background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)', background: 'var(--surface-container-high)' }}>
              <th style={th}>DNI</th>
              <th style={th}>Nombre</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
              <th style={{ ...th, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                <td style={td}>{v.dni}</td>
                <td style={td}>{v.name}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{
                    paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                    paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)',
                    borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                    background: v.is_active ? 'rgba(80,216,144,0.1)' : 'var(--surface-container-highest)',
                    color: v.is_active ? 'var(--success)' : 'var(--on-surface-variant)',
                  }}>
                    {v.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {v.is_active && (
                    <button onClick={() => deactivateVendor(v.id, v.name)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)',
                      padding: 'var(--space-xs) var(--space-md)',
                      borderRadius: 'var(--radius)',
                      background: 'var(--error-container)', color: 'var(--error)',
                      fontWeight: 700, fontSize: 12, cursor: 'pointer', borderWidth: 0,
                    }}>
                      <MaterialIcon name="block" size={16} />
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>No hay vendedores registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
  paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)',
  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: 'var(--outline)', textAlign: 'left',
}
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
