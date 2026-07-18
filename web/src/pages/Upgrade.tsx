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
    notIncluded: [],
  },
]

export default function Upgrade() {
  const { status } = useLicense()

  if (status.plan === 'pro' || status.plan === 'suscripcion' || status.plan === 'premium' || status.plan === 'basico') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-full)', background: 'rgba(80,216,144,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--success)' }}>verified</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 28, lineHeight: '36px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>Licencia activa</h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 8 }}>
            Plan <strong style={{ color: 'var(--primary)' }}>{status.plan_name}</strong>
          </p>
          <code style={{ fontSize: 12, color: 'var(--outline)', background: 'var(--surface-container)', padding: '4px 8px', borderRadius: 4 }}>{status.key}</code>
        </div>
        <div style={{ background: 'rgba(80,216,144,0.1)', color: 'var(--success)', padding: 16, borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
          Todas las funciones están habilitadas.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>
          <span>CONFIGURACIÓN</span>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>chevron_right</span>
          <span style={{ color: 'var(--primary-fixed-dim)' }}>PLANES</span>
        </nav>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
          Elegí un plan
        </h2>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 8, fontSize: 14 }}>
          {status.trial
            ? 'Estás en modo Trial. Elegí un plan para desbloquear todas las funciones.'
            : 'Adquirí una licencia para activar el sistema.'}
        </p>
      </div>

      {status.trial && (
        <div style={{ background: 'rgba(255,183,134,0.1)', color: 'var(--tertiary)', padding: 16, borderRadius: 12, fontSize: 13, marginBottom: 24, border: '1px solid rgba(255,183,134,0.2)' }}>
          {status.days_left > 0
            ? <span>Te quedan <strong>{status.days_left} días</strong> de prueba. Productos: {status.products_used}/{status.products_max}.</span>
            : 'Período de prueba expirado.'}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {plans.map(p => (
          <div key={p.name} style={{
            flex: '1 1 280px',
            background: 'var(--surface-container)',
            borderRadius: 16,
            border: p.highlight ? '2px solid var(--primary-container)' : '1px solid rgba(66,71,84,0.5)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {p.highlight && (
              <span style={{
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                alignSelf: 'flex-start',
                marginBottom: 12,
              }}>
                RECOMENDADO
              </span>
            )}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>{p.name}</h3>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, lineHeight: '36px', fontWeight: 700, color: 'var(--on-surface)', marginTop: 4 }}>{p.price}</div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 16 }}>{p.mode}</div>

            <div style={{ flex: 1 }}>
              {p.features.map(f => (
                <div key={f} style={{ fontSize: 13, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--success)' }}>check_circle</span>
                  {f}
                </div>
              ))}
              {p.notIncluded.map(f => (
                <div key={f} style={{ fontSize: 13, padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--outline)' }}>cancel</span>
                  {f}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              padding: 12,
              background: 'var(--surface-container-low)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--on-surface-variant)',
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
