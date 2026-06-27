import { RoleLayout } from '@/components/role-layout'

const NAV_ITEMS = [
  { href: '/logistics/dashboard', label: 'Dashboard' },
  { href: '/logistics/products', label: 'Products' },
  { href: '/logistics/packing-queue', label: 'Packing Queue' },
  { href: '/logistics/track-orders', label: 'Track Orders' },
  { href: '/logistics/business-contacts', label: 'Contacts' },
  { href: '/logistics/log', label: 'Activity Logs' },
]

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      navItems={NAV_ITEMS}
      roleName="Logistics Admin"
      defaultInitials="LA"
      defaultDisplayName="Logistics Admin"
      containerVariant="compact"
    >
      {children}
    </RoleLayout>
  )
}
