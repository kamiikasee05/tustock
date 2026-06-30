import { useState } from 'react'
import { api, DailyReport } from '../api/client'
import { useLicense } from '../hooks/useLicense'

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
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <p style={{ marginBottom: 8 }}>{feature === 'export' ? 'Exportación' : 'Informes'} no disponible en tu plan actual.</p>
      <a href="/upgrade" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Ver planes disponibles →</a>
    </div>
  )
}

export default function Reports() {
  const { canUse, status } = useLicense()
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const now = new Date()
  const [rngStart, setRngStart] = useState(`${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}-01`)
  const [rngEnd, setRngEnd] = useState(now.toISOString().slice(0, 10))
  const [myMonth, setMyMonth] = useState(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`)
  const [fmt, setFmt] = useState<'csv'|'xlsx'>('csv')

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
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Informes Diarios</h2>

      {!canUse('reports') ? <UpgradeBlock feature="reports" /> : (
      <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'flex-end' }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fecha</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 14px' }} />
        </div>
        <button onClick={loadReport} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Ver informe
        </button>
        <button onClick={generateReport} style={{ padding: '10px 20px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
          Generar / Re-generar
        </button>
      </div>

      {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>}
      {error && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 20, textAlign: 'center', border: '1px solid var(--warning)' }}>
          <p style={{ color: 'var(--warning)' }}>{error}</p>
          {error.includes('Generarlo') && (
            <button onClick={generateReport} style={{ marginTop: 12, padding: '10px 20px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              Generar informe ahora
            </button>
          )}
        </div>
      )}

      {report && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Total ventas" value={`$${report.total_sales.toLocaleString()}`} color="var(--primary)" />
            <StatCard label="Transacciones" value={report.total_transactions} color="var(--success)" />
            <StatCard label="Artículos vendidos" value={report.total_items_sold} color="var(--warning)" />
            <StatCard label="Descuentos" value={`$${report.discounts.toLocaleString()}`} color="var(--danger)" />
            <StatCard label="Ticket promedio" value={`$${report.total_transactions > 0 ? (report.total_sales / report.total_transactions).toFixed(2) : '0.00'}`} color="var(--text)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Por método de pago</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <MethodBar label="Efectivo" value={report.cash_sales} total={report.total_sales} color="var(--success)" />
                <MethodBar label="Tarjeta" value={report.card_sales} total={report.total_sales} color="var(--primary)" />
                <MethodBar label="Otros" value={report.other_sales} total={report.total_sales} color="var(--warning)" />
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Top productos</h3>
              {report.top_items?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sin ventas registradas</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Producto</th>
                      <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Cant.</th>
                      <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.top_items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 0', fontSize: 13 }}>{item.name}</td>
                        <td style={{ padding: '8px 0', fontSize: 13, textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px 0', fontSize: 13, textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                          ${item.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
            Generado: {report.generated_at}
          </div>
        </div>
      )}
      </>)}
      {canUse('reports') && (<hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--border)' }} />)}

      {!canUse('export') ? <UpgradeBlock feature="export" /> : (
      <>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Exportar Reportes</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Formato:</span>
        <button onClick={() => setFmt('csv')} style={{ padding: '6px 16px', borderRadius: 6, border: fmt==='csv' ? '2px solid var(--primary)' : '1px solid var(--border)', background: fmt==='csv' ? 'var(--primary)' : 'var(--surface)', color: fmt==='csv' ? 'white' : 'var(--text)', fontWeight: 600, fontSize: 13 }}>CSV</button>
        <button onClick={() => setFmt('xlsx')} style={{ padding: '6px 16px', borderRadius: 6, border: fmt==='xlsx' ? '2px solid var(--primary)' : '1px solid var(--border)', background: fmt==='xlsx' ? 'var(--primary)' : 'var(--surface)', color: fmt==='xlsx' ? 'white' : 'var(--text)', fontWeight: 600, fontSize: 13 }}>Excel</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ExportSection title="Ventas por período" fields={
          <>
            <FilterGroup label="Desde" value={rngStart} onChange={setRngStart} />
            <FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} />
          </>
        } onExport={() => downloadExport(`/reports/export/sales?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

        <ExportSection title="Productos vendidos" fields={
          <>
            <FilterGroup label="Desde" value={rngStart} onChange={setRngStart} />
            <FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} />
          </>
        } onExport={() => downloadExport(`/reports/export/products?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

        <ExportSection title="Vendedores" fields={
          <>
            <FilterGroup label="Desde" value={rngStart} onChange={setRngStart} />
            <FilterGroup label="Hasta" value={rngEnd} onChange={setRngEnd} />
          </>
        } onExport={() => downloadExport(`/reports/export/vendors?start=${rngStart}&end=${rngEnd}&format=${fmt}`)} />

        <ExportSection title="Resumen Mensual" fields={
          <FilterGroup label="Mes" value={myMonth} onChange={v => setMyMonth(v)} type="month" />
        } onExport={() => {
          const [y, m] = myMonth.split('-')
          downloadExport(`/reports/export/monthly?year=${y}&month=${parseInt(m)}&format=${fmt}`)
        }} />
      </div>

      <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Para el contador</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Exportá los reportes de cada mes en Excel con los botones de arriba.
          El resumen mensual incluye: total facturado, cantidad de ventas, método de pago (efectivo/tarjeta),
          costo de mercadería vendida y ganancia bruta. 
          Exportá también el detalle de ventas para que el contador concilie contra los comprobantes emitidos.
        </p>
      </div>
      </>)}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}

function MethodBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>${value.toLocaleString()} ({pct.toFixed(0)}%)</span>
      </div>
      <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: 4 }} />
      </div>
    </div>
  )
}

function FilterGroup({ label, value, onChange, type = 'date' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ padding: '8px 10px', width: '100%', boxSizing: 'border-box' }} />
    </div>
  )
}

function ExportSection({ title, fields, onExport }: { title: string; fields: React.ReactNode; onExport: () => void }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{title}</h3>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {fields}
        <button onClick={onExport} style={{ padding: '8px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
          Exportar
        </button>
      </div>
    </div>
  )
}
