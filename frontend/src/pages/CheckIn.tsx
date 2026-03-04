import { useState, useEffect } from 'react'
import { QrCode, Search, CheckCircle, XCircle, Users, Ticket } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface Attendee {
  id: string
  name: string
  email: string
  ticketType: string
  checkedIn: boolean
  checkInTime?: string
}

interface Event {
  id: string
  title: string
  date: string
  totalAttendees: number
  checkedInCount: number
}

export function CheckIn() {
  const { user } = useAuthStore()
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [scanning, setScanning] = useState(false)

  // Mock events data
  const events: Event[] = [
    {
      id: 'evt-001',
      title: 'Summer Music Festival',
      date: '2026-06-15',
      totalAttendees: 250,
      checkedInCount: 45
    },
    {
      id: 'evt-002',
      title: 'Tech Conference 2026',
      date: '2026-04-20',
      totalAttendees: 150,
      checkedInCount: 0
    }
  ]

  useEffect(() => {
    if (selectedEvent) {
      // Mock attendees data
      setAttendees([
        {
          id: 'att-001',
          name: 'John Smith',
          email: 'john@example.com',
          ticketType: 'General Admission',
          checkedIn: true,
          checkInTime: '2026-06-15T18:30:00'
        },
        {
          id: 'att-002',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          ticketType: 'VIP',
          checkedIn: false
        },
        {
          id: 'att-003',
          name: 'Mike Davis',
          email: 'mike@example.com',
          ticketType: 'General Admission',
          checkedIn: false
        }
      ])
    }
  }, [selectedEvent])

  const handleCheckIn = (attendeeId: string) => {
    setAttendees(attendees.map(attendee =>
      attendee.id === attendeeId
        ? { ...attendee, checkedIn: true, checkInTime: new Date().toISOString() }
        : attendee
    ))
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
                    {event.date}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    {event.totalAttendees} guests
                  </div>
                  <div className="text-green-600 font-medium">
                    {event.checkedInCount} checked in
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
              <p className="text-sm text-gray-600">{selectedEvent.date}</p>
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
                    onClick={() => handleCheckIn(attendee.id)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Check In
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
              <p className="text-gray-600 mt-1">Position the QR code in the frame</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-8 mb-6">
              <div className="w-48 h-48 bg-white mx-auto rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Camera preview</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setScanning(false)}
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
