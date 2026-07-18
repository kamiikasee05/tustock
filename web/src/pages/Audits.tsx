import { useState, useEffect } from 'react'
import { api, Audit } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

export default function Audits() {
  const { toast } = useToast()
  const [audits, setAudits] = useState<Audit[]>([])
  const [currentAudit, setCurrentAudit] = useState<any>(null)
  const [scanCode, setScanCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')

  useEffect(() => { loadAudits() }, [])

  const loadAudits = () => {
    api.get<Audit[]>('/audits').then(au => { setAudits(au) }).catch(() => toast('Error al cargar auditorías', 'error')).finally(() => setLoading(false))
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
    try {
      await api.post(`/audits/${id}/start`)
      const detail = await api.get<any>(`/audits/${id}`)
      setCurrentAudit(detail)
    } catch (e: any) { toast('Error: ' + e.message, 'error') }
  }

  const scanToAudit = async (code: string) => {
    if (!currentAudit) return
    try {
      await api.post(`/audits/${currentAudit.id}/scan`, { product_code: code })
      const detail = await api.get<any>(`/audits/${currentAudit.id}`)
      setCurrentAudit(detail)
      setScanCode('')
    } catch (e: any) { toast('Error: ' + e.message, 'error') }
  }

  const completeAudit = async () => {
    if (!currentAudit) return
    if (!confirm('¿Completar auditoría y aplicar correcciones?')) return
    try {
      const result = await api.post<any>(`/audits/${currentAudit.id}/complete?apply_corrections=true`)
      toast(`Auditoría completada. ${result.discrepancies.length} diferencias encontradas.`, 'success')
      setCurrentAudit(null)
      loadAudits()
    } catch (e: any) { toast('Error: ' + e.message, 'error') }
  }

  const getStatusColor = (status: string) =>
    status === 'draft' ? 'var(--on-surface-variant)' : status === 'in_progress' ? 'var(--tertiary)' : 'var(--success)'

  const getStatusLabel = (status: string) =>
    status === 'draft' ? 'Borrador' : status === 'in_progress' ? 'En curso' : 'Completada'

  const getStatusBg = (status: string) =>
    status === 'draft' ? 'var(--surface-container-highest)' : status === 'in_progress' ? 'rgba(255,183,134,0.1)' : 'rgba(80,216,144,0.1)'

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>

  if (currentAudit) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <button onClick={() => setCurrentAudit(null)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-lg)',
          cursor: 'pointer', background: 'none', border: 'none',
        }}>
          <MaterialIcon name="arrow_back" size={20} />
          Volver
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 28, lineHeight: '36px', fontWeight: 700, color: 'var(--on-surface)' }}>
            Auditoría #{currentAudit.id}
          </h2>
          <span style={{
            paddingLeft: 'var(--space-md)', paddingRight: 'var(--space-md)',
            paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)',
            borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
            background: getStatusBg(currentAudit.status),
            color: getStatusColor(currentAudit.status),
          }}>{getStatusLabel(currentAudit.status)}</span>
        </div>

        <div style={{
          background: 'var(--surface-container-low)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(66,71,84,0.4)',
          marginBottom: 'var(--space-lg)',
        }}>
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--on-surface-variant)',
            marginBottom: 'var(--space-sm)',
          }}>
            Escaneá el código para contar
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              placeholder="Código de barras o SKU..."
              value={scanCode}
              onChange={e => setScanCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') scanToAudit(scanCode) }}
              style={{ flex: 1, padding: '12px 16px', fontSize: 16 }}
              autoFocus
            />
            <button onClick={() => scanToAudit(scanCode)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
            }}>
              <MaterialIcon name="qr_code_scanner" size={20} />
              Contar +1
            </button>
          </div>
        </div>

        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden',
        }}>
          <div style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderBottom: '1px solid rgba(66,71,84,0.3)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'var(--surface-container-high)',
          }}>
            <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <MaterialIcon name="difference" size={20} />
              Diferencias: {currentAudit.items?.length || 0}
            </span>
            <button onClick={completeAudit} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--success)', color: 'var(--bg)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
            }}>
              <MaterialIcon name="check_circle" size={18} />
              Completar y aplicar
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
                <th style={th}>Producto</th>
                <th style={{ ...th, textAlign: 'right' }}>Teórico</th>
                <th style={{ ...th, textAlign: 'right' }}>Contado</th>
                <th style={{ ...th, textAlign: 'right' }}>Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {currentAudit.items?.map((item: any) => (
                <tr key={item.product_id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                  <td style={td}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--on-surface)' }}>{item.name}</span>
                    <br />
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{item.code}</span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)' }}>{item.theoretical_qty}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)' }}>{item.counted_qty}</td>
                  <td style={{
                    ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 700,
                    color: item.difference > 0 ? 'var(--success)' : item.difference < 0 ? 'var(--error)' : 'var(--on-surface-variant)',
                  }}>
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
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--outline)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)',
        }}>
          <span>INVENTARIO</span>
          <MaterialIcon name="chevron_right" size={12} />
          <span style={{ color: 'var(--primary-fixed-dim)' }}>AUDITORÍAS</span>
        </nav>
        <h2 style={{
          fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px',
          fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)',
        }}>Auditorías de Stock</h2>
      </div>

      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)',
        border: '1px solid rgba(66,71,84,0.5)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <MaterialIcon name="add_task" size={20} />
          Nueva auditoría
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Notas (opcional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej: Auditoría mensual depósito..." style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box' }} />
          </div>
          <button onClick={createAudit} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            background: 'var(--primary-container)', color: 'var(--on-primary-container)',
            paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
            paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
            borderRadius: 'var(--radius)', fontWeight: 700, height: 42,
            boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
          }}>
            <MaterialIcon name="playlist_add" size={18} />
            Crear auditoría
          </button>
        </div>
      </div>

      <div style={{
        background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)', background: 'var(--surface-container-high)' }}>
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
              <tr key={a.id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                <td style={td}><span style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}>#{a.id}</span></td>
                <td style={td}>{a.audit_date}</td>
                <td style={td}>
                  <span style={{
                    paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                    paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)',
                    borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                    background: getStatusBg(a.status),
                    color: getStatusColor(a.status),
                  }}>
                    {getStatusLabel(a.status)}
                  </span>
                </td>
                <td style={td}>{a.created_by || '-'}</td>
                <td style={{ ...td, color: 'var(--on-surface-variant)' }}>{a.notes || '-'}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  {a.status !== 'completed' && (
                    <button onClick={() => startAudit(a.id)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)',
                      padding: 'var(--space-xs) var(--space-md)',
                      borderRadius: 'var(--radius)',
                      background: a.status === 'draft' ? 'var(--primary-container)' : 'var(--tertiary-container)',
                      color: a.status === 'draft' ? 'var(--on-primary-container)' : 'var(--on-tertiary)',
                      fontWeight: 700, fontSize: 12,
                    }}>
                      <MaterialIcon name={a.status === 'draft' ? 'play_arrow' : 'replay'} size={16} />
                      {a.status === 'draft' ? 'Iniciar' : 'Continuar'}
                    </button>
                  )}
                  {a.status === 'completed' && (
                    <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Completada</span>
                  )}
                </td>
              </tr>
            ))}
            {audits.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <MaterialIcon name="fact_check" size={48} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 12px' }} />
                No hay auditorías registradas
              </td></tr>
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
