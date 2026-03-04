import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Calendar, MapPin, Trash2, Ticket } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { usersApi } from '../utils/api'
import type { Event } from '../types'
import { format } from 'date-fns'

export function SavedEvents() {
  const { user } = useAuthStore()
  const [savedEvents, setSavedEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSavedEvents()
  }, [])

  const fetchSavedEvents = async () => {
    try {
      setIsLoading(true)
      const response = await usersApi.getSavedEvents()
      setSavedEvents(response.data as Event[])
    } catch (err) {
      setError('Failed to load saved events')
    } finally {
      setIsLoading(false)
    }
  }

  const removeSavedEvent = async (eventId: string) => {
    try {
      await usersApi.removeSavedEvent(eventId)
      setSavedEvents(savedEvents.filter(e => e.id !== eventId))
    } catch (err) {
      console.error('Failed to remove saved event:', err)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to save events</h2>
          <p className="text-gray-600 mb-6">Create an account to save events you're interested in.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Events</h1>
              <p className="text-sm text-gray-600 mt-1">{savedEvents.length} events saved</p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {savedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved events</h3>
            <p className="text-gray-600 mb-6">Events you save will appear here.</p>
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Discover Events
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
                <div className="relative h-48">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeSavedEvent(event.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-lg">
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {format(new Date(event.startDateTime), 'MMM')}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {format(new Date(event.startDateTime), 'd')}
                    </div>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <Link to={`/events/${event.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                  </Link>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{format(new Date(event.startDateTime), 'EEEE, MMM d • h:mm a')}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{event.venueName}, {event.venueCity}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      to={`/events/${event.id}`}
                      className="block w-full text-center px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Get Tickets
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
