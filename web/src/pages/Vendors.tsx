import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface Vendor {
  id: number
  dni: string
  name: string
  is_active: boolean
}

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dni: '', name: '' })

  const load = async () => {
    try {
      const data = await api.get<Vendor[]>('/vendors')
      setVendors(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createVendor = async () => {
    if (!form.dni || !form.name) return
    try {
      await api.post('/vendors', form)
      setForm({ dni: '', name: '' })
      setShowForm(false)
      load()
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
  }

  const deactivateVendor = async (id: number, name: string) => {
    if (!confirm(`¿Desactivar vendedor "${name}"?`)) return
    await api.delete(`/vendors/${id}`)
    load()
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Vendedores</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
        }}>
          + Nuevo vendedor
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI *</label>
            <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={{ width: '100%' }} placeholder="Ej: 12345678" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nombre *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} placeholder="Nombre completo" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={createVendor} disabled={!form.dni || !form.name} style={{
              padding: '10px 20px', background: (!form.dni || !form.name) ? 'var(--border)' : 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: (!form.dni || !form.name) ? 'not-allowed' : 'pointer',
            }}>Crear</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'var(--border)', color: 'var(--text)', border: 'none', borderRadius: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={th}>DNI</th>
              <th style={th}>Nombre</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
              <th style={{ ...th, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={td}>{v.dni}</td>
                <td style={td}>{v.name}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: v.is_active ? 'var(--success)' : 'var(--text-muted)', color: 'white',
                  }}>
                    {v.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {v.is_active && (
                    <button onClick={() => deactivateVendor(v.id, v.name)} style={{
                      padding: '4px 12px', borderRadius: 4, border: 'none', color: 'white', fontSize: 12, fontWeight: 600, background: 'var(--danger)', cursor: 'pointer',
                    }}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {vendors.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No hay vendedores registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }