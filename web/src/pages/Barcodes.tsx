import { useState, useEffect } from 'react'
import { api, Product } from '../api/client'
import MaterialIcon from '../components/ui/MaterialIcon'

interface Category { id: number; name: string; parent_id: number | null }

export default function Barcodes() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const cats = await api.get<Category[]>('/products/categories')
      let all: Product[] = []
      let page = 1
      let totalPages = 1
      do {
        const data = await api.get<{ products: Product[]; total: number; total_pages: number }>(
          `/products?include_inactive=true&page=${page}&page_size=200`
        )
        all = [...all, ...data.products]
        totalPages = data.total_pages
        page++
      } while (page <= totalPages)
      setProducts(all)
      setCategories(cats)
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const withBarcode = products.filter((p): p is Product & { barcode: string } => !!p.barcode)

  const filtered = withBarcode.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.barcode.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false
    }
    if (filterCat !== '' && p.category_id !== filterCat) return false
    return true
  })

  const groups: { name: string; products: (Product & { barcode: string })[] }[] = []
  const uncategorized: (Product & { barcode: string })[] = []
  for (const p of filtered) {
    const catName = p.category_name || 'Sin categoría'
    if (!p.category_id) {
      uncategorized.push(p)
    } else {
      let g = groups.find(x => x.name === catName)
      if (!g) { g = { name: catName, products: [] }; groups.push(g) }
      g.products.push(p)
    }
  }
  groups.sort((a, b) => a.name.localeCompare(b.name))

  const handlePrint = () => window.print()

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--outline-variant)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: 'var(--on-surface)',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    lineHeight: '20px',
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 0', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
        Cargando...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginBottom: 'var(--space-lg)' }}>
        <div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--outline)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
            <span>PRODUCTOS</span>
            <MaterialIcon name="chevron_right" size={12} />
            <span style={{ color: 'var(--primary-fixed-dim)' }}>CÓDIGOS DE BARRA</span>
          </nav>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 22, fontWeight: 700, color: 'var(--on-surface)' }}>
            Códigos de barras
          </h2>
          <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginTop: 4 }}>
            {withBarcode.length} productos con código de barras
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={async () => {
            try {
              const token = 'tustock-local-token';
              const res = await fetch('/api/products/barcodes/pdf', {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (!res.ok) throw new Error('Error al generar PDF');
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'codigos-de-barras.pdf';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            } catch (e) {
              alert('Error al descargar PDF: ' + (e as Error).message);
            }
          }} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface-container)', color: 'var(--on-surface)',
            padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
            border: '1px solid var(--outline-variant)',
          }}>
            <MaterialIcon name="download" size={18} />
            <span>Descargar PDF</span>
          </button>
          <button onClick={handlePrint} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary-container)', color: 'var(--on-primary-container)',
            padding: '8px 20px', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 13,
            boxShadow: '0 2px 8px rgba(77,142,255,0.15)',
          }}>
            <MaterialIcon name="print" size={18} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className="no-print" style={{
        background: 'var(--surface-container)', border: '1px solid rgba(66,71,84,0.5)',
        borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 'var(--space-lg)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <MaterialIcon name="search" size={18} color="var(--outline)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            placeholder="Filtrá por nombre, código o código de barras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 40 }}
          />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value ? +e.target.value : '')} style={{ ...inputStyle, width: 240, flexShrink: 0, appearance: 'none' as const, cursor: 'pointer' }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* ── BARCODE GRID ── */}
      <div className="barcode-print-area">
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: 14 }}>
            No hay productos con código de barras
          </div>
        ) : (
          <>
            {groups.map(group => (
              <div key={group.name} style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="no-print" style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)', letterSpacing: '0.02em',
                }}>
                  {group.name}
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--on-surface-variant)', marginLeft: 8 }}>({group.products.length})</span>
                </h3>
                <div className="barcode-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--gutter)',
                }}>
                  {group.products.map(p => (
                    <BarcodeTag key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
            {uncategorized.length > 0 && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <h3 className="no-print" style={{
                  fontSize: 15, fontWeight: 700, color: 'var(--on-surface)',
                  marginBottom: 'var(--space-md)', letterSpacing: '0.02em',
                }}>
                  Sin categoría
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--on-surface-variant)', marginLeft: 8 }}>({uncategorized.length})</span>
                </h3>
                <div className="barcode-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--gutter)',
                }}>
                  {uncategorized.map(p => (
                    <BarcodeTag key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media print {
          @page { margin: 5mm; }
          .no-print { display: none !important; }
          html, body { background: white !important; height: auto !important; overflow: visible !important; }
          .barcode-print-area { display: block !important; position: fixed; top: 0; left: 0; width: 100%; padding: 5mm; background: white; z-index: 9999; }
          .barcode-print-area h3 { display: none !important; }
          .barcode-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 4mm !important; }
          .barcode-tag { break-inside: avoid !important; page-break-inside: avoid !important; }
        }
      `}</style>
    </div>
  )
}

function BarcodeTag({ product }: { product: Product & { barcode: string } }) {
  return (
    <div className="barcode-tag" style={{
      background: 'white',
      borderRadius: 6,
      border: '1px solid rgba(66,71,84,0.15)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 8,
    }}>
      <img
        src={`/api/products/${product.id}/barcode.png`}
        alt={product.barcode}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      <span style={{
        fontFamily: 'var(--font-data)', fontSize: 10, color: '#666',
        letterSpacing: '0.05em', marginTop: 6,
      }}>
        {product.barcode}
      </span>
    </div>
  )
}
