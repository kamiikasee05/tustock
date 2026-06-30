import { useState } from 'react'
import { api } from '../api/client'
import { useLicense, LicenseStatus } from '../hooks/useLicense'
import { useToast } from '../components/Toast'

export default function Settings() {
  const { status, refresh } = useLicense()
  const { toast } = useToast()
  const [keyInput, setKeyInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleActivate = async () => {
    const key = keyInput.trim()
    if (!key) return
    setSubmitting(true)
    try {
      const result = await api.post<LicenseStatus>('/license/activate', { key, customer_name: nameInput.trim() })
      toast(`Plan ${result.plan_name} activado correctamente`, 'success')
      refresh()
      setKeyInput('')
      setNameInput('')
    } catch (e: any) {
      toast(e.message || 'Error al activar licencia', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Ajustes</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Configuración del sistema y licencia</p>

      {/* Información de licencia actual */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        padding: 20,
        marginBottom: 24,
        maxWidth: 500,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Licencia actual</h3>
        {status.plan ? (
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div><strong>Plan:</strong> {status.plan_name}</div>
            <div><strong>Clave:</strong> <code style={{ fontSize: 12 }}>{status.key}</code></div>
            <div><strong>Productos:</strong> {status.products_used}/{status.products_max}</div>
            {status.expires_at && <div><strong>Vence:</strong> {status.expires_at}</div>}
            {status.days_left > 0 && status.trial && (
              <div><strong>Días restantes:</strong> {status.days_left}</div>
            )}
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                background: status.active ? 'var(--success)' : 'var(--danger)',
                color: '#fff',
              }}>
                {status.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)' }}>Sin licencia activa</div>
        )}
      </div>

      {/* Activar licencia */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        padding: 20,
        maxWidth: 500,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Activar licencia</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Ingresá la clave de licencia que recibiste al adquirir el sistema.
        </p>
        <input
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          placeholder="TST-XXXX-XXXX-XXXX-XXXX"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'monospace',
            marginBottom: 12,
          }}
        />
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="Tu nombre o negocio (opcional)"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: 14,
            marginBottom: 16,
          }}
        />
        <button
          onClick={handleActivate}
          disabled={submitting || !keyInput.trim()}
          style={{
            padding: '10px 24px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: submitting || !keyInput.trim() ? 'not-allowed' : 'pointer',
            opacity: submitting || !keyInput.trim() ? 0.6 : 1,
          }}
        >
          {submitting ? 'Activando...' : 'Activar licencia'}
        </button>
      </div>
    </div>
  )
}
