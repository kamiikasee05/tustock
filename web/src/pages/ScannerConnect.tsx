import { useState } from 'react'
import { api, Product } from '../api/client'

export default function ScannerConnect() {
  const [serverIP, setServerIP] = useState('')
  const [scannedCode, setScannedCode] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookupProduct = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await api.get<any>(`/products/scan/${code}`)
      setProduct(result)
    } catch {
      setError(`Producto "${code}" no encontrado. ¿Registrarlo?`)
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

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Scanner - App Android</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        La app Android se conecta a este servidor por WiFi local para escanear códigos.
        Abajo podés simular el escaneo manualmente.
      </p>

      <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Conexión de la app Android</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>IP del servidor (en el celular)</label>
            <input
              value={serverIP}
              onChange={e => setServerIP(e.target.value)}
              placeholder="Ej: 192.168.1.100:8090"
              style={{ width: '100%', padding: '10px 12px', fontFamily: 'monospace' }}
            />
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
          En la app Android, configurá la URL: <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>http://{serverIP || '192.168.1.X'}:8090</code>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Simulador de escaneo</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={scannedCode}
              onChange={e => setScannedCode(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleScan(scannedCode) }}
              placeholder="Código QR / barras..."
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
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Código: {product.code}</div>
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
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Código</label>
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
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock mínimo</label>
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
