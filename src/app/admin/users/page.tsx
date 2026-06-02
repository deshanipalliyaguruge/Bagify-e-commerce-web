import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { DataTable, type Column } from '@/features/admin/components/data-table'
import { AdminSearchBar } from '@/features/admin/components/admin-search-bar'
import { AdminPagination } from '@/features/admin/components/admin-pagination'
import { ActiveBadge } from '@/features/admin/components/status-badges'
import { UserRowActions } from '@/features/admin/components/user-row-actions'
import { getAdminUsers } from '@/features/admin/queries/admin.queries'
import { Badge } from '@/components/ui/badge'
import type { AdminUser, AdminUserFilters } from '@/features/admin/types/admin.types'

export const metadata: Metadata = { title: 'Users' }

type PageProps = { searchParams: Promise<Record<string, string | undefined>> }

const columns: Column<AdminUser>[] = [
  {
    key: 'email',
    header: 'User',
    render: (u) => (
      <div>
        <p className="text-xs font-medium">{u.full_name ?? '—'}</p>
        <p className="text-[11px] text-muted-foreground">{u.email}</p>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (u) => (
      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-[11px]">
        {u.role}
      </Badge>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (u) => <ActiveBadge active={u.is_active} />,
  },
  {
    key: 'created_at',
    header: 'Joined',
    render: (u) => (
      <span className="text-xs text-muted-foreground">
        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
      </span>
    ),
  },
  {
    key: 'id',
    header: '',
    className: 'text-right',
    render: (u) => <UserRowActions user={u} />,
  },
]

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters: AdminUserFilters = {
    q:    raw.q ?? '',
    role: (raw.role as AdminUserFilters['role']) ?? 'all',
    page: Math.max(1, parseInt(raw.page ?? '1', 10)),
  }

  const { data, total, page, pageSize, totalPages } = await getAdminUsers(filters)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{total} user{total !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Suspense><AdminSearchBar placeholder="Search by email…" /></Suspense>
        <RoleFilter current={filters.role} />
      </div>

      <DataTable columns={columns} data={data} keyField="id" emptyText="No users found." />

      <Suspense>
        <AdminPagination currentPage={page} totalPages={totalPages} total={total} pageSize={pageSize} />
      </Suspense>
    </div>
  )
}

function RoleFilter({ current }: { current: string }) {
  const options = [
    { value: 'all',      label: 'All'      },
    { value: 'customer', label: 'Customers' },
    { value: 'admin',    label: 'Admins'   },
  ]
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-0.5">
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={`/admin/users?role=${opt.value}`}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === opt.value
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  )
}
