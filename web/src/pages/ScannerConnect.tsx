import { useState, useEffect } from 'react'
import { api, Product } from '../api/client'

interface ServerInfo {
  hostname: string
  primary_ip: string
  primary_url: string
  ips: string[]
  port: number
  urls: string[]
}

export default function ScannerConnect() {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null)
  const [serverIP, setServerIP] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [infoLoading, setInfoLoading] = useState(true)

  useEffect(() => {
    fetch('/api/server-info')
      .then(r => r.json())
      .then((info: ServerInfo) => {
        setServerInfo(info)
        setServerIP(info.primary_url || info.urls[0] || `http://localhost:${info.port}`)
      })
      .catch(() => {})
      .finally(() => setInfoLoading(false))
  }, [])

  const lookupProduct = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await api.get<any>(`/products/scan/${code}`)
      setProduct(result)
    } catch {
      setError(`Producto "${code}" no encontrado. Registrar?`)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const [newProduct, setNewProduct] = useState({ code: '', name: '', description: '', cost_price: 0, selling_price: 0, min_stock: 5, unit: 'unidad' })

  const registerProduct = async () => {
    try {
      const result = await api.post<Product>('/products', newProduct)
      setProduct(result)
      setError('')
      alert('Producto registrado exitosamente')
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
  }

  const handleScan = (code: string) => {
    setScannedCode(code)
    setNewProduct({ ...newProduct, code })
    lookupProduct(code)
  }

  const handleIpClick = (url: string) => {
    setServerIP(url)
    navigator.clipboard.writeText(url).catch(() => {})
  }

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Scanner - App Android</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        La app Android se conecta a este servidor por WiFi local para escanear codigos.
        Abajo podes simular el escaneo manualmente.
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Datos del servidor
          <span style={{ marginLeft: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
        </h3>

        {infoLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Detectando...</p>
        ) : serverInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>IPs del servidor:</span>
              {serverInfo.ips.length > 0 ? serverInfo.ips.map(ip => (
                <code
                  key={ip}
                  onClick={() => handleIpClick(`http://${ip}:${serverInfo.port}`)}
                  style={{
                    background: 'var(--bg)',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontSize: 15,
                    fontFamily: 'monospace',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    transition: 'all 0.15s',
                  }}
                  title="Click para copiar URL"
                >
                  {ip}:{serverInfo.port}
                </code>
              )) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No se detectaron IPs de red</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>URL para la app:</span>
              <code style={{
                background: 'var(--bg)',
                padding: '8px 14px',
                borderRadius: 6,
                fontSize: 15,
                fontFamily: 'monospace',
                color: 'var(--success)',
                fontWeight: 600,
                border: '1px solid var(--success)',
              }}>
                {serverIP || 'No detectada'}
              </code>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              En la app Android, toca <b>Conectar</b> con esta URL. Asegurate de que el celular este en la misma red WiFi.
            </p>
          </div>
        ) : (
          <p style={{ color: 'var(--warning)' }}>No se pudo obtener informacion del servidor</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Simulador de escaneo</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleScan(scannedCode) }}
              placeholder="Codigo QR / barras..."
              style={{ flex: 1, padding: '10px 12px' }}
              autoFocus
            />
            <button onClick={() => handleScan(scannedCode)} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              Escanear
            </button>
          </div>

          {loading && <p style={{ color: 'var(--text-muted)' }}>Buscando...</p>}
          {error && <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, color: 'var(--warning)', fontSize: 14, marginBottom: 12 }}>{error}</div>}

          {product && (
            <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{product.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Codigo: {product.code}</div>
              {product.description && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{product.description}</div>}
              <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Precio: </span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>${product.selling_price}</span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stock: </span>
                  <span style={{ fontWeight: 700 }}>{product.stock}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Registrar producto nuevo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Codigo</label>
              <input value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nombre</label>
              <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Precio de venta</label>
              <input type="number" value={newProduct.selling_price} onChange={e => setNewProduct({ ...newProduct, selling_price: +e.target.value })} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Precio costo</label>
                <input type="number" value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: +e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock minimo</label>
                <input type="number" value={newProduct.min_stock} onChange={e => setNewProduct({ ...newProduct, min_stock: +e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <button onClick={registerProduct} style={{ marginTop: 8, padding: '10px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600 }}>
              Registrar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
