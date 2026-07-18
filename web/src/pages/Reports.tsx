import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, DailyReport } from '../api/client'
import { useLicense } from '../hooks/useLicense'
import MaterialIcon from '../components/ui/MaterialIcon'

const TOKEN = 'tustock-local-token'
const tokenQs = `token=${TOKEN}`

function exportUrl(path: string) {
  return `/api${path}${path.includes('?') ? '&' : '?'}${tokenQs}`
}

function downloadExport(path: string) {
  window.open(exportUrl(path), '_blank')
}

function UpgradeBlock({ feature }: { feature: string }) {
  return (
    <div style={{
      padding: 60, textAlign: 'center',
      background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(66,71,84,0.5)',
    }}>
      <MaterialIcon name={feature === 'export' ? 'file_download_off' : 'bar_chart_off'} size={48} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
      <p style={{ marginBottom: 8, color: 'var(--on-surface-variant)' }}>
        {feature === 'export' ? 'Exportación no disponible' : 'Informes no disponibles'} en tu plan actual.
      </p>
      <Link to="/upgrade" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
        Ver planes disponibles &rarr;
      </Link>
    </div>
  )
}

function sectionTitle(title: string): React.CSSProperties {
  return { fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: '32px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 20 }
}

export default function Reports() {
  const { canUse } = useLicense()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const now = new Date()
  const [rngStart, setRngStart] = useState(`${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`)
  const [rngEnd, setRngEnd] = useState(now.toISOString().slice(0, 10))
  const [myMonth, setMyMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [fmt, setFmt] = useState<'csv' | 'xlsx'>('csv')

  const loadReport = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get<DailyReport>(`/reports/daily/${date}`)
      setReport(data)
    } catch {
      setError(`No hay reporte para ${date}. ¿Generarlo ahora?`)
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.post<DailyReport>(`/reports/daily/${date}`)
      setReport(data)
    } catch (e: any) {
      setError('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--outline)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)',
        }}>
          <span>INFORMES</span>
          <MaterialIcon name="chevron_right" size={12} />
          <span style={{ color: 'var(--primary-fixed-dim)' }}>DIARIOS</span>
        </nav>
        <h2 style={{
          fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px',
          fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)',
        }}>Informes diarios</h2>
      </div>

      {!canUse('reports') ? <UpgradeBlock feature="reports" /> : (
        <>
          <div style={{
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
            marginBottom: 'var(--space-lg)',
            border: '1px solid rgba(66,71,84,0.5)',
            display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap',
          }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 4 }}>Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ padding: '10px 14px' }} />
            </div>
            <button onClick={loadReport} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700, height: 42,
            }}>
              <MaterialIcon name="search" size={18} />
              Ver informe
            </button>
            <button onClick={generateReport} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--success)', color: 'var(--bg)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700, height: 42,
            }}>
              <MaterialIcon name="refresh" size={18} />
              Generar / Re-generar
            </button>
          </div>

          {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>}

          {error && (
            <div style={{
              background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 40,
              marginBottom: 'var(--space-lg)', textAlign: 'center',
              border: '1px solid rgba(255,183,134,0.3)',
            }}>
              <MaterialIcon name="error_outline" size={32} color="var(--tertiary)" style={{ marginBottom: 8 }} />
              <p style={{ color: 'var(--tertiary)', marginBottom: 8 }}>{error}</p>
              {error.includes('Generarlo') && (
                <button onClick={generateReport} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)',
                  background: 'var(--success)', color: 'var(--bg)',
                  paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
                  paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
                  borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
                }}>
                  <MaterialIcon name="add" size={18} />
                  Generar informe ahora
                </button>
              )}
            </div>
          )}

          {report && (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
                marginBottom: 'var(--space-lg)'
              }}>
                <StatCard label="Ventas totales" value={`$${report.total_sales.toLocaleString()}`} icon="payments" color="var(--primary)" />
                <StatCard label="Transacciones" value={report.total_transactions} icon="receipt" color="var(--secondary)" />
                <StatCard label="Artículos vendidos" value={report.total_items_sold} icon="inventory_2" color="var(--tertiary)" />
                <StatCard label="Descuentos" value={`$${report.discounts.toLocaleString()}`} icon="money_off" color="var(--error)" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                <div style={{
                  background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)',
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MaterialIcon name="account_balance" size={20} />
                    Por método de pago
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <MethodBar label="Efectivo" value={report.cash_sales} total={report.total_sales} color="var(--success)" />
                    <MethodBar label="Tarjeta" value={report.card_sales} total={report.total_sales} color="var(--primary)" />
                    <MethodBar label="Otros" value={report.other_sales} total={report.total_sales} color="var(--tertiary)" />
                  </div>
                </div>

                <div style={{
                  background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)',
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MaterialIcon name="leaderboard" size={20} />
                    Top productos
                  </h3>
                  {report.top_items?.length === 0 ? (
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>Sin ventas registradas</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.3)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }}>Producto</th>
                          <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }}>Cant.</th>
                          <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--outline)' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.top_items.map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                            <td style={{ padding: '8px 0', fontSize: 13 }}>{item.name}</td>
                            <td style={{ padding: '8px 0', fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-data)' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 0', fontSize: 13, textAlign: 'right', fontWeight: 600, color: 'var(--success)', fontFamily: 'var(--font-data)' }}>
                              ${item.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--on-surface-variant)' }}>
                Generado: {report.generated_at}
              </div>
            </div>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(66,71,84,0.3)', margin: '32px 0' }} />

          <h2 style={sectionTitle('Exportar reportes')} />

          {!canUse('export') ? <UpgradeBlock feature="export" /> : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>Formato:</span>
                <button onClick={() => setFmt('csv')} style={{
                  padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                  border: fmt === 'csv' ? '2px solid var(--primary)' : '1px solid rgba(66,71,84,0.5)',
                  background: fmt === 'csv' ? 'var(--primary-container)' : 'transparent',
                  color: fmt === 'csv' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                  fontWeight: 700, fontSize: 13, transition: 'all var(--transition)',
                }}>CSV</button>
                <button onClick={() => setFmt('xlsx')} style={{
                  padding: '6px 16px', borderRadius: 6, cursor: 'pointer',
                  border: fmt === 'xlsx' ? '2px solid var(--primary)' : '1px solid rgba(66,71,84,0.5)',
                  background: fmt === 'xlsx' ? 'var(--primary-container)' : 'transparent',
                  color: fmt === 'xlsx' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                  fontWeight: 700, fontSize: 13,
                }}>Excel</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ExportSection title="Ventas por período" icon="point_of_sale" fields={
                  <><FilterGroup label="Desde" value={rngStart} onChange={setRngStart} /><FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} /></>
                } onExport={() => downloadExport(`/reports/export/sales?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

                <ExportSection title="Productos vendidos" icon="inventory" fields={
                  <><FilterGroup label="Desde" value={rngStart} onChange={setRngStart} /><FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} /></>
                } onExport={() => downloadExport(`/reports/export/products?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

                <ExportSection title="Vendedores" icon="badge" fields={
                  <><FilterGroup label="Desde" value={rngStart} onChange={setRngStart} /><FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} /></>
                } onExport={() => downloadExport(`/reports/export/vendors?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

                <ExportSection title="Resumen mensual" icon="calendar_month" fields={
                  <FilterGroup label="Mes" value={myMonth} onChange={v => setMyMonth(v)} type="month" />
                } onExport={() => { const [y, m] = myMonth.split('-'); downloadExport(`/reports/export/monthly?year=${y}&month=${parseInt(m)}&format=${fmt}`); }} />
              </div>

              <div style={{
                marginTop: 24, padding: 16, background: 'var(--surface-container)',
                borderRadius: 'var(--radius-lg)', border: '1px solid rgba(66,71,84,0.3)'
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MaterialIcon name="info" size={18} />
                  Para el contador
                </h3>
                <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                  Exportá los reportes de cada mes en Excel con los botones de arriba. El resumen mensual
                  incluye total facturado, cantidad de ventas, método de pago,
                  costo de mercadería vendida y ganancia bruta.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
      padding: 20, border: '1px solid rgba(66,71,84,0.5)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: 16, opacity: 0.2 }}>
        <MaterialIcon name={icon} size={40} color={color} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'var(--font-data)' }}>{value}</div>
    </div>
  )
}

function MethodBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, fontFamily: 'var(--font-data)' }}>${value.toLocaleString()} ({pct.toFixed(0)}%)</span>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function FilterGroup({ label, value, onChange, type = 'date' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 2 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ padding: '8px 10px', width: '100%', boxSizing: 'border-box' }} />
    </div>
  )
}

function ExportSection({ title, icon, fields, onExport }: { title: string; icon: string; fields: React.ReactNode; onExport: () => void }) {
  return (
    <div style={{
      background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)',
    }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <MaterialIcon name={icon} size={18} />
        {title}
      </h3>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {fields}
        <button onClick={onExport} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          background: 'var(--primary-container)', color: 'var(--on-primary-container)',
          paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
          paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
          borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
        }}>
          <MaterialIcon name="download" size={18} />
          Exportar
        </button>
      </div>
    </div>
  )
}
