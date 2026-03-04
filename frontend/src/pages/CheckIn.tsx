import { useState, useEffect } from 'react'
import { QrCode, Search, CheckCircle, XCircle, Users, Ticket } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { eventsApi, checkInApi } from '../utils/api'
import type { Event } from '../types'

interface Attendee {
  id: string
  name: string
  email: string
  ticketType: string
  ticketNumber: string
  checkedIn: boolean
  checkInTime?: string
}

interface TicketData {
  id: string
  ticketNumber: string
  ticketType: {
    name: string
  }
  attendeeName: string
  attendeeEmail: string
  status: string
  checkedInAt?: string
}

export function CheckIn() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch organizer's events
  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await eventsApi.getMyEvents()
      setEvents(response.data as Event[])
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedEvent) {
      // For now, we don't have a direct endpoint to get attendees by event
      // This would need to be implemented in the backend
      // For now, we'll use mock data based on the event
      setAttendees([])
    }
  }, [selectedEvent])

  const handleCheckIn = async (ticketNumber: string) => {
    try {
      const response = await checkInApi.checkIn(ticketNumber)
      const data = response.data

      if (data.success) {
        setAttendees(attendees.map(attendee =>
          attendee.ticketNumber === ticketNumber
            ? { ...attendee, checkedIn: true, checkInTime: data.checkedInAt }
            : attendee
        ))
        setScanResult({ success: true, message: `Checked in: ${data.attendeeName}` })
      } else {
        setScanResult({ success: false, message: data.message })
      }
    } catch (err) {
      setScanResult({ success: false, message: 'Check-in failed' })
    }

    setTimeout(() => setScanResult(null), 3000)
  }

  const handleScan = async (ticketNumber: string) => {
    try {
      // First verify the ticket
      const verifyResponse = await checkInApi.verifyTicket(ticketNumber)
      const verifyData = verifyResponse.data

      if (!verifyData.valid) {
        setScanResult({ success: false, message: verifyData.message || 'Invalid ticket' })
        setTimeout(() => setScanResult(null), 3000)
        return
      }

      // If valid and not already checked in, perform check-in
      if (!verifyData.checkedIn) {
        await handleCheckIn(ticketNumber)
      } else {
        setScanResult({ success: false, message: 'Already checked in' })
        setTimeout(() => setScanResult(null), 3000)
      }
    } catch (err) {
      setScanResult({ success: false, message: 'Verification failed' })
      setTimeout(() => setScanResult(null), 3000)
    }
  }

  const filteredAttendees = attendees.filter(attendee =>
    attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const checkedInCount = attendees.filter(a => a.checkedIn).length

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organizer Access Only</h2>
          <p className="text-gray-600 mb-6">Please sign in as an organizer to check in guests.</p>
        </div>
      </div>
    )
  }

  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Check-In</h1>
            <p className="text-sm text-gray-600 mt-1">Select an event to start checking in guests</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ticket className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500">Create an event to start checking in guests.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Ticket className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(event.startDateTime).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      {event.ticketTypes.reduce((sum, tt) => sum + tt.quantitySold, 0)} sold
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-indigo-600 font-medium text-sm">
                      Start Check-In →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-sm text-gray-500 hover:text-gray-700 mb-1"
              >
                ← Back to events
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h1>
              <p className="text-sm text-gray-600">{new Date(selectedEvent.startDateTime).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {checkedInCount} / {attendees.length}
                </div>
                <div className="text-sm text-gray-500">Checked in</div>
              </div>

              <button
                onClick={() => setScanning(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Attendees List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {attendees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendees yet</h3>
            <p className="text-gray-500">Attendees will appear here once tickets are sold.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAttendees.map((attendee) => (
              <div
                key={attendee.id}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
                  attendee.checkedIn ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    attendee.checkedIn ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {attendee.checkedIn ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-gray-900">{attendee.name}</div>
                    <div className="text-sm text-gray-500">{attendee.email}</div>
                    <div className="text-sm text-indigo-600">{attendee.ticketType}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {attendee.checkedIn ? (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Checked in</div>
                      <div className="text-xs text-gray-500">
                        {attendee.checkInTime && new Date(attendee.checkInTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(attendee.ticketNumber)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Check In
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {scanning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Scan Ticket QR Code</h2>
              <p className="text-gray-600 mt-1">Enter ticket number to check in</p>
            </div>

            {/* Manual Entry */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter ticket number..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScan((e.target as HTMLInputElement).value)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>

            {scanResult && (
              <div className={`p-4 rounded-xl mb-6 ${scanResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {scanResult.message}
              </div>
            )}

            <button
              onClick={() => {
                setScanning(false)
                setScanResult(null)
              }}
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
