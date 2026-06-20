import { useState } from 'react'
import { api, DailyReport } from '../api/client'

export default function Reports() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [report, setReport] = useState<DailyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
