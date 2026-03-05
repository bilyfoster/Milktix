import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Users, MapPin, Shield, Building2, ChevronLeft, LogOut, Loader2, Ticket } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useEffect } from 'react'
import { getVersionString } from '../version'

const adminLinks = [
  { path: '/admin/organizer-requests', label: 'Organizer Requests', icon: Building2 },
  { path: '/admin/hosts', label: 'Manage Hosts', icon: Users },
  { path: '/admin/locations', label: 'Manage Locations', icon: MapPin },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout } = useAuthStore()
  
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
  
  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Admin Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/" className="btn-ghost text-sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2 text-warmgray-400">
            <span>/</span>
            <span className="text-warmgray-900">Admin Panel</span>
          </div>
        </div>
        
        <div className="card p-6 bg-gradient-to-r from-coral-600 to-coral-500 text-white border-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-coral-100">Manage organizer requests, hosts, and venues</p>
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
