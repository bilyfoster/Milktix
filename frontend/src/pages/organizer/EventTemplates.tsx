import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Plus, Play, Edit, Trash2, Loader2, Repeat, MapPin, Users } from 'lucide-react'
import { templatesApi } from '../../utils/api'

interface Template {
  id: string
  name: string
  title: string
  description?: string
  hostName?: string
  locationName?: string
  recurrence?: {
    recurrenceType: string
    daysOfWeek?: string[]
    weekOfMonth?: number
    dayOfWeek?: string
    startDate: string
    endDate?: string
    startTime: string
    endTime?: string
  }
  ticketTypes: {
    id: string
    name: string
    price: number
  }[]
  createdAt: string
}

export function EventTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateUntil, setGenerateUntil] = useState('')

  useEffect(() => {
    loadTemplates()
    // Default generate until 3 months from now
    const threeMonths = new Date()
    threeMonths.setMonth(threeMonths.getMonth() + 3)
    setGenerateUntil(threeMonths.toISOString().split('T')[0])
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await templatesApi.getMyTemplates()
      setTemplates(response.data || [])
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async (templateId: string) => {
    if (!generateUntil) return
    setGeneratingId(templateId)
    try {
      await templatesApi.generateEvents(templateId, generateUntil)
      alert(`Events generated successfully! Check your events list.`)
    } catch (err: any) {
      alert('Failed to generate events: ' + (err.response?.data || err.message))
    } finally {
      setGeneratingId(null)
    }
  }

  const getRecurrenceLabel = (rec: Template['recurrence']) => {
    if (!rec) return 'No recurrence'
    
    switch (rec.recurrenceType) {
      case 'DAILY':
        return 'Daily'
      case 'WEEKLY':
        return `Every ${rec.daysOfWeek?.join(', ') || 'week'}`
      case 'BIWEEKLY':
        return `Every other ${rec.daysOfWeek?.join(', ') || 'week'}`
      case 'MONTHLY':
        return 'Monthly'
      case 'MONTHLY_WEEKDAY':
        const weekNum = rec.weekOfMonth === -1 ? 'Last' : 
          rec.weekOfMonth === 1 ? '1st' :
          rec.weekOfMonth === 2 ? '2nd' :
          rec.weekOfMonth === 3 ? '3rd' :
          rec.weekOfMonth === 4 ? '4th' : `${rec.weekOfMonth}th`
        return `${weekNum} ${rec.dayOfWeek} of each month`
      default:
        return rec.recurrenceType
    }
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
          <h1 className="text-heading-lg font-bold text-warmgray-900">Event Templates</h1>
          <p className="text-warmgray-600 mt-1">Create reusable templates for recurring events.</p>
        </div>
        <Link to="/organizer/templates/create" className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Create Template
        </Link>
      </div>

      {/* Generate Settings */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warmgray-500" />
            <span className="text-sm text-warmgray-700">Generate events until:</span>
          </div>
          <input
            type="date"
            className="input w-auto"
            value={generateUntil}
            onChange={(e) => setGenerateUntil(e.target.value)}
          />
          <span className="text-xs text-warmgray-500">
            Click the play button on any template to generate events up to this date.
          </span>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="card p-12 text-center">
          <Repeat className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No templates yet</h3>
          <p className="text-warmgray-600 mt-1 mb-6">
            Create templates for recurring events like weekly shows, monthly meetups, etc.
          </p>
          <Link to="/organizer/templates/create" className="btn-primary">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Template
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-coral-100 flex items-center justify-center">
                  <Repeat className="h-6 w-6 text-coral-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerate(template.id)}
                    disabled={generatingId === template.id}
                    className="btn-primary text-sm py-1.5 px-3"
                    title="Generate events"
                  >
                    {generatingId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button className="btn-ghost text-sm py-1.5 px-2">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="btn-ghost text-sm py-1.5 px-2 text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-warmgray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-warmgray-600 mb-3">{template.title}</p>

              {/* Recurrence Info */}
              <div className="flex items-center gap-2 text-sm text-warmgray-600 mb-2">
                <Calendar className="h-4 w-4" />
                {getRecurrenceLabel(template.recurrence)}
              </div>

              {template.recurrence && (
                <div className="flex items-center gap-2 text-sm text-warmgray-600 mb-2">
                  <Clock className="h-4 w-4" />
                  {template.recurrence.startTime}
                  {template.recurrence.endTime && ` - ${template.recurrence.endTime}`}
                </div>
              )}

              {template.hostName && (
                <div className="flex items-center gap-2 text-sm text-warmgray-600 mb-2">
                  <Users className="h-4 w-4" />
                  {template.hostName}
                </div>
              )}

              {template.locationName && (
                <div className="flex items-center gap-2 text-sm text-warmgray-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  {template.locationName}
                </div>
              )}

              {/* Ticket Types */}
              {template.ticketTypes && template.ticketTypes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-warmgray-200">
                  <p className="text-xs text-warmgray-500 mb-2">Tickets:</p>
                  <div className="flex flex-wrap gap-2">
                    {template.ticketTypes.map((tt) => (
                      <span key={tt.id} className="text-xs bg-warmgray-100 px-2 py-1 rounded">
                        {tt.name}: ${tt.price}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-warmgray-200 flex items-center justify-between">
                <span className="text-xs text-warmgray-500">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleGenerate(template.id)}
                  disabled={generatingId === template.id}
                  className="text-sm text-coral-600 hover:text-coral-700 font-medium"
                >
                  Generate Events →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
