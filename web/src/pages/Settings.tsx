import { useState } from 'react'
import { api } from '../api/client'
import { useLicense, LicenseStatus } from '../hooks/useLicense'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

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
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>
          <span>CONFIGURACIÓN</span>
          <MaterialIcon name="chevron_right" size={12} />
          <span style={{ color: 'var(--primary-fixed-dim)' }}>AJUSTES</span>
        </nav>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
          Ajustes
        </h2>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 4 }}>
          Configuración del sistema y licencia
        </p>
      </div>

      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(66,71,84,0.5)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)',
        maxWidth: 500,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaterialIcon name="key" size={20} />
          Licencia actual
        </h3>
        {status.plan ? (
          <div style={{ fontSize: 14, lineHeight: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Plan:</span>
              <span style={{ fontWeight: 600 }}>{status.plan_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Clave:</span>
              <code style={{ fontSize: 12 }}>{status.key}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--on-surface-variant)' }}>Productos:</span>
              <span>{status.products_used}/{status.products_max}</span>
            </div>
            {status.expires_at && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Vence:</span>
                <span>{status.expires_at}</span>
              </div>
            )}
            {status.days_left > 0 && status.trial && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Días restantes:</span>
                <span>{status.days_left}</span>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: status.active ? 'rgba(80,216,144,0.1)' : 'rgba(255,180,171,0.1)',
                color: status.active ? 'var(--success)' : 'var(--error)',
              }}>
                <MaterialIcon name={status.active ? 'check_circle' : 'cancel'} size={16} />
                {status.active ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--on-surface-variant)' }}>Sin licencia activa</div>
        )}
      </div>

      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(66,71,84,0.5)',
        padding: 'var(--space-lg)',
        maxWidth: 500,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaterialIcon name="vpn_key" size={20} />
          Activar licencia
        </h3>
        <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 16 }}>
          Ingresá la clave de licencia que recibiste al adquirir el sistema.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Clave de licencia</label>
          <input
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="TST-XXXX-XXXX-XXXX-XXXX"
            style={{
              width: '100%', padding: '10px 14px', boxSizing: 'border-box',
              fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.05em',
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Nombre o negocio</label>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="Tu nombre o negocio (opcional)"
            style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={handleActivate}
          disabled={submitting || !keyInput.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            padding: '10px 24px',
            background: submitting || !keyInput.trim() ? 'var(--surface-container-highest)' : 'var(--primary-container)',
            color: submitting || !keyInput.trim() ? 'var(--on-surface-variant)' : 'var(--on-primary-container)',
            border: 'none', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 700,
            cursor: submitting || !keyInput.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          <MaterialIcon name={submitting ? 'sync' : 'vpn_key'} size={20} />
          {submitting ? 'Activando...' : 'Activar licencia'}
        </button>
      </div>
    </div>
  )
}
