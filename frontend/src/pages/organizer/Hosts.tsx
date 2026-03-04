import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, PlusCircle, Mail, Phone, Globe, Loader2, Edit, ExternalLink } from 'lucide-react'

interface Host {
  id: string
  name: string
  bio?: string
  imageUrl?: string
  website?: string
  email?: string
  phone?: string
  eventCount?: number
}

export function Hosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newHost, setNewHost] = useState({
    name: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    imageUrl: ''
  })

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setHosts([
        {
          id: '1',
          name: 'Your Organization',
          bio: 'Default host profile for your events',
          eventCount: 3
        }
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleCreateHost = (e: React.FormEvent) => {
    e.preventDefault()
    const host: Host = {
      id: Date.now().toString(),
      ...newHost,
      eventCount: 0
    }
    setHosts([...hosts, host])
    setShowCreateForm(false)
    setNewHost({ name: '', bio: '', email: '', phone: '', website: '', imageUrl: '' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-heading-lg font-bold text-warmgray-900">Hosts</h1>
          <p className="text-warmgray-600 mt-1">Manage hosts and presenters for your events.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Host
        </button>
      </div>

      {/* Create Host Form */}
      {showCreateForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-heading-sm font-bold text-warmgray-900 mb-6">Create New Host</h2>
          <form onSubmit={handleCreateHost} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Host Name *"
                required
                className="input"
                value={newHost.name}
                onChange={(e) => setNewHost({ ...newHost, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="input"
                value={newHost.email}
                onChange={(e) => setNewHost({ ...newHost, email: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Phone"
                className="input"
                value={newHost.phone}
                onChange={(e) => setNewHost({ ...newHost, phone: e.target.value })}
              />
              <input
                type="url"
                placeholder="Website"
                className="input"
                value={newHost.website}
                onChange={(e) => setNewHost({ ...newHost, website: e.target.value })}
              />
            </div>
            <input
              type="url"
              placeholder="Profile Image URL"
              className="input"
              value={newHost.imageUrl}
              onChange={(e) => setNewHost({ ...newHost, imageUrl: e.target.value })}
            />
            <textarea
              placeholder="Bio"
              rows={3}
              className="input"
              value={newHost.bio}
              onChange={(e) => setNewHost({ ...newHost, bio: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Create Host
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hosts Grid */}
      {hosts.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No hosts yet</h3>
          <p className="text-warmgray-600 mt-1 mb-6">
            Add hosts to associate them with your events.
          </p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Your First Host
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.map((host) => (
            <div key={host.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-warmgray-200 flex items-center justify-center overflow-hidden">
                  {host.imageUrl ? (
                    <img src={host.imageUrl} alt={host.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-warmgray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-sm py-1 px-2">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-warmgray-900 mb-1">{host.name}</h3>
              
              {host.bio && (
                <p className="text-sm text-warmgray-600 mb-4 line-clamp-2">{host.bio}</p>
              )}

              <div className="space-y-2 mb-4">
                {host.email && (
                  <a href={`mailto:${host.email}`} className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600">
                    <Mail className="h-4 w-4" />
                    {host.email}
                  </a>
                )}
                {host.phone && (
                  <a href={`tel:${host.phone}`} className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600">
                    <Phone className="h-4 w-4" />
                    {host.phone}
                  </a>
                )}
                {host.website && (
                  <a href={host.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-warmgray-200">
                <span className="text-sm text-warmgray-600">
                  {host.eventCount || 0} events
                </span>
                <Link 
                  to={`/hosts/${host.id}`}
                  className="text-coral-600 hover:text-coral-700 text-sm font-medium flex items-center gap-1"
                >
                  View Profile
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
