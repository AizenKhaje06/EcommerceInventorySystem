import { RoleLayout } from '@/components/role-layout'

const NAV_ITEMS = [
  { href: '/packer/dashboard', label: 'Dashboard' },
]

export default function PackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout
      navItems={NAV_ITEMS}
      roleName="Packer"
      defaultInitials="P"
      defaultDisplayName="Packer"
    >
      {children}
    </RoleLayout>
  )
}
