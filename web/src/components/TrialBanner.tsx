import { Link } from 'react-router-dom'
import { useLicense } from '../hooks/useLicense'
import MaterialIcon from './ui/MaterialIcon'

export default function TrialBanner() {
  const { status } = useLicense()
  const { trial, expired, days_left, plan_name } = status

  if (!trial && plan_name) return null

  const expiredMode = expired

  return (
    <div style={{
      background: expiredMode ? 'var(--error-container)' : 'rgba(255, 183, 134, 0.1)',
      color: expiredMode ? 'var(--error)' : 'var(--tertiary)',
      padding: '8px 20px',
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: expiredMode ? '1px solid rgba(255, 180, 171, 0.2)' : '1px solid rgba(255, 183, 134, 0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MaterialIcon name={expiredMode ? 'error' : 'info'} size={20} />
        <span>
          {expiredMode
            ? 'Período de prueba expirado. Ingresá una licencia en Ajustes para seguir usando el sistema.'
            : `Modo ${plan_name} — Te quedan ${days_left} días · ${status.products_used}/${status.products_max} productos usados`
          }
        </span>
      </div>
      <Link to="/upgrade" style={{
        color: expiredMode ? 'var(--error)' : 'var(--tertiary)',
        textDecoration: 'underline',
        fontWeight: 700,
        marginLeft: 16,
        whiteSpace: 'nowrap',
        fontSize: 12,
      }}>Ver planes</Link>
    </div>
  )
}
