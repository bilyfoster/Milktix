import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Mail, Globe, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Host {
  id: string
  name: string
  bio: string
  imageUrl?: string
  website?: string
  email?: string
  phone?: string
  eventCount: number
}

export function HostProfile() {
  const { id } = useParams()
  const [host, setHost] = useState<Host | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setHost({
        id: id || '1',
        name: 'Sample Host Organization',
        bio: 'We organize amazing events and experiences for our community.',
        eventCount: 5,
        website: 'https://example.com',
        email: 'contact@example.com'
      })
      setIsLoading(false)
    }, 500)
  }, [id])

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse">
          <div className="h-32 bg-warmgray-200 rounded-2xl mb-6"></div>
          <div className="h-8 bg-warmgray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-warmgray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!host) {
    return (
      <div className="container-custom py-12 text-center">
        <h1 className="text-2xl font-bold text-warmgray-900">Host not found</h1>
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

      <div className="card overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-coral-500 to-coral-600"></div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-2 shadow-lg">
              {host.imageUrl ? (
                <img src={host.imageUrl} alt={host.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <div className="w-full h-full rounded-xl bg-coral-100 flex items-center justify-center">
                  <Users className="h-10 w-10 text-coral-600" />
                </div>
              )}
            </div>
            <div className="flex-1 pt-12 md:pt-0">
              <h1 className="text-2xl font-bold text-warmgray-900">{host.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-warmgray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {host.eventCount} events
                </span>
                {host.email && (
                  <a href={`mailto:${host.email}`} className="flex items-center gap-1 hover:text-coral-600">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {host.website && (
                  <a href={host.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-coral-600">
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-lg font-semibold text-warmgray-900 mb-2">About</h2>
            <p className="text-warmgray-600">{host.bio}</p>
          </div>

          {/* Events Section */}
          <div className="mt-8">
            <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">Upcoming Events</h2>
            <div className="text-center py-12 bg-warmgray-50 rounded-xl">
              <MapPin className="h-12 w-12 text-warmgray-400 mx-auto mb-3" />
              <p className="text-warmgray-600">No upcoming events at this time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
