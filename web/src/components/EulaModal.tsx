import { useState } from 'react'
import { api } from '../api/client'
import { useLicense } from '../hooks/useLicense'
import MaterialIcon from './ui/MaterialIcon'

export default function EulaModal() {
  const { status, refresh, loading } = useLicense()
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (loading) return null
  if (status.eula_accepted) return null

  const handleAccept = async () => {
    setSubmitting(true)
    setError('')
    try {
      await api.post('/license/accept-eula', {})
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('Ya aceptaste')) {
        await refresh().catch(() => {})
        setSubmitting(false)
        return
      }
      setSubmitting(false)
      setError('Error al guardar. Verificá que el servidor esté corriendo.')
      return
    }
    try {
      await refresh()
    } catch {}
    setSubmitting(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: 600, width: '100%', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        border: '1px solid rgba(66, 71, 84, 0.5)',
        boxShadow: 'var(--shadow-modal)',
      }}>
        <div style={{ padding: '24px 24px 0' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: '32px', fontWeight: 800, color: 'var(--primary)' }}>
            TUSTOCK
          </h2>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16, marginTop: 4 }}>
            Antes de continuar, leé y aceptá los términos de uso
          </p>
        </div>

        <div style={{
          flex: 1, overflow: 'auto', padding: '0 24px',
          fontSize: 13, lineHeight: 1.7, color: 'var(--on-surface-variant)',
        }}>
          <p><strong style={{ color: 'var(--on-surface)' }}>Términos y Condiciones de Uso + Licencia de Software</strong></p>
          <p>Al usar TUSTOCK aceptás los siguientes términos:</p>
          <ul style={{ paddingLeft: 16, marginBottom: 12 }}>
            <li style={{ marginBottom: 6 }}>Licencia de uso limitada, no exclusiva e intransferible para 1 PC.</li>
            <li style={{ marginBottom: 6 }}>No está permitido distribuir, modificar ni realizar ingeniería inversa del Software.</li>
            <li style={{ marginBottom: 6 }}>El Software se proporciona "tal cual". La garantía se limita a corregir errores en un plazo razonable.</li>
            <li style={{ marginBottom: 6 }}>El Proveedor no es responsable por daños indirectos o pérdida de datos.</li>
            <li style={{ marginBottom: 6 }}>Los datos del negocio son responsabilidad del Usuario. Se recomienda hacer backups periódicos.</li>
            <li style={{ marginBottom: 6 }}>Las licencias se activan con una clave única. No compartir la clave con terceros.</li>
            <li style={{ marginBottom: 6 }}>El plan Suscripción se renueva automáticamente cada mes. Se puede cancelar en cualquier momento.</li>
            <li style={{ marginBottom: 6 }}>Si se rechaza el pago de la suscripción, hay 7 días de gracia antes de perder updates y soporte.</li>
          </ul>
          <p style={{ fontSize: 12 }}>
            Documentos completos:{' '}
            <a href="/api/license/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Términos y Condiciones
            </a>
            {' · '}
            <a href="/api/license/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Política de Privacidad
            </a>
            {' · '}
            <a href="/api/license/refund" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Política de Reembolso
            </a>
          </p>
        </div>

        <div style={{ padding: '16px 24px 24px', borderTop: '1px solid rgba(66, 71, 84, 0.3)', marginTop: 16 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--error)', marginBottom: 12 }}>
              <MaterialIcon name="error" size={18} />
              {error}
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
            Acepto los <strong>Términos y Condiciones</strong> y la <strong>Política de Privacidad</strong>
          </label>
          <button onClick={handleAccept} disabled={!accepted || submitting}
            style={{
              width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: 'none',
              background: accepted ? 'var(--primary-container)' : 'var(--surface-container-highest)',
              color: accepted ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
              fontSize: 15, fontWeight: 700,
              cursor: accepted ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <MaterialIcon name={submitting ? 'sync' : 'check_circle'} size={20} />
            {submitting ? 'Guardando...' : 'Aceptar y continuar'}
          </button>
        </div>
      </div>
    </div>
  )
}
