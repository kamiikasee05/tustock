import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface Customer {
  id: number
  name: string
  dni: string | null
  phone: string | null
  balance: number
  total_debts: number
  total_payments: number
  is_active: boolean
}

interface Transaction {
  id: number
  type: string
  amount: number
  sale_id: number | null
  notes: string | null
  created_at: string
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentAmount, setPaymentAmount] = useState('')

  const [form, setForm] = useState({ name: '', dni: '', phone: '', notes: '' })

  const load = async () => {
    try {
      const data = await api.get<Customer[]>('/customers?include_inactive=true')
      setCustomers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createCustomer = async () => {
    await api.post('/customers', form)
    setForm({ name: '', dni: '', phone: '', notes: '' })
    setShowForm(false)
    load()
  }

  const registerPayment = async () => {
    if (!selected || !paymentAmount) return
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return
    await api.post('/customers/payment', { customer_id: selected.id, amount, notes: 'Pago registrado' })
    setPaymentAmount('')
    loadTx(selected.id)
    load()
  }

  const loadTx = async (customerId: number) => {
    const data = await api.get<Transaction[]>(`/customers/${customerId}/transactions`)
    setTransactions(data)
  }

  const selectCustomer = (c: Customer) => {
    setSelected(c)
    setPaymentAmount('')
    loadTx(c.id)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>

  if (selected) {
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}>
          ← Volver
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
          <div>
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, border: '1px solid var(--border)', marginBottom: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{selected.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                {selected.dni && `DNI: ${selected.dni}`}{selected.dni && selected.phone && ' · '}{selected.phone && `Tel: ${selected.phone}`}
              </p>
              <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Saldo actual</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: selected.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    ${selected.balance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total fiado</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--danger)' }}>${selected.total_debts.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total pagado</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--success)' }}>${selected.total_payments.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Movimientos</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                          background: tx.type === 'debt' ? 'var(--danger)' : 'var(--success)',
                          color: 'white',
                        }}>
                          {tx.type === 'debt' ? 'FIADO' : 'PAGO'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)' }}>{tx.notes || '-'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', color: 'var(--text-muted)' }}>
                        {new Date(tx.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 14, textAlign: 'right', fontWeight: 600,
                        color: tx.type === 'debt' ? 'var(--danger)' : 'var(--success)',
                      }}>
                        {tx.type === 'debt' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Sin movimientos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Registrar pago</h3>
            <input
              type="number"
              placeholder="Monto del pago"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', marginBottom: 8 }}
              onKeyDown={e => { if (e.key === 'Enter') registerPayment() }}
            />
            <button onClick={registerPayment} style={{
              width: '100%', padding: '12px', background: 'var(--success)', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
            }}>
              Registrar pago
            </button>

            {selected.balance > 0 && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                <div style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: 4 }}>Adeuda</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>${selected.balance.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Clientes</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
        }}>
          + Nuevo cliente
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nombre *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>DNI</label>
            <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Teléfono</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={createCustomer} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>Crear</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: 'var(--border)', color: 'var(--text)', border: 'none', borderRadius: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
              <th style={th}>Cliente</th>
              <th style={th}>DNI</th>
              <th style={{ ...th, textAlign: 'right' }}>Adeuda</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} onClick={() => selectCustomer(c)} style={{
                borderBottom: '1px solid var(--border)', cursor: 'pointer',
                opacity: c.is_active ? 1 : 0.5,
              }}>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.dni || '-'}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: c.balance > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ${c.balance.toLocaleString()}
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: c.balance > 0 ? 'var(--danger)' : 'var(--success)',
                    color: 'white',
                  }}>
                    {c.balance > 0 ? 'Adeuda' : 'Al día'}
                  </span>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No hay clientes registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14 }
