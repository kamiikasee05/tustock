import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

export interface LicenseStatus {
  plan: string
  plan_name: string
  active: boolean
  trial: boolean
  expired: boolean
  days_left: number
  products_used: number
  products_max: number
  reports_enabled: boolean
  export_enabled: boolean
  monitor_enabled: boolean
  backup_enabled: boolean
  key: string
  customer_name: string
  expires_at: string | null
  upgrade_message: string
}

const defaultStatus: LicenseStatus = {
  plan: '',
  plan_name: '',
  active: false,
  trial: false,
  expired: false,
  days_left: 0,
  products_used: 0,
  products_max: 0,
  reports_enabled: false,
  export_enabled: false,
  monitor_enabled: false,
  backup_enabled: false,
  key: '',
  customer_name: '',
  expires_at: null,
  upgrade_message: '',
}

export function useLicense() {
  const [status, setStatus] = useState<LicenseStatus>(defaultStatus)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    api.get<LicenseStatus>('/license/status')
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const canUse = (feature: string): boolean => {
    switch (feature) {
      case 'reports': return status.reports_enabled
      case 'export': return status.export_enabled
      case 'monitor': return status.monitor_enabled
      case 'backup': return status.backup_enabled
      default: return false
    }
  }

  const isProductLimitReached = status.products_max > 0 && status.products_used >= status.products_max

  return { status, loading, refresh, canUse, isProductLimitReached }
}
