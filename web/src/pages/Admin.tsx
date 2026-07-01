import { useState, useEffect, useCallback } from 'react'

const TOKEN_KEY = 'tustock_admin_token'

interface License {
  id: number
  key: string
  plan: string
  customer_name: string
  active: boolean
  expires_at: string | null
  created_at: string | null
  last_validated_at: string | null
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [auth, setAuth] = useState(!!token)
  const [licenses, setLicenses] = useState<License[]>([])
  const [stats, setStats] = useState<any>(null)
  const [form, setForm] = useState({ plan: 'basico', customer_name: '', expires_at: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginToken, setLoginToken] = useState('')

  const headers = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchData = useCallback(async () => {
    if (!token) return
    try {
      const [lic, st] = await Promise.all([
        fetch('/api/admin/licenses', { headers: headers() }),
        fetch('/api/admin/stats', { headers: headers() }),
      ])
      if (lic.status === 401) { sessionStorage.removeItem(TOKEN_KEY); setAuth(false); return }
      setLicenses((await lic.json()).licenses)
      setStats(await st.json())
    } catch { }
  }, [token])

  useEffect(() => { if (auth) fetchData() }, [auth, fetchData])

  function doLogin() {
    if (loginToken.length < 4) return
    sessionStorage.setItem(TOKEN_KEY, loginToken)
    setToken(loginToken)
    setAuth(true)
    setLoginToken('')
  }

  async function generate() {
    setLoading(true)
    setMessage('')
    try {
      const r = await fetch('/api/admin/generate', { method: 'POST', headers: headers(), body: JSON.stringify(form) })
      const d = await r.json()
      if (d.ok) {
        setMessage(`Licencia generada: ${d.key} (${d.plan})`)
        setForm({ plan: 'basico', customer_name: '', expires_at: '' })
        fetchData()
      } else {
        setMessage(d.detail || 'Error')
      }
    } catch { setMessage('Error de conexión') }
    setLoading(false)
  }

  async function toggleActive(key: string, activate: boolean) {
    const endpoint = activate ? 'activate' : 'revoke'
    try {
      await fetch(`/api/admin/${endpoint}/${key}`, { method: 'POST', headers: headers() })
      fetchData()
    } catch { }
  }

  if (!auth) {
    return (
      <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
        <h2 style={{ marginBottom: 8 }}>Admin TUSTOCK</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>Ingresá el token de administrador</p>
        <input
          type="password"
          value={loginToken}
          onChange={e => setLoginToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin()}
          placeholder="Token admin"
          style={{ width: '100%', padding: 10, border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, marginBottom: 8 }}
          autoFocus
        />
        <button
          onClick={doLogin}
          style={{ width: '100%', padding: 10, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >Ingresar</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Admin — Licencias</h2>
        <button onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setAuth(false) }}
          style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
        >Salir</button>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 140 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Activas</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{stats.active}</div>
          </div>
          {Object.entries(stats.by_plan || {}).map(([plan, count]: [string, any]) => (
            <div key={plan} style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 100 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{plan}</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{count}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Generar licencia</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Plan</label>
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
              style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}>
              <option value="basico">Básico ($80K único)</option>
              <option value="suscripcion">Suscripción ($8K/mes)</option>
              <option value="pro">Pro ($160K único)</option>
              <option value="trial">Trial (30 días)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Cliente</label>
            <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
              placeholder="Nombre del negocio"
              style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, width: 180 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Vence (opcional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
              style={{ padding: 8, border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }} />
          </div>
          <button onClick={generate} disabled={loading}
            style={{ padding: '8px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', height: 36 }}>
            {loading ? '...' : 'Generar'}
          </button>
        </div>
        {message && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: message.includes('Error') ? 'var(--danger)' : 'var(--success)', color: '#fff', borderRadius: 6, fontSize: 13 }}>
            {message}
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Licencias ({licenses.length})</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plan</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Creada</th>
              <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 12 }}>{l.key}</td>
                <td style={{ padding: '8px 6px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: l.plan === 'trial' ? 'var(--warning)' : l.plan === 'pro' ? '#dbeafe' : l.plan === 'premium' ? '#fce7f3' : 'var(--success)',
                    color: '#000' }}>
                    {l.plan}
                  </span>
                </td>
                <td style={{ padding: '8px 6px' }}>{l.customer_name || '-'}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: l.active ? 'var(--success)' : 'var(--danger)',
                    marginRight: 4,
                  }} />
                  {l.active ? 'Activa' : 'Inactiva'}
                </td>
                <td style={{ padding: '8px 6px', fontSize: 12, color: 'var(--text-muted)' }}>
                  {l.created_at ? new Date(l.created_at).toLocaleDateString('es-AR') : '-'}
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleActive(l.key, !l.active)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: l.active ? 'var(--danger)' : 'var(--success)',
                      color: '#fff',
                      border: 'none',
                    }}>
                    {l.active ? 'Revocar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No hay licencias</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, padding: 12, background: 'var(--surface)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Token admin: <code>{token.substring(0, 4)}****</code> — Configurado en config.py como TUSTOCK_ADMIN_TOKEN
      </div>
    </div>
  )
}
