import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { QrCode, Search, UserCheck, UserX, RotateCcw, Users } from 'lucide-react'
import api from '../../utils/api'

interface Attendee {
  ticketNumber: string
  attendeeName: string
  ticketType: string
  attendeeEmail: string
  status: string
  checkedInAt: string | null
}

interface CheckInStats {
  totalTickets: number
  checkedIn: number
  noShow: number
  checkInRate: number
}

export function CheckIn() {
  const { eventId } = useParams<{ eventId: string }>()
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [stats, setStats] = useState<CheckInStats | null>(null)
  const [search, setSearch] = useState('')
  const [scanInput, setScanInput] = useState('')
  const [lastCheckIn, setLastCheckIn] = useState<{name: string; success: boolean; message: string} | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAttendees()
    fetchStats()
    // Focus scan input on load
    scanRef.current?.focus()
  }, [eventId])

  const fetchAttendees = async () => {
    try {
      const response = await api.get(`/checkin/attendees/${eventId}?search=${search}`)
      setAttendees(response.data)
    } catch (error) {
      console.error('Failed to fetch attendees:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get(`/checkin/stats/${eventId}`)
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanInput.trim()) return

    try {
      const response = await api.post('/checkin', {
        ticketNumber: scanInput.trim(),
        method: 'QR_SCAN',
        stationId: 'web-station-1'
      })

      if (response.data.success) {
        setLastCheckIn({
          name: response.data.attendeeName,
          success: true,
          message: '✓ Checked in successfully'
        })
        fetchAttendees()
        fetchStats()
      } else {
        setLastCheckIn({
          name: '',
          success: false,
          message: response.data.message || 'Check-in failed'
        })
      }
    } catch (error: any) {
      setLastCheckIn({
        name: '',
        success: false,
        message: error.response?.data?.message || 'Error checking in'
      })
    }

    setScanInput('')
    scanRef.current?.focus()

    // Clear status after 3 seconds
    setTimeout(() => setLastCheckIn(null), 3000)
  }

  const handleManualCheckIn = async (ticketNumber: string) => {
    try {
      await api.post('/checkin', {
        ticketNumber,
        method: 'MANUAL',
        stationId: 'web-station-1'
      })
      fetchAttendees()
      fetchStats()
    } catch (error) {
      console.error('Manual check-in failed:', error)
    }
  }

  const filteredAttendees = attendees.filter(a => 
    a.attendeeName?.toLowerCase().includes(search.toLowerCase()) ||
    a.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.attendeeEmail?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-warmgray-900">{stats.totalTickets}</div>
            <div className="text-sm text-warmgray-600">Total Tickets</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.checkedIn}</div>
            <div className="text-sm text-warmgray-600">Checked In</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-warmgray-400">{stats.noShow}</div>
            <div className="text-sm text-warmgray-600">No Show</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-3xl font-bold text-coral-600">{stats.checkInRate}%</div>
            <div className="text-sm text-warmgray-600">Check-in Rate</div>
          </div>
        </div>
      )}

      {/* QR Scan Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <QrCode className="h-5 w-5 text-coral-600" />
          QR Code Scanner
        </h2>
        
        <form onSubmit={handleScan} className="flex gap-3">
          <input
            ref={scanRef}
            type="text"
            className="input flex-1"
            placeholder="Scan QR code or enter ticket number..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">
            Check In
          </button>
        </form>

        {lastCheckIn && (
          <div className={`mt-4 p-4 rounded-lg ${lastCheckIn.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${lastCheckIn.success ? 'text-green-900' : 'text-red-900'}`}>
              {lastCheckIn.message}
            </div>
            {lastCheckIn.name && (
              <div className="text-sm text-green-700 mt-1">
                Welcome, {lastCheckIn.name}!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendee List */}
      <div className="card">
        <div className="p-4 border-b border-warmgray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-coral-600" />
            Attendee List
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warmgray-400" />
            <input
              type="text"
              className="input pl-10 w-64"
              placeholder="Search attendees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-96 overflow-auto">
          <table className="min-w-full">
            <thead className="bg-warmgray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-warmgray-500">Attendee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-warmgray-500">Ticket</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-warmgray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-warmgray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmgray-200">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.ticketNumber} className="hover:bg-warmgray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-warmgray-900">{attendee.attendeeName || 'N/A'}</div>
                    <div className="text-sm text-warmgray-500">{attendee.attendeeEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-mono text-warmgray-600">{attendee.ticketNumber}</div>
                    <div className="text-xs text-warmgray-500">{attendee.ticketType}</div>
                  </td>
                  <td className="px-4 py-3">
                    {attendee.checkedInAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <UserCheck className="h-3 w-3" />
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-warmgray-100 text-warmgray-600 text-xs font-medium rounded-full">
                        <UserX className="h-3 w-3" />
                        Not Checked In
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {attendee.checkedInAt ? (
                      <button className="text-sm text-coral-600 hover:text-coral-800 flex items-center gap-1 ml-auto">
                        <RotateCcw className="h-4 w-4" />
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => handleManualCheckIn(attendee.ticketNumber)}
                        className="btn-primary text-sm py-1 px-3"
                      >
                        Check In
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
