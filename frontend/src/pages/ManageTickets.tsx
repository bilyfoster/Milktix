import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  Ticket,
  Users,
  DollarSign,
  X,
  Save
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../utils/api'
import type { Event, TicketType } from '../types'

interface TicketTypeForm {
  id?: string
  name: string
  description: string
  price: string
  quantityAvailable: string
  quantitySold: number
  minPerOrder: string
  maxPerOrder: string
  isAvailable: boolean
}

export function ManageTickets() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  const [formData, setFormData] = useState<TicketTypeForm>({
    name: '',
    description: '',
    price: '',
    quantityAvailable: '',
    quantitySold: 0,
    minPerOrder: '1',
    maxPerOrder: '10',
    isAvailable: true
  })

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await eventsApi.getById(id!)
      return response.data as Event
    },
    enabled: !!id,
  })

  const updateTicketMutation = useMutation({
    mutationFn: async (_payload: { ticketId: string; data: unknown }) => {
      return eventsApi.getById(id!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      setIsEditing(null)
    },
  })

  const createTicketMutation = useMutation({
    mutationFn: async (_payload: unknown) => {
      return eventsApi.getById(id!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
      setIsCreating(false)
      resetForm()
    },
  })

  const deleteTicketMutation = useMutation({
    mutationFn: async (_ticketId: string) => {
      return eventsApi.getById(id!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', id] })
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      quantityAvailable: '',
      quantitySold: 0,
      minPerOrder: '1',
      maxPerOrder: '10',
      isAvailable: true
    })
  }

  const startEditing = (ticketType: TicketType) => {
    setFormData({
      id: ticketType.id,
      name: ticketType.name,
      description: ticketType.description || '',
      price: ticketType.price.toString(),
      quantityAvailable: ticketType.quantityAvailable.toString(),
      quantitySold: ticketType.quantitySold,
      minPerOrder: ticketType.minPerOrder.toString(),
      maxPerOrder: ticketType.maxPerOrder.toString(),
      isAvailable: ticketType.isAvailable
    })
    setIsEditing(ticketType.id)
    setIsCreating(false)
  }

  const startCreating = () => {
    resetForm()
    setIsCreating(true)
    setIsEditing(null)
  }

  const handleSave = () => {
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      quantityAvailable: parseInt(formData.quantityAvailable),
      minPerOrder: parseInt(formData.minPerOrder),
      maxPerOrder: parseInt(formData.maxPerOrder),
      isAvailable: formData.isAvailable
    }

    if (isEditing) {
      updateTicketMutation.mutate({ ticketId: isEditing, data })
    } else if (isCreating) {
      createTicketMutation.mutate(data)
    }
  }

  const handleDelete = (ticketId: string) => {
    if (confirm('Are you sure you want to delete this ticket type?')) {
      deleteTicketMutation.mutate(ticketId)
    }
  }

  const totalRevenue = event?.ticketTypes.reduce((sum, tt) => 
    sum + (tt.quantitySold * tt.price), 0
  ) || 0

  const totalSold = event?.ticketTypes.reduce((sum, tt) => 
    sum + tt.quantitySold, 0
  ) || 0

  const totalAvailable = event?.ticketTypes.reduce((sum, tt) => 
    sum + tt.quantityAvailable, 0
  ) || 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket information...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load tickets</h2>
          <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Tickets</h1>
              <p className="text-sm text-gray-600">{event.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{event.ticketTypes.length}</p>
                <p className="text-sm text-gray-500">Ticket Types</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
                <p className="text-sm text-gray-500">Tickets Sold / {totalAvailable}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ticket Types</h2>
            <button
              onClick={startCreating}
              disabled={isCreating || !!isEditing}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ticket Type
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {isCreating && (
              <div className="p-4 sm:p-6 bg-indigo-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">New Ticket Type</h3>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., VIP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="What's included?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantityAvailable}
                      onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="100"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available for purchase</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!formData.name || !formData.price || !formData.quantityAvailable}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                </div>
              </div>
            )}

            {event.ticketTypes.map((ticketType) => (
              <div key={ticketType.id} className="p-4 sm:p-6">
                {isEditing === ticketType.id ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantityAvailable}
                          onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Available</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setIsEditing(null)}
                        className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{ticketType.name}</h3>
                        {ticketType.isAvailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{ticketType.description || 'No description'}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="text-gray-900 font-medium">${ticketType.price}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{ticketType.quantitySold} sold / {ticketType.quantityAvailable} available</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">Min: {ticketType.minPerOrder}, Max: {ticketType.maxPerOrder}</span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((ticketType.quantitySold / ticketType.quantityAvailable) * 100, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((ticketType.quantitySold / ticketType.quantityAvailable) * 100)}% sold
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => startEditing(ticketType)}
                        disabled={isCreating || !!isEditing}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticketType.id)}
                        disabled={isCreating || !!isEditing}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {event.ticketTypes.length === 0 && !isCreating && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket types yet</h3>
                <p className="text-gray-500 mb-4">Add your first ticket type to start selling</p>
                <button
                  onClick={startCreating}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket Type
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
