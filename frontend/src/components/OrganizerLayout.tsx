import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, PlusCircle, MapPin, Users, Ticket, LogOut, ChevronLeft, ShoppingCart, Repeat } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { getVersionString } from '../version'

export function OrganizerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const isActive = (path: string) => location.pathname.startsWith(path)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { path: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/organizer/create-event', label: 'Create Event', icon: PlusCircle },
    { path: '/organizer/manage-events', label: 'My Events', icon: Calendar },
    { path: '/organizer/templates', label: 'Templates', icon: Repeat },
    { path: '/organizer/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/organizer/hosts', label: 'Hosts', icon: Users },
    { path: '/organizer/locations', label: 'Locations', icon: MapPin },
  ]

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Header */}
      <header className="bg-white border-b border-warmgray-200 sticky top-0 z-40">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center shadow-soft">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-warmgray-900">MilkTix</span>
              </Link>
              <span className="text-warmgray-300">|</span>
              <Link to="/" className="text-sm text-warmgray-600 hover:text-coral-600 flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to Site
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-warmgray-600 hidden sm:block">
                {user?.fullName || user?.username}
              </span>
              <button 
                onClick={handleLogout}
                className="btn-ghost text-sm"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-warmgray-200 min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-coral-600 bg-coral-50'
                      : 'text-warmgray-600 hover:bg-warmgray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-coral-600 bg-coral-50'
                          : 'text-warmgray-600 hover:bg-warmgray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-coral-600 text-white rounded-full shadow-lg flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <LayoutDashboard className="h-6 w-6" />
        </button>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-warmgray-200 py-4">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-warmgray-500">
            <p>© 2026 MilkTix. All rights reserved.</p>
            <span className="text-xs bg-warmgray-100 px-2 py-1 rounded">
              {getVersionString()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
