import { useState, useEffect } from 'react'
import { api, Audit } from '../api/client'
import { useToast } from '../components/Toast'

export default function Audits() {
  const { toast } = useToast()
  const [audits, setAudits] = useState<Audit[]>([])
  const [currentAudit, setCurrentAudit] = useState<any>(null)
  const [scanCode, setScanCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => { loadAudits() }, [])

  const loadAudits = () => {
    api.get<Audit[]>('/audits').then(au => { setAudits(au); setLoading(false) })
  }

  const createAudit = async () => {
    try {
      const result = await api.post<any>('/audits', { notes, created_by: 'Usuario' })
      toast(`Auditoría #${result.id} creada con ${result.items_count} productos`, 'success')
      setNotes('')
      loadAudits()
    } catch (e: any) { toast('Error: ' + e.message, 'error') }
  }

  const startAudit = async (id: number) => {
    await api.post(`/audits/${id}/start`)
    const detail = await api.get<any>(`/audits/${id}`)
    setCurrentAudit(detail)
  }

  const scanToAudit = async (code: string) => {
    if (!currentAudit) return
    try {
      await api.post(`/audits/${currentAudit.id}/scan`, { product_code: code })
      const detail = await api.get<any>(`/audits/${currentAudit.id}`)
      setCurrentAudit(detail)
      setScanCode('')
    } catch (e: any) { alert(e.message) }
  }

  const completeAudit = async () => {
    if (!currentAudit) return
    if (!confirm('¿Completar auditoría y aplicar correcciones?')) return
    const result = await api.post<any>(`/audits/${currentAudit.id}/complete?apply_corrections=true`)
    alert(`Auditoría completada. ${result.discrepancies.length} diferencias encontradas.`)
    setCurrentAudit(null)
    loadAudits()
  }

  const getStatusColor = (status: string) =>
    status === 'draft' ? 'var(--text-muted)' : status === 'in_progress' ? 'var(--warning)' : 'var(--success)'

  const getStatusLabel = (status: string) =>
    status === 'draft' ? 'Borrador' : status === 'in_progress' ? 'En curso' : 'Completada'

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  if (currentAudit) {
    return (
      <div>
        <button onClick={() => setCurrentAudit(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, marginBottom: 16 }}>← Volver</button>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Auditoría #{currentAudit.id}</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
          Estado: <span style={{ color: getStatusColor(currentAudit.status), fontWeight: 600 }}>{getStatusLabel(currentAudit.status)}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            placeholder="Escanear código para contar..."
            value={scanCode}
            onChange={e => setScanCode(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') scanToAudit(scanCode) }}
            style={{ flex: 1, padding: '12px 16px', fontSize: 16 }}
            autoFocus
          />
          <button onClick={() => scanToAudit(scanCode)} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
            Contar +1
          </button>
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Diferencias: {currentAudit.items?.length || 0}</span>
            <button onClick={completeAudit} style={{ padding: '8px 20px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600 }}>
              Completar y aplicar
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={th}>Producto</th>
                <th style={{ ...th, textAlign: 'right' }}>Teórico</th>
                <th style={{ ...th, textAlign: 'right' }}>Contado</th>
                <th style={{ ...th, textAlign: 'right' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {currentAudit.items?.map((item: any) => (
                <tr key={item.product_id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>{item.theoretical_qty}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{item.counted_qty}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: item.difference > 0 ? 'var(--success)' : item.difference < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {item.difference > 0 ? '+' : ''}{item.difference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Auditorías de Stock</h2>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Nueva auditoría</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Notas (opcional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Auditoría mensual depósito..." style={{ width: '100%', padding: '10px 12px' }} />
          </div>
          <button onClick={createAudit} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, height: 42 }}>
            Crear auditoría
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={th}>#</th>
              <th style={th}>Fecha</th>
              <th style={th}>Estado</th>
              <th style={th}>Creado por</th>
              <th style={th}>Notas</th>
              <th style={{ ...th, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {audits.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={td}>#{a.id}</td>
                <td style={td}>{a.audit_date}</td>
                <td style={td}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: getStatusColor(a.status), color: 'white' }}>
                    {getStatusLabel(a.status)}
                  </span>
                </td>
                <td style={td}>{a.created_by || '-'}</td>
                <td style={td}>{a.notes || '-'}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {a.status !== 'completed' && (
                    <button onClick={() => startAudit(a.id)} style={{ padding: '6px 16px', background: 'var(--warning)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                      {a.status === 'draft' ? 'Iniciar' : 'Continuar'}
                    </button>
                  )}
                  {a.status === 'completed' && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completada</span>
                  )}
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No hay auditorías registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }
