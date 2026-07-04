import { useLicense } from '../hooks/useLicense'

const plans = [
  {
    name: 'Básico',
    price: '$80.000',
    mode: 'Pago único',
    features: [
      'Sistema completo de stock y ventas',
      'App Android incluida',
      'Exportación a Excel',
      'Informes diarios',
      '1 año de actualizaciones',
      'Licencia perpetua',
    ],
    notIncluded: ['Monitor remoto', 'Soporte prioritario'],
  },
  {
    name: 'Suscripción',
    price: '$8.000/mes',
    mode: 'Mensual',
    features: [
      'Todo el sistema',
      'App Android incluida',
      'Actualizaciones continuas',
      'Soporte prioritario',
      'Monitor remoto desde el celular',
    ],
    notIncluded: [],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$160.000',
    mode: 'Pago único',
    features: [
      'Todo el sistema',
      'App Android incluida',
      '1 año de actualizaciones',
      'Monitor remoto desde el celular',
      'Exportación a Excel',
    ],
    notIncluded: ['Backup en la nube'],
  },
]

export default function Upgrade() {
  const { status } = useLicense()

  if (status.plan === 'pro' || status.plan === 'suscripcion' || status.plan === 'premium' || status.plan === 'basico') {
    return (
      <div>
        <h2 style={{ marginBottom: 8 }}>Licencia activa</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
          Plan <strong>{status.plan_name}</strong> — {status.key}
        </p>
        <div style={{ background: 'var(--success)', color: '#fff', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
          Todas las funciones están habilitadas.
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>Planes</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        {status.trial
          ? 'Estás en modo Trial. Elegí un plan para desbloquear todas las funciones.'
          : 'Adquirí una licencia para activar el sistema.'}
      </p>

      {status.trial && (
        <div style={{ background: 'var(--warning)', color: '#000', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
          {status.days_left > 0
            ? `Te quedan ${status.days_left} días de prueba. Productos: ${status.products_used}/${status.products_max}.`
            : 'Período de prueba expirado.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {plans.map(p => (
          <div key={p.name} style={{
            flex: '1 1 280px',
            background: 'var(--surface)',
            borderRadius: 16,
            border: p.highlight ? '2px solid var(--primary)' : '1px solid var(--border)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {p.highlight && (
              <span style={{
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}>RECOMENDADO</span>
            )}
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{p.name}</h3>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>{p.price}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{p.mode}</div>

            <div style={{ flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ fontSize: 13, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> {f}
                </div>
              ))}
              {p.notIncluded.map(f => (
                <div key={f} style={{ fontSize: 13, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                  <span>✗</span> {f}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: 12,
              background: 'var(--bg)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}>
              Para adquirir este plan, contactanos.
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
