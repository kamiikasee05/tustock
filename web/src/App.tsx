import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Audits from './pages/Audits'
import Reports from './pages/Reports'
import ScannerConnect from './pages/ScannerConnect'
import Pedidos from './pages/Pedidos'
import Customers from './pages/Customers'
import Presupuestos from './pages/Presupuestos'
import Vendors from './pages/Vendors'
import Upgrade from './pages/Upgrade'
import Settings from './pages/Settings'
import Barcodes from './pages/Barcodes'

export default function App() {
  return (
    <Routes>
      <Route path="*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/presupuestos" element={<Presupuestos />} />
            <Route path="/products" element={<Products />} />
            <Route path="/barcodes" element={<Barcodes />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/audits" element={<Audits />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/scanner" element={<ScannerConnect />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}
