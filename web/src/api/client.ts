const BASE = '/api'
const TOKEN = 'tustock-local-token'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isForm = options?.body instanceof FormData
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      'Authorization': `Bearer ${TOKEN}`,
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sin acceso. Verifique que el servidor este corriendo.')
    const err = await res.json().catch(() => ({ detail: 'Error de conexion' }))
    throw new Error(err.detail || err.message || err.error || 'Error de conexion')
  }
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}

export interface Product {
  id: number
  code: string
  name: string
  description: string
  category_id: number | null
  category_name?: string
  cost_price: number
  selling_price: number
  min_stock: number
  unit: string
  is_active: boolean
  barcode?: string | null
  expiry_date?: string | null
}

export interface StockItem {
  id: number
  code: string
  name: string
  min_stock: number
  quantity: number
  unit: string
  selling_price: number
}

export interface LowStockItem {
  id: number
  code: string
  name: string
  min_stock: number
  current: number
  unit: string
}

export interface Sale {
  id: number
  sale_date: string
  total: number
  discount: number
  payment_method: string
  notes: string
  cashier: string
  items_count?: number
  created_at: string | null
  customer_id?: number | null
  customer_name?: string | null
}

export interface SaleItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Audit {
  id: number
  audit_date: string
  status: string
  created_by: string
  notes: string
  total_items: number
  items_checked: number
  sobrantes: number
  faltantes: number
}

export interface CustomerBrief {
  id: number
  name: string
  balance: number
}

export interface DailyReport {
  date: string
  total_sales: number
  total_transactions: number
  total_items_sold: number
  discounts: number
  cash_sales: number
  card_sales: number
  other_sales: number
  top_items: { product_id: number; name: string; quantity: number; revenue: number }[]
  generated_at: string
}
