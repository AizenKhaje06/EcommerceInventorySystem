import { RoleLayout } from '@/components/role-layout'

const NAV_ITEMS = [
  { href: '/tracker/dashboard', label: 'Dashboard' },
]

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      navItems={NAV_ITEMS}
      roleName="Tracker"
      defaultInitials="T"
      defaultDisplayName="Tracker"
    >
      {children}
    </RoleLayout>
  )
}
