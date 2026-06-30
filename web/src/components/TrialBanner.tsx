import { useLicense } from '../hooks/useLicense'

export default function TrialBanner() {
  const { status } = useLicense()
  const { trial, expired, days_left, upgrade_message, plan_name } = status

  if (!trial && plan_name) return null

  const bg = expired ? 'var(--danger)' : 'var(--warning)'
  const color = expired ? '#fff' : '#000'
  const msg = expired
    ? 'Período de prueba expirado. Ingresá una licencia en Ajustes para seguir usando el sistema.'
    : `Modo ${plan_name} — Te quedan ${days_left} días · ${status.products_used}/${status.products_max} productos usados`

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
      <a href="/upgrade" style={{
        color: color,
        textDecoration: 'underline',
        fontWeight: 700,
        marginLeft: 16,
        whiteSpace: 'nowrap',
      }}>Ver planes</a>
    </div>
  )
}
