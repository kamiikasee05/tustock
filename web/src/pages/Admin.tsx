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
  const auth = !!token
  const [licenses, setLicenses] = useState<License[]>([])
  const [stats, setStats] = useState<any>(null)
  const [form, setForm] = useState({ plan: 'basico', customer_name: '', expires_at: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginToken, setLoginToken] = useState('')
  const [copied, setCopied] = useState<{key: string, plan: string} | null>(null)
  const [loginError, setLoginError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const [actionError, setActionError] = useState('')

  const headers = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchData = useCallback(async () => {
    if (!token) return
    setFetchError('')
    try {
      const [lic, st] = await Promise.all([
        fetch('/api/admin/licenses', { headers: headers() }),
        fetch('/api/admin/stats', { headers: headers() }),
      ])
      if (lic.status === 401 || st.status === 401) { sessionStorage.removeItem(TOKEN_KEY); setToken(''); return }
      if (!lic.ok || !st.ok) throw new Error('')
      setLicenses((await lic.json()).licenses)
      setStats(await st.json())
    } catch {
      setFetchError('No se pudo conectar al servidor. Verificá que TUSTOCK esté corriendo.')
    }
  }, [token])

  useEffect(() => { if (auth) fetchData() }, [auth, fetchData])

  async function doLogin() {
    if (loginToken.length < 4) return
    setLoginError('')
    try {
      const r = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${loginToken}` } })
      if (!r.ok) { setLoginError('Token inválido'); return }
      sessionStorage.setItem(TOKEN_KEY, loginToken)
      setToken(loginToken)
      setLoginToken('')
    } catch {
      setLoginError('No se pudo conectar al servidor')
    }
  }

  async function generate() {
    setLoading(true)
    setMessage('')
    try {
      const r = await fetch('/api/admin/generate', { method: 'POST', headers: headers(), body: JSON.stringify(form) })
      const d = await r.json()
      if (d.ok) {
        setMessage(d.key)
        setCopied({ key: d.key, plan: d.plan })
        setForm({ plan: 'basico', customer_name: '', expires_at: '' })
        fetchData()
      } else {
        setMessage(`Error: ${d.detail || ''}`)
      }
    } catch { setMessage('Error de conexión') }
    setLoading(false)
  }

  async function toggleActive(key: string, activate: boolean) {
    setActionError('')
    const endpoint = activate ? 'activate' : 'revoke'
    try {
      const r = await fetch(`/api/admin/${endpoint}/${key}`, { method: 'POST', headers: headers() })
      if (!r.ok) { setActionError('Error al cambiar estado'); return }
      fetchData()
    } catch {
      setActionError('Error de conexión')
    }
  }

  async function deleteLicense(key: string) {
    if (!confirm(`Eliminar licencia ${key}?`)) return
    setActionError('')
    try {
      const r = await fetch(`/api/admin/delete/${key}`, { method: 'DELETE', headers: headers() })
      if (!r.ok) { setActionError('Error al eliminar'); return }
      fetchData()
    } catch {
      setActionError('Error de conexión')
    }
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
        {loginError && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 8 }}>{loginError}</div>}
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
        <button onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setToken('') }}
          style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}
        >Salir</button>
      </div>

      {fetchError && (
        <div style={{ background: 'var(--danger)', color: '#fff', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
          {fetchError}
        </div>
      )}

      {actionError && (
        <div style={{ background: 'var(--danger)', color: '#fff', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
          {actionError}
          <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', color: '#fff', marginLeft: 12, cursor: 'pointer', fontSize: 14 }}>&times;</button>
        </div>
      )}

      {stats && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total licencias</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.total}</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Activas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{stats.active}</div>
            </div>
            <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Clientes</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{stats.revenue?.customers ?? 0}</div>
            </div>
            {Object.entries(stats.active_by_plan || {}).map(([plan, count]: [string, any]) => (
              <div key={plan} style={{ background: 'var(--surface)', borderRadius: 10, padding: 16, minWidth: 100 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{plan}</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{count}</div>
              </div>
            ))}
          </div>

          {stats.revenue && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', borderRadius: 10, padding: 16, minWidth: 180, flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Ingreso estimado total</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.estimated_total ?? 0).toLocaleString('es-AR')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>En base a licencias activas</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', borderRadius: 10, padding: 16, minWidth: 180, flex: 1 }}>
                <div style={{ fontSize: 11, color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600 }}>MRR (Suscripciones)</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.mrr ?? 0).toLocaleString('es-AR')}/mes</div>
                <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>{stats.active_by_plan?.suscripcion ?? 0} clientes suscriptos</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #334155 100%)', borderRadius: 10, padding: 16, minWidth: 180, flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Pago único</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.one_time ?? 0).toLocaleString('es-AR')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Básico + Pro</div>
              </div>
            </div>
          )}

          {stats.trials_expiring && stats.trials_expiring.length > 0 && (
            <div style={{ marginTop: 12, background: 'var(--surface)', borderRadius: 10, padding: 16, borderLeft: '4px solid var(--warning)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 8 }}>
                {stats.trials_expiring.length} trial{stats.trials_expiring.length > 1 ? 's' : ''} por vencer
              </div>
              {stats.trials_expiring.map((t: any) => (
                <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.key}</span>
                  <span style={{ flex: 1 }}>{t.customer_name}</span>
                  <span style={{ color: t.days_left <= 2 ? 'var(--danger)' : 'var(--warning)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {t.days_left} día{t.days_left !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>Contactalos antes de que se venza el trial.</div>
            </div>
          )}
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
          <div style={{ marginTop: 12, padding: '10px 14px', background: message.startsWith('Error') ? 'var(--danger)' : 'var(--success)', color: '#fff', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontFamily: message.startsWith('Error') ? 'inherit' : 'monospace', fontSize: 13 }}>
              {message.startsWith('Error') ? message : `Generada: ${message} (${copied?.plan || ''})`}
            </span>
            {copied && copied.key === message && (
              <button onClick={() => { navigator.clipboard.writeText(message); setCopied(null); }}
                style={{ padding: '4px 14px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Copiar
              </button>
            )}
            <button onClick={() => { setMessage(''); setCopied(null); }}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Licencias ({licenses.length})</h3>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
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
                      marginRight: 4,
                    }}>
                    {l.active ? 'Revocar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => deleteLicense(l.key)}
                    style={{
                      padding: '4px 12px',
                      fontSize: 12,
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                    }}>
                    Borrar
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
      </div>

      <div style={{ marginTop: 20, padding: 12, background: 'var(--surface)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        Token admin: <code>{token.substring(0, 4)}****</code> — Configurado en config.py como TUSTOCK_ADMIN_TOKEN
      </div>
    </div>
  )
}
