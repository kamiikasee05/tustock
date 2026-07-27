import { useState, useEffect } from 'react'
import { api } from '../api/client'
import MaterialIcon from '../components/ui/MaterialIcon'

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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>Cargando...</div>

  if (selected) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <button onClick={() => setSelected(null)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
          color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginBottom: 'var(--space-lg)',
          cursor: 'pointer', background: 'none', border: 'none',
        }}>
          <MaterialIcon name="arrow_back" size={20} />
          Volver
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-lg)' }}>
          <div>
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
              border: '1px solid rgba(66,71,84,0.5)', marginBottom: 'var(--space-lg)',
            }}>
              <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: '32px', fontWeight: 700, color: 'var(--on-surface)', marginBottom: 'var(--space-xs)' }}>
                {selected.name}
              </h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 'var(--space-md)' }}>
                {selected.dni && `DNI: ${selected.dni}`}{selected.dni && selected.phone && ' · '}{selected.phone && `Tel: ${selected.phone}`}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                <div style={{
                  background: 'var(--surface-container-low)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius)',
                  flex: 1,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: selected.balance > 0 ? 'var(--error)' : 'var(--success)', marginBottom: 'var(--space-xs)' }}>
                    Saldo actual
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, lineHeight: '36px', fontWeight: 700, color: selected.balance > 0 ? 'var(--error)' : 'var(--success)' }}>
                    ${selected.balance.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  background: 'var(--surface-container-low)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius)',
                  flex: 1,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-xs)' }}>
                    Total fiado
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 18, lineHeight: '24px', fontWeight: 600, color: 'var(--error)' }}>
                    ${selected.total_debts.toLocaleString()}
                  </div>
                </div>
                <div style={{
                  background: 'var(--surface-container-low)',
                  padding: 'var(--space-md)',
                  borderRadius: 'var(--radius)',
                  flex: 1,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 'var(--space-xs)' }}>
                    Total pagado
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 18, lineHeight: '24px', fontWeight: 600, color: 'var(--success)' }}>
                    ${selected.total_payments.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(66,71,84,0.3)', overflow: 'hidden',
            }}>
              <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                borderBottom: '1px solid rgba(66,71,84,0.3)',
                fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              }}>
                <MaterialIcon name="receipt_long" size={20} />
                Movimientos
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>
                        <span style={{
                          paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                          paddingTop: 2, paddingBottom: 2,
                          borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700,
                          background: tx.type === 'debt' ? 'var(--error-container)' : 'rgba(80,216,144,0.15)',
                          color: tx.type === 'debt' ? 'var(--error)' : 'var(--success)',
                        }}>
                          {tx.type === 'debt' ? 'FIADO' : 'PAGO'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--on-surface-variant)' }}>{tx.notes || '-'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', color: 'var(--on-surface-variant)' }}>
                        {new Date(tx.created_at).toLocaleDateString('es-AR')}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 14, textAlign: 'right', fontWeight: 600,
                        fontFamily: 'var(--font-data)',
                        color: tx.type === 'debt' ? 'var(--error)' : 'var(--success)',
                      }}>
                        {tx.type === 'debt' ? '-' : '+'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 30, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                      <MaterialIcon name="receipt_long" size={32} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                      Sin movimientos
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
              border: '1px solid rgba(66,71,84,0.3)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <MaterialIcon name="payments" size={20} />
                Registrar pago
              </h3>
              <input
                type="number"
                step="0.01"
                placeholder="Monto del pago"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', marginBottom: 'var(--space-sm)', boxSizing: 'border-box' }}
                onKeyDown={e => { if (e.key === 'Enter') registerPayment() }}
              />
              <button onClick={registerPayment} style={{
                width: '100%', padding: '12px',
                background: 'var(--success)', color: 'var(--bg)',
                border: 'none', borderRadius: 'var(--radius)', fontWeight: 700,
                cursor: 'pointer', fontSize: 14,
              }}>
                Registrar pago
              </button>

              {selected.balance > 0 && (
                <div style={{
                  marginTop: 'var(--space-lg)',
                  padding: 'var(--space-md)',
                  background: 'var(--surface-container-low)',
                  borderRadius: 'var(--radius)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--tertiary)', marginBottom: 4 }}>
                    Adeuda
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 24, fontWeight: 700, color: 'var(--error)' }}>
                    ${selected.balance.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)',
      }}>
        <div>
          <nav style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
            color: 'var(--outline)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)',
          }}>
            <span>VENTAS</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>CLIENTES</span>
          </nav>
          <h2 style={{
            fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px',
            fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)',
          }}>Clientes</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          background: 'var(--primary-container)', color: 'var(--on-primary-container)',
          paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
          paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
          borderRadius: 'var(--radius)', fontWeight: 700,
          boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
          transition: 'all var(--transition)',
        }}>
          <MaterialIcon name="person_add" />
          <span>Nuevo cliente</span>
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
          marginBottom: 'var(--space-lg)',
          border: '1px solid rgba(66,71,84,0.5)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Nombre *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>DNI</label>
            <input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Teléfono</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={createCustomer} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700,
            }}>
              <MaterialIcon name="check" size={18} />
              Crear
            </button>
            <button onClick={() => setShowForm(false)} style={{
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 500,
              background: 'var(--surface-container-highest)', color: 'var(--on-surface)',
              border: '1px solid var(--outline-variant)',
            }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(66,71,84,0.5)', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(66,71,84,0.5)', background: 'var(--surface-container-high)' }}>
              <th style={th}>Cliente</th>
              <th style={th}>DNI</th>
              <th style={{ ...th, textAlign: 'right' }}>Adeuda</th>
              <th style={{ ...th, textAlign: 'center' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} onClick={() => selectCustomer(c)} style={{
                borderBottom: '1px solid rgba(66,71,84,0.2)', cursor: 'pointer',
                opacity: c.is_active ? 1 : 0.5, transition: 'background var(--transition)',
              }}>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-full)',
                      background: 'var(--surface-container-highest)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MaterialIcon name="person" size={20} color="var(--on-surface-variant)" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                  </div>
                </td>
                <td style={td}>{c.dni || '-'}</td>
                <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-data)', fontWeight: 600, color: c.balance > 0 ? 'var(--error)' : 'var(--success)' }}>
                  ${c.balance.toLocaleString()}
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{
                    paddingLeft: 'var(--space-sm)', paddingRight: 'var(--space-sm)',
                    paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)',
                    borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                    background: c.balance > 0 ? 'rgba(255,180,171,0.1)' : 'rgba(80,216,144,0.1)',
                    color: c.balance > 0 ? 'var(--error)' : 'var(--success)',
                  }}>
                    {c.balance > 0 ? 'Adeuda' : 'Al día'}
                  </span>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                <MaterialIcon name="people" size={48} style={{ opacity: 0.3, marginBottom: 8, display: 'block', margin: '0 auto 12px' }} />
                No hay clientes registrados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
  paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-md)',
  fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
  textTransform: 'uppercase', color: 'var(--outline)', textAlign: 'left',
}
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--on-surface)' }
