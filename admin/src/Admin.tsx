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
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, string>>({})
  const [subStatuses, setSubStatuses] = useState<Record<string, string>>({})
  const [subUrls, setSubUrls] = useState<Record<string, string>>({})
  const [planInfo, setPlanInfo] = useState<any>(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [linkLicense, setLinkLicense] = useState('')
  const [linkPreapprovalId, setLinkPreapprovalId] = useState('')

  const CLOUD_API = 'https://tustock.up.railway.app'

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

  async function createPayment(key: string, plan: string) {
    setPaymentLoading(true)
    setPaymentUrl('')
    setActionError('')

    const prices: Record<string, number> = { basico: 80000, suscripcion: 8000, pro: 160000, trial: 0 }

    try {
      const r = await fetch(`${CLOUD_API}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, price: prices[plan] || 0, license_key: key })
      })
      const d = await r.json()
      if (d.ok) {
        setPaymentUrl(d.init_point)
        setCopied({ key, plan })
      } else {
        setActionError(d.detail || 'Error al crear pago')
      }
    } catch {
      setActionError('No se pudo conectar al servidor cloud')
    }
    setPaymentLoading(false)
  }

  async function createSubscription(key: string, plan: string) {
    setPaymentLoading(true)
    setPaymentUrl('')
    setActionError('')

    fetchPlanInfo()

    const planUrl = planInfo?.init_point || SUBSCRIPTION_PLAN_URL_STATIC
    if (planUrl) {
      setPaymentUrl(planUrl)
      setCopied({ key, plan })
      setSubUrls(prev => ({ ...prev, [key]: planUrl }))
      setMessage(`Comparti este link con el cliente de la licencia ${key}. Cuando se suscriba, vinculalo desde el panel.`)
    } else {
      setActionError('Plan no disponible. Configurar primero el plan de suscripcion.')
    }
    setPaymentLoading(false)
  }

  const SUBSCRIPTION_PLAN_URL_STATIC = 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=27a1162efe9e47e68cd1349307b02eb2'

  async function checkPaymentStatus(key: string) {
    try {
      const r = await fetch(`${CLOUD_API}/api/payments/status/${key}`)
      const d = await r.json()
      setPaymentStatuses(prev => ({ ...prev, [key]: d.status }))
    } catch { }
  }

  async function checkSubStatus(key: string) {
    try {
      const r = await fetch(`${CLOUD_API}/api/payments/subscription-status/${key}`)
      const d = await r.json()
      setSubStatuses(prev => ({ ...prev, [key]: d.status }))
      if (d.init_point) setSubUrls(prev => ({ ...prev, [key]: d.init_point }))
    } catch { }
  }

  async function fetchPlanInfo() {
    setPlanLoading(true)
    try {
      const r = await fetch(`${CLOUD_API}/api/plan/subscription`)
      setPlanInfo(await r.json())
    } catch { }
    setPlanLoading(false)
  }

  async function updatePlanWebhook() {
    if (!confirm('Configurar webhook en el plan? Esto habilita notificaciones automaticas de suscripciones.')) return
    setPlanLoading(true)
    try {
      const r = await fetch(`${CLOUD_API}/api/plan/update-webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      const d = await r.json()
      if (d.ok) {
        setMessage('Webhook configurado en el plan!')
        fetchPlanInfo()
      } else {
        setActionError(d.detail || d.error || 'Error al configurar webhook')
      }
    } catch { setActionError('No se pudo conectar al servidor cloud') }
    setPlanLoading(false)
  }

  async function linkSub(preapprovalId: string) {
    const lic = linkLicense.trim() || prompt('License key para vincular:')
    if (!lic) return
    setPlanLoading(true)
    try {
      const r = await fetch(`${CLOUD_API}/api/plan/link-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preapproval_id: preapprovalId, license_key: lic })
      })
      const d = await r.json()
      if (d.ok) {
        setMessage(`Suscripcion vinculada a ${d.license_key}`)
        fetchPlanInfo()
        setLinkLicense('')
      } else {
        setActionError(d.detail || 'Error al vincular')
      }
    } catch { setActionError('No se pudo conectar al servidor cloud') }
    setPlanLoading(false)
  }

  useEffect(() => {
    if (auth && licenses.length > 0) {
      licenses.slice(0, 20).forEach(l => {
        if (l.plan === 'suscripcion') {
          if (!subStatuses[l.key]) checkSubStatus(l.key)
        } else {
          if (!paymentStatuses[l.key]) checkPaymentStatus(l.key)
        }
      })
    }
    if (auth && !planInfo) fetchPlanInfo()
  }, [licenses.length, auth])

  if (!auth) {
    return (
      <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
        <h2 style={{ marginBottom: 8, color: '#e1e2ec', fontWeight: 700 }}>Admin TUSTOCK</h2>
        <p style={{ color: '#8b95a5', marginBottom: 16, fontSize: 14 }}>Ingresá el token de administrador</p>
        <input
          type="password"
          value={loginToken}
          onChange={e => setLoginToken(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doLogin()}
          placeholder="Token admin"
          style={{ width: '100%', padding: 10, background: '#0b0e15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 14, marginBottom: 8, color: '#e1e2ec', outline: 'none', boxSizing: 'border-box' }}
          autoFocus
        />
        {loginError && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{loginError}</div>}
        <button
          onClick={doLogin}
          style={{ width: '100%', padding: 10, background: '#4d8eff', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >Ingresar</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#e1e2ec', fontWeight: 700 }}>Admin — Licencias</h2>
        <button onClick={() => { sessionStorage.removeItem(TOKEN_KEY); setToken('') }}
          style={{ padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#8b95a5' }}
        >Salir</button>
      </div>

      {fetchError && (
        <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '10px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, border: '1px solid #dc2626' }}>
          {fetchError}
        </div>
      )}

      {actionError && (
        <div style={{ background: '#7f1d1d', color: '#fca5a5', padding: '8px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13, border: '1px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} style={{ background: 'none', border: 'none', color: '#fca5a5', marginLeft: 12, cursor: 'pointer', fontSize: 18 }}>&times;</button>
        </div>
      )}

      {stats && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Total licencias</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e1e2ec' }}>{stats.total}</div>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Activas</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#4ade80' }}>{stats.active}</div>
            </div>
            <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minWidth: 140 }}>
              <div style={{ fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Clientes</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#e1e2ec' }}>{stats.revenue?.customers ?? 0}</div>
            </div>
            {Object.entries(stats.active_by_plan || {}).map(([plan, count]: [string, any]) => (
              <div key={plan} style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, minWidth: 100 }}>
                <div style={{ fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>{plan}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#e1e2ec' }}>{count}</div>
              </div>
            ))}
          </div>

          {stats.revenue && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', borderRadius: 12, padding: 16, minWidth: 180, flex: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Ingreso estimado total</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.estimated_total ?? 0).toLocaleString('es-AR')}</div>
                <div style={{ fontSize: 11, color: '#93c5fd', marginTop: 4 }}>En base a licencias activas</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)', borderRadius: 12, padding: 16, minWidth: 180, flex: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>MRR (Suscripciones)</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.mrr ?? 0).toLocaleString('es-AR')}/mes</div>
                <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>{stats.active_by_plan?.suscripcion ?? 0} clientes suscriptos</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #334155 100%)', borderRadius: 12, padding: 16, minWidth: 180, flex: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Pago único</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>${(stats.revenue.one_time ?? 0).toLocaleString('es-AR')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Básico + Pro</div>
              </div>
            </div>
          )}

          {stats.trials_expiring && stats.trials_expiring.length > 0 && (
            <div style={{ marginTop: 12, background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, borderLeft: '4px solid #fbbf24' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24', marginBottom: 8 }}>
                {stats.trials_expiring.length} trial{stats.trials_expiring.length > 1 ? 's' : ''} por vencer
              </div>
              {stats.trials_expiring.map((t: any) => (
                <div key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8b95a5' }}>{t.key}</span>
                  <span style={{ flex: 1, color: '#e1e2ec' }}>{t.customer_name}</span>
                  <span style={{ color: t.days_left <= 2 ? '#f87171' : '#fbbf24', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {t.days_left} día{t.days_left !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11, color: '#8b95a5' }}>Contactalos antes de que se venza el trial.</div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: '#e1e2ec', fontWeight: 700 }}>Generar licencia</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: '#8b95a5' }}>Plan</label>
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
              style={{ padding: 8, background: '#0b0e15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, color: '#e1e2ec' }}>
              <option value="basico">Básico ($80K único)</option>
              <option value="suscripcion">Suscripción ($8K/mes)</option>
              <option value="pro">Pro ($160K único)</option>
              <option value="trial">Trial (30 días)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: '#8b95a5' }}>Cliente</label>
            <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })}
              placeholder="Nombre del negocio"
              style={{ padding: 8, background: '#0b0e15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, width: 180, color: '#e1e2ec', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4, color: '#8b95a5' }}>Vence (opcional)</label>
            <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
              style={{ padding: 8, background: '#0b0e15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, fontSize: 13, color: '#e1e2ec' }} />
          </div>
          <button onClick={generate} disabled={loading}
            style={{ padding: '8px 18px', background: '#4d8eff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', height: 36 }}>
            {loading ? '...' : 'Generar'}
          </button>
        </div>
        {message && (
          <div style={{
            marginTop: 12,
            padding: '14px 18px',
            background: message.startsWith('Error') ? '#7f1d1d' : 'rgba(22,101,52,0.4)',
            border: message.startsWith('Error') ? '1px solid #dc2626' : '1px solid #16a34a',
            borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontFamily: message.startsWith('Error') ? 'inherit' : 'monospace', fontSize: 14, fontWeight: 600, color: message.startsWith('Error') ? '#fca5a5' : '#4ade80' }}>
              {message.startsWith('Error') ? message : `Generada: ${message} (${copied?.plan || ''})`}
            </span>
            {copied && copied.key === message && (
              <button onClick={() => { navigator.clipboard.writeText(message); setCopied(null); }}
                style={{ padding: '5px 16px', borderRadius: 4, border: '1px solid #16a34a', background: 'rgba(22,101,52,0.3)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Copiar clave
              </button>
            )}
            <button onClick={() => { setMessage(''); setCopied(null); }}
              style={{ background: 'none', border: 'none', color: '#8b95a5', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
          </div>
        )}

        {paymentUrl && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: 'rgba(30,41,59,0.7)', borderRadius: 8, border: '1px solid #4d8eff', fontSize: 13, backdropFilter: 'blur(12px)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: '#adc6ff' }}>Link de pago Mercado Pago</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{ flex: 1, fontSize: 11, background: '#0b0e15', padding: '6px 10px', borderRadius: 4, wordBreak: 'break-all', color: '#e1e2ec' }}>{paymentUrl}</code>
              <button onClick={() => { navigator.clipboard.writeText(paymentUrl); }}
                style={{ padding: '6px 14px', background: '#4d8eff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Copiar
              </button>
              <button onClick={() => { window.open(paymentUrl, '_blank'); setPaymentUrl(''); }}
                style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Abrir
              </button>
            </div>
          </div>
        )}
      </div>

      {planInfo?.ok && (
        <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, margin: 0, color: '#e1e2ec', fontWeight: 700 }}>Plan de Suscripción MP</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={fetchPlanInfo} disabled={planLoading}
                style={{ padding: '4px 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, cursor: 'pointer', fontSize: 12, background: 'transparent', color: '#8b95a5' }}>
                Refrescar
              </button>
              <button onClick={updatePlanWebhook} disabled={planLoading}
                style={{ padding: '4px 12px', background: '#4d8eff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                {planLoading ? '...' : 'Configurar Webhook'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(22,101,52,0.3)', borderRadius: 8, padding: 12, minWidth: 160, border: '1px solid rgba(22,163,74,0.3)' }}>
              <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', fontWeight: 600 }}>Plan ID</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e1e2ec' }}>{planInfo.plan_status}</div>
            </div>
            <div style={{ background: 'rgba(22,101,52,0.3)', borderRadius: 8, padding: 12, minWidth: 120, border: '1px solid rgba(22,163,74,0.3)' }}>
              <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', fontWeight: 600 }}>Precio</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e1e2ec' }}>${planInfo.plan_price?.toLocaleString('es-AR')}/mes</div>
            </div>
            <div style={{ background: planInfo.unlinked_subscriptions?.length > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(22,101,52,0.3)', borderRadius: 8, padding: 12, minWidth: 140, border: planInfo.unlinked_subscriptions?.length > 0 ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(22,163,74,0.3)' }}>
              <div style={{ fontSize: 11, color: planInfo.unlinked_subscriptions?.length > 0 ? '#fbbf24' : '#4ade80', textTransform: 'uppercase', fontWeight: 600 }}>Sin vincular</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#e1e2ec' }}>{planInfo.unlinked_subscriptions?.length || 0}</div>
            </div>
          </div>
          <div style={{ background: '#0b0e15', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#8b95a5' }}>Link de suscripción (compartir con clientes)</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <code style={{ flex: 1, fontSize: 11, background: 'rgba(30,41,59,0.7)', padding: '6px 10px', borderRadius: 4, wordBreak: 'break-all', color: '#e1e2ec' }}>{planInfo.init_point}</code>
              <button onClick={() => { navigator.clipboard.writeText(planInfo.init_point); }}
                style={{ padding: '6px 14px', background: '#4d8eff', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Copiar
              </button>
              <button onClick={() => window.open(planInfo.init_point, '_blank')}
                style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Abrir
              </button>
            </div>
          </div>

          {planInfo.unlinked_subscriptions?.length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#e1e2ec' }}>Suscripciones sin vincular ({planInfo.unlinked_subscriptions.length})</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>ID MP</th>
                    <th style={{ textAlign: 'left', padding: '6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</th>
                    <th style={{ textAlign: 'right', padding: '6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {planInfo.unlinked_subscriptions.map((s: any) => (
                    <tr key={s.preapproval_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <td style={{ padding: '6px', fontFamily: 'monospace', fontSize: 11, color: '#8b95a5' }}>{s.preapproval_id?.substring(0, 12)}...</td>
                      <td style={{ padding: '6px', color: '#e1e2ec' }}>{s.customer_email || '-'}</td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: s.status === 'authorized' ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.2)', color: s.status === 'authorized' ? '#4ade80' : '#fbbf24' }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '6px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <input
                            value={linkPreapprovalId === s.preapproval_id ? linkLicense : ''}
                            onChange={e => { setLinkLicense(e.target.value); setLinkPreapprovalId(s.preapproval_id); }}
                            onFocus={() => setLinkPreapprovalId(s.preapproval_id)}
                            placeholder="License key"
                            style={{ width: 130, padding: '4px 8px', background: '#0b0e15', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 4, fontSize: 11, color: '#e1e2ec', outline: 'none' }}
                          />
                          <button onClick={() => linkSub(s.preapproval_id)}
                            disabled={planLoading}
                            style={{ padding: '4px 10px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Vincular
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: '#e1e2ec', fontWeight: 700 }}>Licencias ({licenses.length})</h3>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Key</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Plan</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Cliente</th>
              <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Estado</th>
              <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Creada</th>
              <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Acción</th>
              <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: 11, color: '#8b95a5', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pago</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '8px 6px', fontFamily: 'monospace', fontSize: 12, color: '#e1e2ec' }}>{l.key}</td>
                <td style={{ padding: '8px 6px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: l.plan === 'trial' ? 'rgba(251,191,36,0.2)' : l.plan === 'pro' ? 'rgba(77,142,255,0.2)' : l.plan === 'premium' ? 'rgba(236,72,153,0.2)' : 'rgba(22,163,74,0.2)',
                    color: l.plan === 'trial' ? '#fbbf24' : l.plan === 'pro' ? '#adc6ff' : l.plan === 'premium' ? '#f472b6' : '#4ade80' }}>
                    {l.plan}
                  </span>
                </td>
                <td style={{ padding: '8px 6px', color: '#e1e2ec' }}>{l.customer_name || '-'}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: l.active ? '#4ade80' : '#f87171' }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: l.active ? '#4ade80' : '#f87171',
                    }} />
                    {l.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={{ padding: '8px 6px', fontSize: 12, color: '#8b95a5' }}>
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
                      background: l.active ? '#7f1d1d' : 'rgba(22,101,52,0.5)',
                      color: l.active ? '#fca5a5' : '#4ade80',
                      border: `1px solid ${l.active ? '#dc2626' : '#16a34a'}`,
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
                      background: 'rgba(107,114,128,0.2)',
                      color: '#9ca3af',
                      border: '1px solid rgba(255,255,255,0.12)',
                      marginRight: 4,
                    }}>
                    Borrar
                  </button>
                </td>
                <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                  {l.plan === 'suscripcion' ? (
                    subStatuses[l.key] && subStatuses[l.key] !== 'none' ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: subStatuses[l.key] === 'authorized' ? 'rgba(22,163,74,0.25)' : subStatuses[l.key] === 'cancelled' ? 'rgba(220,38,38,0.2)' : 'rgba(251,191,36,0.2)',
                        color: subStatuses[l.key] === 'authorized' ? '#4ade80' : subStatuses[l.key] === 'cancelled' ? '#f87171' : '#fbbf24',
                      }}>
                        {subStatuses[l.key] === 'authorized' ? 'Activa' : subStatuses[l.key] === 'cancelled' ? 'Cancelada' : subStatuses[l.key] === 'pending' ? 'Pendiente' : subStatuses[l.key]}
                      </span>
                    ) : (
                      <button
                        onClick={() => createSubscription(l.key, l.plan)}
                        disabled={paymentLoading || l.plan === 'trial'}
                        style={{
                          padding: '4px 12px', fontSize: 12, borderRadius: 4, cursor: l.plan === 'trial' ? 'not-allowed' : 'pointer',
                          background: '#7c3aed', color: '#fff', border: 'none', opacity: l.plan === 'trial' ? 0.5 : 1,
                        }}>
                        Suscribir MP
                      </button>
                    )
                  ) : (
                    paymentStatuses[l.key] && paymentStatuses[l.key] !== 'none' ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: paymentStatuses[l.key] === 'approved' ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.2)',
                        color: paymentStatuses[l.key] === 'approved' ? '#4ade80' : '#fbbf24',
                      }}>
                        {paymentStatuses[l.key] === 'approved' ? 'Pagado' : paymentStatuses[l.key] === 'pending' ? 'Pendiente' : paymentStatuses[l.key]}
                      </span>
                    ) : (
                      <button
                        onClick={() => createPayment(l.key, l.plan)}
                        disabled={paymentLoading || l.plan === 'trial'}
                        style={{
                          padding: '4px 12px', fontSize: 12, borderRadius: 4, cursor: l.plan === 'trial' ? 'not-allowed' : 'pointer',
                          background: '#4d8eff', color: '#fff', border: 'none', opacity: l.plan === 'trial' ? 0.5 : 1,
                        }}>
                        {l.plan === 'trial' ? 'Gratis' : 'Cobrar MP'}
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#8b95a5' }}>No hay licencias</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 12, background: 'rgba(30,41,59,0.7)', borderRadius: 8, fontSize: 11, color: '#8b95a5', border: '1px solid rgba(255,255,255,0.08)' }}>
        Token admin: <code style={{ color: '#e1e2ec' }}>{token.substring(0, 4)}****</code> — Configurado en config.py como TUSTOCK_ADMIN_TOKEN
      </div>
    </div>
  )
}
