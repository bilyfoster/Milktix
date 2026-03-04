import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PlusCircle, Globe, Phone, Loader2, Edit, ExternalLink, Calendar } from 'lucide-react'

interface Location {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state: string
  zipCode?: string
  imageUrl?: string
  website?: string
  phone?: string
  eventCount?: number
}

export function Locations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    website: '',
    imageUrl: ''
  })

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setLocations([
        {
          id: '1',
          name: 'Virtual Event',
          address: 'Online',
          city: '',
          state: '',
          eventCount: 2
        }
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const location: Location = {
      id: Date.now().toString(),
      ...newLocation,
      eventCount: 0
    }
    setLocations([...locations, location])
    setShowCreateForm(false)
    setNewLocation({
      name: '', description: '', address: '', city: '', state: '', zipCode: '',
      phone: '', website: '', imageUrl: ''
    })
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
          <h1 className="text-heading-lg font-bold text-warmgray-900">Locations</h1>
          <p className="text-warmgray-600 mt-1">Manage venues and locations for your events.</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Location
        </button>
      </div>

      {/* Create Location Form */}
      {showCreateForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-heading-sm font-bold text-warmgray-900 mb-6">Create New Location</h2>
          <form onSubmit={handleCreateLocation} className="space-y-4">
            <input
              type="text"
              placeholder="Venue Name *"
              required
              className="input"
              value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Address *"
              required
              className="input"
              value={newLocation.address}
              onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City *"
                required
                className="input"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State *"
                required
                className="input"
                value={newLocation.state}
                onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
              />
              <input
                type="text"
                placeholder="ZIP Code"
                className="input"
                value={newLocation.zipCode}
                onChange={(e) => setNewLocation({ ...newLocation, zipCode: e.target.value })}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Phone"
                className="input"
                value={newLocation.phone}
                onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
              />
              <input
                type="url"
                placeholder="Website"
                className="input"
                value={newLocation.website}
                onChange={(e) => setNewLocation({ ...newLocation, website: e.target.value })}
              />
            </div>
            <input
              type="url"
              placeholder="Venue Image URL"
              className="input"
              value={newLocation.imageUrl}
              onChange={(e) => setNewLocation({ ...newLocation, imageUrl: e.target.value })}
            />
            <textarea
              placeholder="Description"
              rows={3}
              className="input"
              value={newLocation.description}
              onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
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
                Create Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Locations Grid */}
      {locations.length === 0 ? (
        <div className="card p-12 text-center">
          <MapPin className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No locations yet</h3>
          <p className="text-warmgray-600 mt-1 mb-6">
            Add venues and locations to use for your events.
          </p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Add Your First Location
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div key={location.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-warmgray-200 flex items-center justify-center overflow-hidden">
                  {location.imageUrl ? (
                    <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
                  ) : (
                    <MapPin className="h-8 w-8 text-warmgray-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-sm py-1 px-2">
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-warmgray-900 mb-1">{location.name}</h3>
              
              <p className="text-sm text-warmgray-600 mb-2">
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && `, ${location.state}`}
              </p>

              {location.description && (
                <p className="text-sm text-warmgray-500 mb-4 line-clamp-2">{location.description}</p>
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

              <div className="flex items-center justify-between pt-4 border-t border-warmgray-200">
                <span className="text-sm text-warmgray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {location.eventCount || 0} events
                </span>
                <Link 
                  to={`/locations/${location.id}`}
                  className="text-coral-600 hover:text-coral-700 text-sm font-medium flex items-center gap-1"
                >
                  View Events
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
