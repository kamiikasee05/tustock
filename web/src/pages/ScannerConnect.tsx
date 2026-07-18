import { useState, useEffect } from 'react'
import { api, Product } from '../api/client'
import { useToast } from '../components/Toast'
import MaterialIcon from '../components/ui/MaterialIcon'

interface ServerInfo { hostname: string; primary_ip: string; primary_url: string; ips: string[]; port: number; urls: string[] }

export default function ScannerConnect() {
  const { toast } = useToast()
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
      .catch(() => { })
      .finally(() => setInfoLoading(false))
  }, [])

  const lookupProduct = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await api.get<any>(`/products/scan/${code}`)
      setProduct(result)
    } catch {
      setError('Producto no encontrado. ¿Registrarlo?')
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
      toast('Producto registrado exitosamente', 'success')
    } catch (e: any) {
      toast('Error: ' + e.message, 'error')
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
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>
          <span>CONFIGURACIÓN</span>
          <MaterialIcon name="chevron_right" size={12} />
          <span style={{ color: 'var(--primary-fixed-dim)' }}>SCANNER</span>
        </nav>
        <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 40, lineHeight: '48px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--on-surface)' }}>
          Scanner App Android
        </h2>
        <p style={{ color: 'var(--on-surface-variant)', marginTop: 4, fontSize: 14 }}>
          La app Android se conecta a este servidor por WiFi local para escanear códigos.
        </p>
      </div>

      <div style={{
        background: 'var(--surface-container)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)',
        border: '1px solid rgba(66,71,84,0.5)',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaterialIcon name="lan" size={20} />
          Datos del servidor
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
        </h3>

        {infoLoading ? (
          <p style={{ color: 'var(--on-surface-variant)' }}>Detectando...</p>
        ) : serverInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 600 }}>IPs del servidor:</span>
              {serverInfo.ips.length > 0 ? serverInfo.ips.map(ip => (
                <code key={ip} onClick={() => handleIpClick(`http://${ip}:${serverInfo.port}`)} style={{
                  background: 'var(--surface-container-low)',
                  padding: '8px 14px', borderRadius: 6,
                  fontSize: 15, fontFamily: 'monospace',
                  color: 'var(--primary)', fontWeight: 600, cursor: 'pointer',
                  border: '1px solid rgba(66,71,84,0.3)',
                  transition: 'all 0.15s',
                }} title="Click para copiar URL">
                  {ip}:{serverInfo.port}
                </code>
              )) : (
                <span style={{ color: 'var(--on-surface-variant)', fontSize: 13 }}>No se detectaron IPs de red</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontWeight: 600 }}>URL para la app:</span>
              <code style={{
                background: 'var(--surface-container-low)',
                padding: '8px 14px', borderRadius: 6,
                fontSize: 15, fontFamily: 'monospace',
                color: 'var(--success)', fontWeight: 600,
                border: '1px solid rgba(80,216,144,0.3)',
              }}>
                {serverIP || 'No detectada'}
              </code>
            </div>

            <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
              En la app Android, toca <b>Conectar</b> con esta URL. Asegurate de que el celular esté en la misma red WiFi.
            </p>
          </div>
        ) : (
          <p style={{ color: 'var(--tertiary)' }}>No se pudo obtener información del servidor</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr', gap: 20 }}>
        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MaterialIcon name="qr_code_scanner" size={20} />
            Simulador de escaneo
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleScan(scannedCode) }}
              placeholder="Código QR / barras..."
              style={{ flex: 1, padding: '10px 12px' }}
              autoFocus
            />
            <button onClick={() => handleScan(scannedCode)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
              background: 'var(--primary-container)', color: 'var(--on-primary-container)',
              paddingLeft: 'var(--space-lg)', paddingRight: 'var(--space-lg)',
              paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)',
              borderRadius: 'var(--radius)', fontWeight: 700,
            }}>
              <MaterialIcon name="scan" size={18} />
              Escanear
            </button>
          </div>

          {loading && <p style={{ color: 'var(--on-surface-variant)' }}>Buscando...</p>}

          {error && <div style={{
            background: 'var(--surface-container-low)', padding: 12, borderRadius: 8, fontSize: 14,
            marginBottom: 12, color: 'var(--tertiary)', border: '1px solid rgba(255,183,134,0.2)'
          }}>{error}</div>}

          {product && (
            <div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 12, border: '1px solid rgba(66,71,84,0.3)' }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'var(--on-surface)' }}>{product.name}</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Código: {product.code}</div>
              {product.description && <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{product.description}</div>}
              <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                <div style={{ background: 'rgba(80,216,144,0.1)', padding: '8px 12px', borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--on-surface-variant)' }}>Precio</span>
                  <div style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--success)' }}>${product.selling_price}</div>
                </div>
                <div style={{ background: 'var(--surface-container-highest)', padding: '8px 12px', borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: 'var(--on-surface-variant)' }}>Stock</span>
                  <div style={{ fontFamily: 'var(--font-data)', fontWeight: 700 }}>{product.stock}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)', border: '1px solid rgba(66,71,84,0.5)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MaterialIcon name="add_box" size={20} />
            Registrar producto nuevo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Código</label>
              <input value={newProduct.code} onChange={e => setNewProduct({ ...newProduct, code: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Nombre</label>
              <input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Precio de venta</label>
              <input type="number" value={newProduct.selling_price} onChange={e => setNewProduct({ ...newProduct, selling_price: +e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Precio costo</label>
                <input type="number" value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: +e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Stock mínimo</label>
                <input type="number" value={newProduct.min_stock} onChange={e => setNewProduct({ ...newProduct, min_stock: +e.target.value })} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={registerProduct} style={{
              marginTop: 8, padding: 10, background: 'var(--success)', color: 'var(--bg)',
              border: 'none', borderRadius: 'var(--radius)', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <MaterialIcon name="add" size={20} />
              Registrar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
