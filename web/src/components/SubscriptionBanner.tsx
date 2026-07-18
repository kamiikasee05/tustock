import { Link } from 'react-router-dom'
import { useLicense } from '../hooks/useLicense'
import MaterialIcon from './ui/MaterialIcon'

export default function SubscriptionBanner() {
  const { status } = useLicense()
  const { plan, subscription_grace_days_left, subscription_suspended } = status

  if (plan !== 'suscripcion' && plan !== 'premium') return null
  if (!subscription_grace_days_left && !subscription_suspended) return null

  const suspended = subscription_suspended
  const critical = !suspended && subscription_grace_days_left !== null && subscription_grace_days_left <= 3

  let msg = ''
  if (suspended) {
    msg = 'Suscripción suspendida. Tus datos están seguros, pero perdiste acceso a actualizaciones y soporte. Contactanos para reactivar.'
  } else if (critical) {
    msg = `Te quedan ${subscription_grace_days_left} días para regularizar tu suscripción. Si no, se suspenden las actualizaciones y el soporte.`
  } else {
    msg = `Hubo un problema con el pago de tu suscripción. Tenés ${subscription_grace_days_left} días para regularizar sin perder funciones.`
  }

  return (
    <div style={{
      background: suspended ? 'var(--error-container)' : critical ? 'rgba(255,183,134,0.15)' : 'rgba(255,183,134,0.08)',
      color: suspended ? 'var(--error)' : 'var(--tertiary)',
      padding: '8px 20px',
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${suspended ? 'rgba(255,180,171,0.2)' : 'rgba(255,183,134,0.15)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MaterialIcon name={suspended ? 'error' : 'payment'} size={20} />
        <span>{msg}</span>
      </div>
      <Link to="/settings" style={{
        color: suspended ? 'var(--error)' : 'var(--tertiary)',
        textDecoration: 'underline',
        fontWeight: 700,
        marginLeft: 16,
        whiteSpace: 'nowrap',
        fontSize: 12,
      }}>Regularizar</Link>
    </div>
  )
}
