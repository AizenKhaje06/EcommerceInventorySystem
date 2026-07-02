'use client'

/**
 * Logistics Products Page
 * This page wraps the admin inventory page content but keeps the logistics layout (header tabs).
 * The actual product table, KPI cards, and all inventory logic are imported from the main inventory page.
 */

import dynamic from 'next/dynamic'

// Dynamically import the inventory page to avoid layout conflicts
const InventoryPage = dynamic(
  () => import('@/app/dashboard/inventory/page'),
  { ssr: false }
)

export default function LogisticsProductsPage() {
  return <InventoryPage />
}
