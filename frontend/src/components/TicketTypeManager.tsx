import { useState } from 'react'
import { Plus, X, Edit2, Trash2, AlertTriangle, Ticket, DollarSign, Users, Calendar } from 'lucide-react'
import { eventsApi } from '../utils/api'

interface TicketType {
  id?: string
  name: string
  description: string
  price: number
  quantityAvailable: number
  quantitySold?: number
  minPerOrder: number
  maxPerOrder: number
  saleStartDate?: string
  saleEndDate?: string
}

interface TicketTypeManagerProps {
  eventId: string
  ticketTypes: TicketType[]
  onTicketTypesChange: (ticketTypes: TicketType[]) => void
  readOnly?: boolean
}

interface TicketTypeFormData {
  name: string
  description: string
  price: string
  quantityAvailable: string
  minPerOrder: string
  maxPerOrder: string
  saleStartDate: string
  saleEndDate: string
}

const emptyFormData: TicketTypeFormData = {
  name: '',
  description: '',
  price: '0',
  quantityAvailable: '100',
  minPerOrder: '1',
  maxPerOrder: '10',
  saleStartDate: '',
  saleEndDate: '',
}

export function TicketTypeManager({ 
  eventId, 
  ticketTypes, 
  onTicketTypesChange,
  readOnly = false 
}: TicketTypeManagerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<TicketTypeFormData>(emptyFormData)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAddNew = () => {
    setIsAdding(true)
    setEditingIndex(null)
    setFormData(emptyFormData)
    setError('')
  }

  const handleEdit = (index: number) => {
    const ticket = ticketTypes[index]
    setEditingIndex(index)
    setIsAdding(false)
    setFormData({
      name: ticket.name,
      description: ticket.description || '',
      price: String(ticket.price),
      quantityAvailable: String(ticket.quantityAvailable),
      minPerOrder: String(ticket.minPerOrder || 1),
      maxPerOrder: String(ticket.maxPerOrder || 10),
      saleStartDate: ticket.saleStartDate ? ticket.saleStartDate.split('T')[0] : '',
      saleEndDate: ticket.saleEndDate ? ticket.saleEndDate.split('T')[0] : '',
    })
    setError('')
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setFormData(emptyFormData)
    setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Ticket name is required')
      return false
    }
    if (parseFloat(formData.price) < 0) {
      setError('Price cannot be negative')
      return false
    }
    if (parseInt(formData.quantityAvailable) < 1) {
      setError('Quantity must be at least 1')
      return false
    }
    if (parseInt(formData.minPerOrder) < 1) {
      setError('Min per order must be at least 1')
      return false
    }
    if (parseInt(formData.maxPerOrder) < parseInt(formData.minPerOrder)) {
      setError('Max per order must be greater than or equal to min per order')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError('')

    try {
      const ticketData: TicketType = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        quantityAvailable: parseInt(formData.quantityAvailable) || 100,
        minPerOrder: parseInt(formData.minPerOrder) || 1,
        maxPerOrder: parseInt(formData.maxPerOrder) || 10,
        ...(formData.saleStartDate && { saleStartDate: new Date(formData.saleStartDate).toISOString() }),
        ...(formData.saleEndDate && { saleEndDate: new Date(formData.saleEndDate).toISOString() }),
      }

      let updatedTicketTypes: TicketType[]

      if (editingIndex !== null) {
        // Editing existing ticket
        const existingTicket = ticketTypes[editingIndex]
        ticketData.quantitySold = existingTicket.quantitySold || 0
        if (existingTicket.id) {
          ticketData.id = existingTicket.id
        }
        
        // If editing via API
        if (existingTicket.id && eventsApi.updateTicketType) {
          await eventsApi.updateTicketType(eventId, existingTicket.id, ticketData)
        }
        
        updatedTicketTypes = [...ticketTypes]
        updatedTicketTypes[editingIndex] = ticketData
      } else {
        // Adding new ticket
        updatedTicketTypes = [...ticketTypes, { ...ticketData, quantitySold: 0 }]
      }

      onTicketTypesChange(updatedTicketTypes)
      setIsAdding(false)
      setEditingIndex(null)
      setFormData(emptyFormData)
    } catch (err: any) {
      setError(err.response?.data || 'Failed to save ticket type')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (index: number) => {
    const ticket = ticketTypes[index]
    if (ticket.quantitySold && ticket.quantitySold > 0) {
      setError(`Cannot delete "${ticket.name}" - ${ticket.quantitySold} tickets have already been sold`)
      return
    }
    setShowDeleteConfirm(index)
  }

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm === null) return

    setIsDeleting(showDeleteConfirm)
    setError('')

    try {
      const ticket = ticketTypes[showDeleteConfirm]
      
      // Delete via API if ticket has an ID
      if (ticket.id && eventsApi.deleteTicketType) {
        await eventsApi.deleteTicketType(eventId, ticket.id)
      }

      const updatedTicketTypes = ticketTypes.filter((_, i) => i !== showDeleteConfirm)
      onTicketTypesChange(updatedTicketTypes)
      setShowDeleteConfirm(null)
    } catch (err: any) {
      setError(err.response?.data || 'Failed to delete ticket type')
    } finally {
      setIsDeleting(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getAvailabilityPercentage = (sold: number, available: number) => {
    if (available === 0) return 0
    return Math.round((sold / available) * 100)
  }

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-green-500'
  }

  if (readOnly) {
    return (
      <div className="space-y-4">
        {ticketTypes.length === 0 ? (
          <div className="text-center py-8 bg-warmgray-50 rounded-xl">
            <Ticket className="h-12 w-12 text-warmgray-300 mx-auto mb-3" />
            <p className="text-warmgray-600">No ticket types configured</p>
          </div>
        ) : (
          ticketTypes.map((ticket, index) => (
            <div key={index} className="bg-warmgray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-warmgray-900">{ticket.name}</h4>
                <span className="text-lg font-bold text-coral-600">
                  {formatCurrency(ticket.price)}
                </span>
              </div>
              {ticket.description && (
                <p className="text-sm text-warmgray-600 mb-3">{ticket.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-warmgray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {ticket.quantitySold || 0} / {ticket.quantityAvailable} sold
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Ticket Types List */}
      {ticketTypes.length === 0 && !isAdding ? (
        <div className="text-center py-12 bg-warmgray-50 rounded-xl border-2 border-dashed border-warmgray-200">
          <Ticket className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-warmgray-900 mb-2">No Ticket Types Yet</h4>
          <p className="text-warmgray-600 mb-4">Add ticket types to start selling tickets for your event</p>
          <button onClick={handleAddNew} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Type
          </button>
        </div>
      ) : (
        <>
          {ticketTypes.map((ticket, index) => {
            const sold = ticket.quantitySold || 0
            const available = ticket.quantityAvailable || 0
            const percentage = getAvailabilityPercentage(sold, available)
            
            return (
              <div 
                key={index} 
                className={`bg-warmgray-50 p-4 rounded-xl border-2 transition-all ${
                  editingIndex === index ? 'border-coral-500' : 'border-transparent hover:border-warmgray-200'
                }`}
              >
                {editingIndex === index ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-warmgray-900">Edit Ticket Type</h4>
                      <button onClick={handleCancel} className="text-warmgray-400 hover:text-warmgray-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          className="input"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., General Admission"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">Price ($) *</label>
                        <input
                          type="number"
                          className="input"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">
                          Quantity Available *
                          {ticket.quantitySold && ticket.quantitySold > 0 && (
                            <span className="text-warmgray-500 ml-1">(min: {ticket.quantitySold} sold)</span>
                          )}
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={formData.quantityAvailable}
                          onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                          min={ticket.quantitySold || 1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">Description</label>
                        <input
                          type="text"
                          className="input"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="What's included?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">Min Per Order</label>
                        <input
                          type="number"
                          className="input"
                          value={formData.minPerOrder}
                          onChange={(e) => setFormData({ ...formData, minPerOrder: e.target.value })}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">Max Per Order</label>
                        <input
                          type="number"
                          className="input"
                          value={formData.maxPerOrder}
                          onChange={(e) => setFormData({ ...formData, maxPerOrder: e.target.value })}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Sale Start Date
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={formData.saleStartDate}
                          onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warmgray-700 mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Sale End Date
                        </label>
                        <input
                          type="date"
                          className="input"
                          value={formData.saleEndDate}
                          onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="btn-outline flex-1"
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="btn-primary flex-1"
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-warmgray-900">{ticket.name}</h4>
                          {sold > 0 && (
                            <span className="text-xs bg-coral-100 text-coral-700 px-2 py-0.5 rounded-full">
                              {sold} sold
                            </span>
                          )}
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-warmgray-600 mt-1">{ticket.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-2 text-warmgray-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                          title="Edit ticket type"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(index)}
                          disabled={sold > 0}
                          className={`p-2 rounded-lg transition-colors ${
                            sold > 0 
                              ? 'text-warmgray-300 cursor-not-allowed' 
                              : 'text-warmgray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={sold > 0 ? 'Cannot delete - tickets sold' : 'Delete ticket type'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-coral-600 font-medium">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(ticket.price)}
                      </span>
                      <span className="flex items-center gap-1 text-warmgray-600">
                        <Users className="h-4 w-4" />
                        {sold} / {available} sold
                      </span>
                      {(ticket.minPerOrder > 1 || ticket.maxPerOrder < 100) && (
                        <span className="text-warmgray-500">
                          {ticket.minPerOrder}-{ticket.maxPerOrder} per order
                        </span>
                      )}
                    </div>
                    
                    {/* Availability Bar */}
                    {sold > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-warmgray-500 mb-1">
                          <span>{percentage}% sold</span>
                          <span>{available - sold} remaining</span>
                        </div>
                        <div className="h-2 bg-warmgray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getAvailabilityColor(percentage)} transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {/* Add New Ticket Form */}
      {isAdding && (
        <div className="bg-coral-50 p-4 rounded-xl border-2 border-coral-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-warmgray-900">Add New Ticket Type</h4>
            <button onClick={handleCancel} className="text-warmgray-400 hover:text-warmgray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., VIP, Early Bird"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                className="input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Quantity Available *</label>
              <input
                type="number"
                className="input"
                value={formData.quantityAvailable}
                onChange={(e) => setFormData({ ...formData, quantityAvailable: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Description</label>
              <input
                type="text"
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's included with this ticket?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Min Per Order</label>
              <input
                type="number"
                className="input"
                value={formData.minPerOrder}
                onChange={(e) => setFormData({ ...formData, minPerOrder: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">Max Per Order</label>
              <input
                type="number"
                className="input"
                value={formData.maxPerOrder}
                onChange={(e) => setFormData({ ...formData, maxPerOrder: e.target.value })}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Sale Start Date
              </label>
              <input
                type="date"
                className="input"
                value={formData.saleStartDate}
                onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warmgray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Sale End Date
              </label>
              <input
                type="date"
                className="input"
                value={formData.saleEndDate}
                onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="btn-outline flex-1"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
              disabled={isSaving}
            >
              {isSaving ? 'Adding...' : 'Add Ticket Type'}
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && editingIndex === null && (
        <button
          onClick={handleAddNew}
          className="btn-outline w-full py-3 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Ticket Type
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-warmgray-900">Delete Ticket Type?</h3>
            </div>
            <p className="text-warmgray-600 mb-6">
              Are you sure you want to delete "{ticketTypes[showDeleteConfirm]?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-outline flex-1"
                disabled={isDeleting !== null}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting !== null}
              >
                {isDeleting !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
