import { useLicense } from '../hooks/useLicense'

export default function SubscriptionBanner() {
  const { status } = useLicense()
  const { plan, subscription_grace_days_left, subscription_suspended } = status

  if (plan !== 'suscripcion' && plan !== 'premium') return null
  if (!subscription_grace_days_left && !subscription_suspended) return null

  let bg = 'var(--warning)'
  let color = '#000'
  let msg = ''

  if (subscription_suspended) {
    bg = 'var(--danger)'
    color = '#fff'
    msg = 'Suscripción suspendida. Tus datos están seguros, pero perdiste acceso a actualizaciones y soporte. Contactanos para reactivar.'
  } else if (subscription_grace_days_left !== null && subscription_grace_days_left <= 3) {
    bg = 'var(--warning)'
    color = '#000'
    msg = `Te quedan ${subscription_grace_days_left} días para regularizar tu suscripción. Si no, se suspenden las actualizaciones y el soporte.`
  } else {
    msg = `Hubo un problema con el pago de tu suscripción. Tenés ${subscription_grace_days_left} días para regularizar sin perder funciones.`
  }

  return (
    <div style={{
      background: bg,
      color,
      padding: '10px 20px',
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span>{msg}</span>
      <a href="/settings" style={{
        color,
        textDecoration: 'underline',
        fontWeight: 700,
        marginLeft: 16,
        whiteSpace: 'nowrap',
      }}>Regularizar</a>
    </div>
  )
}
