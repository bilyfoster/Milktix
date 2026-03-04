import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Globe, Calendar, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'

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
  eventCount: number
}

export function LocationPage() {
  const { id } = useParams()
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setLocation({
        id: id || '1',
        name: 'Downtown Convention Center',
        description: 'A premier venue for conferences, concerts, and special events in the heart of the city.',
        address: '123 Main Street',
        city: 'Downtown',
        state: 'CA',
        zipCode: '90210',
        eventCount: 12,
        phone: '+1 (555) 123-4567',
        website: 'https://example.com/venue'
      })
      setIsLoading(false)
    }, 500)
  }, [id])

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-warmgray-200 rounded-2xl mb-6"></div>
          <div className="h-8 bg-warmgray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-warmgray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold text-warmgray-900">Location not found</h1>
        <Link to="/" className="text-coral-600 hover:text-coral-700 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-warmgray-600 hover:text-coral-600 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Image */}
            <div className="h-64 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              {location.imageUrl ? (
                <img src={location.imageUrl} alt={location.name} className="w-full h-full object-cover" />
              ) : (
                <MapPin className="h-20 w-20 text-white/50" />
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-warmgray-900 mb-2">{location.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-warmgray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {location.eventCount} events
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location.city}, {location.state}
                </span>
              </div>

              {location.description && (
                <p className="text-warmgray-600 mb-6">{location.description}</p>
              )}

              {/* Address */}
              <div className="bg-warmgray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-warmgray-900 mb-2">Address</h3>
                <p className="text-warmgray-600">
                  {location.address}<br />
                  {location.city}, {location.state} {location.zipCode}
                </p>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${location.address}, ${location.city}, ${location.state}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-coral-600 hover:text-coral-700 text-sm font-medium mt-2"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-4">
                {location.phone && (
                  <a href={`tel:${location.phone}`} className="btn-outline text-sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                )}
                {location.website && (
                  <a href={location.website} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Events at this location */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-heading-xs font-bold text-warmgray-900">Events Here</h2>
            </div>
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-warmgray-400 mx-auto mb-3" />
              <p className="text-warmgray-600">No upcoming events at this location.</p>
              <Link to="/events" className="text-coral-600 hover:text-coral-700 text-sm font-medium mt-2 inline-block">
                Browse all events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
