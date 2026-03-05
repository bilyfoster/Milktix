import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search, Plus, Trash2, Loader2, ExternalLink, Phone, Globe, Users } from 'lucide-react'
import { locationsApi } from '../utils/api'

interface Location {
  id: string
  name: string
  description?: string
  address: string
  city?: string
  state?: string
  zipCode?: string
  imageUrl?: string
  website?: string
  phone?: string
  capacity?: number
}

export function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const response = await locationsApi.getAll()
      setLocations(response.data || [])
    } catch (err) {
      console.error('Failed to load locations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (locationId: string) => {
    try {
      // await locationsApi.delete(locationId)
      setLocations(locations.filter(l => l.id !== locationId))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete location')
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-heading-lg font-bold text-warmgray-900">Manage Locations</h1>
          <p className="text-warmgray-600 mt-1">View and manage all venues and event locations.</p>
        </div>
        <Link to="/organizer/locations" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Add New Location
        </Link>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
          <input
            type="text"
            placeholder="Search locations by name, address, or city..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">Total Locations</p>
          <p className="text-2xl font-bold text-warmgray-900">{locations.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">With Capacity</p>
          <p className="text-2xl font-bold text-warmgray-900">
            {locations.filter(l => l.capacity && l.capacity > 0).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-warmgray-600">Cities</p>
          <p className="text-2xl font-bold text-warmgray-900">
            {new Set(locations.map(l => l.city).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No locations found</h3>
          <p className="text-warmgray-600 mt-1">
            {searchTerm ? 'Try a different search term.' : 'No venues in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <div key={location.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-warmgray-200 flex items-center justify-center overflow-hidden">
                  {location.imageUrl ? (
                    <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="h-8 w-8 text-warmgray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/locations/${location.id}`}
                    className="btn-ghost text-sm py-1.5 px-2"
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => setDeleteConfirm(location.id)}
                    className="btn-ghost text-sm py-1.5 px-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-warmgray-900 mb-1">{location.name}</h3>
              
              <p className="text-sm text-warmgray-600 mb-3">
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && `, ${location.state}`}
              </p>

              {location.description && (
                <p className="text-sm text-warmgray-500 mb-3 line-clamp-2">{location.description}</p>
              )}

              <div className="space-y-2 mb-4">
                {location.phone && (
                  <a href={`tel:${location.phone}`} className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600">
                    <Phone className="h-4 w-4" />
                    {location.phone}
                  </a>
                )}
                {location.website && (
                  <a href={location.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-warmgray-600 hover:text-coral-600">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-warmgray-200">
                {location.capacity ? (
                  <span className="text-sm text-warmgray-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Capacity: {location.capacity}
                  </span>
                ) : (
                  <span className="text-sm text-warmgray-400">No capacity set</span>
                )}
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === location.id && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700 mb-2">Delete this location?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDeleteConfirm(null)}
                      className="btn-outline text-xs flex-1"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleDelete(location.id)}
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
