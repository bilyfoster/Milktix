import { useEffect, useState } from 'react'
import { 
  Search, 
  Users, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 

  Edit3,
  CheckCircle,
  XCircle,
  Filter,
  X,
  UserCheck,
  Shield,
  User
} from 'lucide-react'
import { adminApi } from '../../utils/api'

interface UserData {
  id: string
  fullName: string
  email: string
  role: 'ADMIN' | 'ORGANIZER' | 'USER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  lastLoginAt?: string
}

interface FilterState {
  role: string
  status: string
  search: string
}

const ROLES = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ORGANIZER', label: 'Organizer' },
  { value: 'USER', label: 'User' },
]

const STATUSES = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

const ITEMS_PER_PAGE = 10

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterState>({
    role: 'ALL',
    status: 'ALL',
    search: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Load mock data for demo - in real app this would call adminApi.getUsers()
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      // Mock data - replace with actual API call
      const mockUsers: UserData[] = [
        { id: '1', fullName: 'John Admin', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-15T10:00:00Z', lastLoginAt: '2024-03-04T15:30:00Z' },
        { id: '2', fullName: 'Sarah Organizer', email: 'sarah@events.com', role: 'ORGANIZER', status: 'ACTIVE', createdAt: '2024-02-01T14:20:00Z', lastLoginAt: '2024-03-03T09:15:00Z' },
        { id: '3', fullName: 'Mike User', email: 'mike@email.com', role: 'USER', status: 'ACTIVE', createdAt: '2024-02-10T08:45:00Z', lastLoginAt: '2024-03-01T18:20:00Z' },
        { id: '4', fullName: 'Emily Johnson', email: 'emily.j@company.com', role: 'ORGANIZER', status: 'INACTIVE', createdAt: '2024-02-15T11:30:00Z' },
        { id: '5', fullName: 'David Wilson', email: 'dave.w@example.org', role: 'USER', status: 'SUSPENDED', createdAt: '2024-02-20T16:00:00Z', lastLoginAt: '2024-02-25T10:00:00Z' },
        { id: '6', fullName: 'Lisa Chen', email: 'lisa.chen@tech.io', role: 'USER', status: 'ACTIVE', createdAt: '2024-02-22T09:00:00Z', lastLoginAt: '2024-03-04T12:45:00Z' },
        { id: '7', fullName: 'Robert Brown', email: 'rbrown@business.com', role: 'ORGANIZER', status: 'ACTIVE', createdAt: '2024-02-25T13:15:00Z', lastLoginAt: '2024-03-02T14:30:00Z' },
        { id: '8', fullName: 'Anna Martinez', email: 'anna.m@startup.io', role: 'USER', status: 'ACTIVE', createdAt: '2024-03-01T10:30:00Z', lastLoginAt: '2024-03-04T08:00:00Z' },
        { id: '9', fullName: 'James Taylor', email: 'jtaylor@music.com', role: 'ORGANIZER', status: 'ACTIVE', createdAt: '2024-03-02T15:45:00Z', lastLoginAt: '2024-03-04T16:20:00Z' },
        { id: '10', fullName: 'Sophie White', email: 'sophie@art gallery.com', role: 'USER', status: 'INACTIVE', createdAt: '2024-03-03T11:00:00Z' },
        { id: '11', fullName: 'Michael Lee', email: 'mlee@corp.net', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-20T09:30:00Z', lastLoginAt: '2024-03-04T17:00:00Z' },
        { id: '12', fullName: 'Emma Davis', email: 'emma.d@events.org', role: 'ORGANIZER', status: 'ACTIVE', createdAt: '2024-03-04T08:15:00Z' },
      ]
      setUsers(mockUsers)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    if (filters.role !== 'ALL' && user.role !== filters.role) return false
    if (filters.status !== 'ALL' && user.status !== filters.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      return (
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      )
    }
    return true
  })

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const activeFiltersCount = (filters.role !== 'ALL' ? 1 : 0) + (filters.status !== 'ALL' ? 1 : 0)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers)
    if (checked) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedUsers(newSelected)
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsUpdating(true)
    try {
      await adminApi.updateUserRole(userId, newRole)
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as UserData['role'] } : u))
      setEditingUser(null)
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await adminApi.updateUserStatus(userId, newStatus)
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as UserData['status'] } : u))
      setEditingUser(null)
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return
    setIsUpdating(true)
    try {
      await adminApi.bulkUpdateUsers(Array.from(selectedUsers), action)
      // Refresh users after bulk update
      await loadUsers()
      setSelectedUsers(new Set())
    } catch (err) {
      console.error('Failed to perform bulk action:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const clearFilters = () => {
    setFilters({ role: 'ALL', status: 'ALL', search: '' })
    setCurrentPage(1)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-purple-100 text-purple-700',
      ORGANIZER: 'bg-coral-100 text-coral-700',
      USER: 'bg-warmgray-100 text-warmgray-700',
    }
    const icons = {
      ADMIN: Shield,
      ORGANIZER: UserCheck,
      USER: User,
    }
    const Icon = icons[role as keyof typeof icons]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[role as keyof typeof styles]}`}>
        <Icon className="h-3 w-3" />
        {role.charAt(0) + role.slice(1).toLowerCase()}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      INACTIVE: 'bg-warmgray-100 text-warmgray-600',
      SUSPENDED: 'bg-red-100 text-red-700',
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status === 'ACTIVE' ? <CheckCircle className="h-3 w-3" /> : status === 'SUSPENDED' ? <XCircle className="h-3 w-3" /> : null}
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-heading-lg font-bold text-warmgray-900">Manage Users</h2>
          <p className="text-warmgray-600 mt-1">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} 
            {activeFiltersCount > 0 && ` (filtered from ${users.length})`}
          </p>
        </div>
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-warmgray-600">{selectedUsers.size} selected</span>
            <select
              onChange={(e) => handleBulkAction(e.target.value)}
              className="input py-2 text-sm w-40"
              defaultValue=""
            >
              <option value="" disabled>Bulk Actions...</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="make_organizer">Make Organizer</option>
              <option value="make_user">Make User</option>
            </select>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value })
                setCurrentPage(1)
              }}
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warmgray-400 hover:text-warmgray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-warmgray-400" />
            <select
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value })
                setCurrentPage(1)
              }}
              className="input py-2 text-sm w-36"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value })
              setCurrentPage(1)
            }}
            className="input py-2 text-sm w-36"
          >
            {STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="btn-ghost text-sm py-2 px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warmgray-100">
            <span className="text-xs text-warmgray-500">Active filters:</span>
            {filters.role !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Role: {filters.role}
                <button onClick={() => setFilters({ ...filters, role: 'ALL' })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-coral-50 text-coral-700 text-xs">
                Status: {filters.status}
                <button onClick={() => setFilters({ ...filters, status: 'ALL' })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No users found</h3>
          <p className="text-warmgray-600 mt-1">
            {filters.search || activeFiltersCount > 0 
              ? 'Try adjusting your filters.' 
              : 'No users in the system yet.'}
          </p>
          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="btn-primary mt-4">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-warmgray-50 border-b border-warmgray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id))}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-warmgray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray-100">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-warmgray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                        className="rounded border-warmgray-300 text-coral-600 focus:ring-coral-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-warmgray-900">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-warmgray-600">{user.email}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-warmgray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="btn-ghost text-xs py-1.5 px-2"
                          title="Edit User"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                          className={`btn-ghost text-xs py-1.5 px-2 ${user.status === 'ACTIVE' ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
                          title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'ACTIVE' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-warmgray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-warmgray-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-ghost text-sm py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-warmgray-900 mb-4">Edit User</h3>
            
            <div className="bg-warmgray-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-warmgray-900">{editingUser.fullName}</p>
              <p className="text-sm text-warmgray-600">{editingUser.email}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserData['role'] })}
                  className="input"
                >
                  {ROLES.filter(r => r.value !== 'ALL').map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-2">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as UserData['status'] })}
                  className="input"
                >
                  {STATUSES.filter(s => s.value !== 'ALL').map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="btn-outline flex-1"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleUpdateRole(editingUser.id, editingUser.role)
                  await handleUpdateStatus(editingUser.id, editingUser.status)
                }}
                className="btn-primary flex-1"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
