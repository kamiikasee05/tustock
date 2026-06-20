import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Audits from './pages/Audits'
import Reports from './pages/Reports'
import ScannerConnect from './pages/ScannerConnect'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/audits" element={<Audits />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/scanner" element={<ScannerConnect />} />
      </Routes>
    </Layout>
  )
}
