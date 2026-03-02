import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Ticket, Share2, Heart } from 'lucide-react'
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-error-500" />
        </div>
        <h2 className="text-xl font-semibold text-warmgray-900 mb-2">Event not found</h2>
        <p className="text-warmgray-600">This event may have been removed or is no longer available.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Hero Image */}
      <div className="h-64 md:h-96 bg-warmgray-200 relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-coral">
            <Calendar className="h-24 w-24 text-white/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="container-custom -mt-16 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categories.map((category) => (
                  <span key={category.id} className="badge-coral">
                    {category.name}
                  </span>
                ))}
              </div>

              <h1 className="text-display-sm md:text-heading-lg font-bold text-warmgray-900">{event.title}</h1>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-coral-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warmgray-900">
                      {format(new Date(event.startDateTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-warmgray-600">
                      {format(new Date(event.startDateTime), 'h:mm a')} - {format(new Date(event.endDateTime), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-warmgray-900">{event.venueName}</p>
                    <p className="text-warmgray-600">
                      {event.venueAddress}, {event.venueCity}, {event.venueState} {event.venueZip}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 md:p-8 mt-6">
              <h2 className="text-heading-sm font-bold text-warmgray-900 mb-4">About This Event</h2>
              <div className="prose prose-warmgray max-w-none">
                {event.description?.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-warmgray-600 whitespace-pre-line">
                    {paragraph}
                  </p>
                )) || <p className="text-warmgray-500">No description available.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-coral-600" />
                </div>
                <h2 className="text-heading-sm font-bold text-warmgray-900">Tickets</h2>
              </div>

              {event.ticketTypes.length === 0 ? (
                <p className="text-warmgray-500">No tickets available.</p>
              ) : (
                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`border-2 rounded-xl p-4 transition-all ${
                        ticket.isAvailable 
                          ? 'border-warmgray-200 hover:border-coral-300 hover:shadow-soft' 
                          : 'border-warmgray-100 bg-warmgray-50 opacity-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-warmgray-900">{ticket.name}</h3>
                          <p className="text-sm text-warmgray-500 mt-1">{ticket.description}</p>
                          {!ticket.isAvailable && (
                            <p className="text-xs text-error-500 mt-1">Sold out or unavailable</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-warmgray-900">${ticket.price}</p>
                        </div>
                      </div>

                      <button 
                        disabled={!ticket.isAvailable}
                        className={`w-full mt-4 py-3 px-4 rounded-xl font-semibold transition-all ${
                          ticket.isAvailable
                            ? 'btn-primary'
                            : 'bg-warmgray-200 text-warmgray-400 cursor-not-allowed'
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
    </div>
  )
}
