import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Users, MapPin, Shield, Building2, ChevronLeft, LogOut, Loader2, Ticket, Calendar, BarChart3, UserCircle, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useEffect, useState } from 'react'
import { getVersionString } from '../version'

const adminLinks = [
  { path: '/admin/events', label: 'Manage Events', icon: Calendar },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/organizer-requests', label: 'Organizer Requests', icon: Building2 },
  { path: '/admin/hosts', label: 'Manage Hosts', icon: UserCircle },
  { path: '/admin/locations', label: 'Manage Locations', icon: MapPin },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=/admin/organizer-requests')
    } else if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      navigate('/')
    }
  }, [isLoading, isAuthenticated, user, navigate])
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }
  
  // Don't render if not admin
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null
  }
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Bar with Profile */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-ghost text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 text-warmgray-400">
            <span>/</span>
            <span className="text-warmgray-900">Admin Panel</span>
          </div>
        </div>
        
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-warmgray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center text-white text-sm font-medium">
              {user?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-warmgray-900">{user?.fullName}</p>
              <p className="text-xs text-warmgray-500">{user?.role}</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-warmgray-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showProfileDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowProfileDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-warmgray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-warmgray-100">
                  <p className="font-medium text-warmgray-900">{user?.fullName}</p>
                  <p className="text-sm text-warmgray-500">{user?.email}</p>
                </div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <UserCircle className="h-4 w-4" />
                  My Profile
                </Link>
                <Link 
                  to="/organizer/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-warmgray-700 hover:bg-warmgray-50"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <Calendar className="h-4 w-4" />
                  Organizer Dashboard
                </Link>
                <div className="border-t border-warmgray-100 my-2" />
                <button
                  onClick={() => {
                    setShowProfileDropdown(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Header */}
      <div className="mb-8">
        <div className="card p-6 bg-gradient-to-r from-coral-600 to-coral-500 text-white border-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-coral-100">Manage users, events, organizer requests, hosts, and venues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="card p-2 space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-coral-600 bg-coral-50'
                      : 'text-warmgray-600 hover:text-coral-600 hover:bg-warmgray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
            
            <div className="border-t border-warmgray-200 my-2" />
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-warmgray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-warmgray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-coral flex items-center justify-center">
              <Ticket className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-warmgray-700">MilkTix</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-warmgray-500">
            <span>© 2026 MilkTix. All rights reserved.</span>
            <span className="text-xs bg-warmgray-100 px-2 py-1 rounded">
              {getVersionString()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
