import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '../utils/api'
import type { Event } from '../types'

export function EventDetail() {
  const { id } = useParams()
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await eventsApi.getById(id!)
      return response.data as Event
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Event not found or error loading event.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Hero Image */}
        <div className="h-64 md:h-96 bg-gray-200 relative">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
              <Calendar className="h-24 w-24 text-white opacity-50" />
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.title}</h1>

          {/* Date & Time */}
          <div className="mt-6 space-y-3">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">
                  {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-gray-600">
                  {format(new Date(event.startDateTime), 'h:mm a')} - {format(new Date(event.endDateTime), 'h:mm a')}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{event.venueName}</p>
                <p className="text-gray-600">
                  {event.venueAddress}, {event.venueCity}, {event.venueState} {event.venueZip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-8">
        {/* Description */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
            <div className="prose prose-gray max-w-none">
              {event.description?.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-600 whitespace-pre-line">
                  {paragraph}
                </p>
              )) || <p className="text-gray-500">No description available.</p>}
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Tickets
            </h2>

            {event.ticketTypes.length === 0 ? (
              <p className="text-gray-500">No tickets available.</p>
            ) : (
              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      ticket.isAvailable 
                        ? 'border-gray-200 hover:border-primary-300' 
                        : 'border-gray-100 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
                        {!ticket.isAvailable && (
                          <p className="text-xs text-red-500 mt-1">Sold out or unavailable</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${ticket.price}</p>
                      </div>
                    </div>

                    <button 
                      disabled={!ticket.isAvailable}
                      className={`w-full mt-3 py-2 px-4 rounded-md font-medium transition-colors ${
                        ticket.isAvailable
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {ticket.isAvailable ? 'Select' : 'Unavailable'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}