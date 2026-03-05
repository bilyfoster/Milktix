import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, Plus, Trash2, Loader2, ExternalLink, Mail, Phone, Globe } from 'lucide-react'
import { hostsApi } from '../utils/api'

interface Host {
  id: string
  name: string
  bio?: string
  imageUrl?: string
  website?: string
  email?: string
  phone?: string
  user?: {
    fullName: string
    email: string
  }
  createdAt?: string
}

export function AdminHosts() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadHosts()
  }, [])

  const loadHosts = async () => {
    try {
      // For now, we'll get all hosts via search (we may need a new admin endpoint)
      const response = await hostsApi.getAll()
      setHosts(response.data || [])
    } catch (err) {
      console.error('Failed to load hosts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (hostId: string) => {
    try {
      // await hostsApi.delete(hostId)
      setHosts(hosts.filter(h => h.id !== hostId))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete host')
    }
  }

  const filteredHosts = hosts.filter(host =>
    host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-heading-lg font-bold text-warmgray-900">Manage Hosts</h1>
          <p className="text-warmgray-600 mt-1">View and manage all event hosts in the system.</p>
        </div>
        <Link to="/organizer/hosts" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Create New Host
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
          <input
            type="text"
            placeholder="Search hosts by name, bio, or email..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Hosts Grid */}
      {filteredHosts.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No hosts found</h3>
          <p className="text-warmgray-600 mt-1">
            {searchTerm ? 'Try a different search term.' : 'No hosts in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHosts.map((host) => (
            <div key={host.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-warmgray-200 flex items-center justify-center overflow-hidden">
                  {host.imageUrl ? (
                    <img src={host.imageUrl} alt={host.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-warmgray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/hosts/${host.id}`}
                    className="btn-ghost text-sm py-1.5 px-2"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => setDeleteConfirm(host.id)}
                    className="btn-ghost text-sm py-1.5 px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-warmgray-900 mb-1">{host.name}</h3>
              
              {host.bio && (
                <p className="text-sm text-warmgray-600 mb-3 line-clamp-2">{host.bio}</p>
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

              {host.user && (
                <div className="pt-3 border-t border-warmgray-200">
                  <p className="text-xs text-warmgray-500">
                    Created by: {host.user.fullName} ({host.user.email})
                  </p>
                </div>
              )}

              {/* Delete Confirmation */}
              {deleteConfirm === host.id && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Delete this host?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDeleteConfirm(null)}
                      className="btn-outline text-xs flex-1"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(host.id)}
                      className="btn-primary text-xs flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
