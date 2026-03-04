import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, User, Menu, X, Ticket, Plus, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-warmgray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-warmgray-200 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl gradient-coral flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-warmgray-900">MilkTix</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-coral-600 bg-coral-50' 
                    : 'text-warmgray-600 hover:text-coral-600 hover:bg-warmgray-100'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/events" 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/events') 
                    ? 'text-coral-600 bg-coral-50' 
                    : 'text-warmgray-600 hover:text-coral-600 hover:bg-warmgray-100'
                }`}
              >
                Events
              </Link>
            </nav>
            
            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-warmgray-600">
                    Hello, {user?.fullName || user?.username}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="btn-ghost text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-1.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn-ghost text-sm"
                  >
                    <User className="h-4 w-4 mr-1.5" />
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary text-sm py-2.5"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Event
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-warmgray-600 hover:text-coral-600 hover:bg-coral-50 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="container-custom py-4 border-t border-warmgray-100 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive('/') 
                  ? 'text-coral-600 bg-coral-50' 
                  : 'text-warmgray-700 hover:bg-warmgray-100'
              }`}
            >
              <Calendar className="h-5 w-5" />
              Home
            </Link>
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive('/events') 
                  ? 'text-coral-600 bg-coral-50' 
                  : 'text-warmgray-700 hover:bg-warmgray-100'
              }`}
            >
              <Ticket className="h-5 w-5" />
              Events
            </Link>
            <div className="pt-2 border-t border-warmgray-100 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-warmgray-600">
                    Hello, {user?.fullName || user?.username}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-warmgray-700 hover:bg-warmgray-100"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-warmgray-700 hover:bg-warmgray-100"
                  >
                    <User className="h-5 w-5" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-coral-600 bg-coral-50 mt-2"
                  >
                    <Plus className="h-5 w-5" />
                    Create Event
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-warmgray-900 text-white">
        <div className="container-custom py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-coral flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">MilkTix</span>
              </Link>
              <p className="text-warmgray-400 text-sm">
                The modern ticketing platform for creators and event organizers.
              </p>
            </div>
            
            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-warmgray-400">
                <li><Link to="/events" className="hover:text-white transition-colors">Find Events</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Event</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-warmgray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-warmgray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-warmgray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-warmgray-500 text-sm">
              © 2026 MilkTix. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-warmgray-500 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="text-warmgray-500 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
