import { Link } from 'react-router-dom'
import { Calendar, MapPin, Search, Filter, ChevronRight, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '../utils/api'
import type { Event } from '../types'

export function Events() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventsApi.getAll()
      return response.data as Event[]
    },
  })

  const categories = ['all', 'Music', 'Tech', 'Sports', 'Arts', 'Food', 'Business']

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venueCity.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           event.categories?.some(c => c.name === selectedCategory)
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-warmgray-600">Loading amazing events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-warmgray-900 mb-2">Unable to load events</h2>
          <p className="text-warmgray-600 mb-4">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmgray-50">
      {/* Header */}
      <div className="bg-white border-b border-warmgray-200">
        <div className="container-custom py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-heading-lg font-bold text-warmgray-900">Discover Events</h1>
              <p className="text-warmgray-600 mt-1">{filteredEvents?.length || 0} upcoming events</p>
            </div>
            
            <Link
              to="/register"
              className="btn-primary text-sm inline-flex"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="container-custom py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-warmgray-400" />
            <input
              type="text"
              placeholder="Search events, venues, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>
          
          {/* Category Filter - Horizontal Scroll on Mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <Filter className="h-5 w-5 text-warmgray-400 flex-shrink-0 self-center" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-coral-500 text-white shadow-soft'
                    : 'bg-white text-warmgray-700 border border-warmgray-200 hover:border-coral-300 hover:text-coral-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container-custom pb-16">
        {filteredEvents?.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-warmgray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-warmgray-400" />
            </div>
            <h3 className="text-lg font-semibold text-warmgray-900 mb-2">No events found</h3>
            <p className="text-warmgray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents?.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="card-interactive group"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full gradient-coral flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-soft">
                    <div className="text-xs font-bold text-coral-600 uppercase tracking-wider">
                      {format(new Date(event.startDateTime), 'MMM')}
                    </div>
                    <div className="text-2xl font-bold text-warmgray-900">
                      {format(new Date(event.startDateTime), 'd')}
                    </div>
                  </div>
                  
                  {/* Category Tags */}
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {event.categories?.slice(0, 2).map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="text-heading-sm font-bold text-warmgray-900 group-hover:text-coral-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="mt-2 text-warmgray-600 text-body-sm line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-body-sm text-warmgray-500">
                      <Calendar className="h-4 w-4 mr-2 text-coral-500" />
                      <span>{format(new Date(event.startDateTime), 'EEEE, MMM d • h:mm a')}</span>
                    </div>
                    
                    <div className="flex items-center text-body-sm text-warmgray-500">
                      <MapPin className="h-4 w-4 mr-2 text-coral-500" />
                      <span className="truncate">{event.venueName}, {event.venueCity}</span>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="mt-5 pt-4 border-t border-warmgray-100 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-warmgray-900">
                        ${Math.min(...event.ticketTypes.map(t => t.price))}
                      </span>
                      <span className="text-sm text-warmgray-500">+</span>
                    </div>
                    
                    <div className="flex items-center text-coral-600 font-semibold text-sm">
                      Get Tickets
                      <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
