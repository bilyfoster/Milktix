import { useEffect, useState } from 'react'
import { Tag, Plus, Edit2, Trash2, Copy, Check, Percent, DollarSign, Gift, Loader2, X, User, TrendingUp, BarChart3 } from 'lucide-react'
import { promoCodesApi } from '../../utils/api'

interface PromoCode {
  id: string
  code: string
  description: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COMP'
  discountValue: number
  scope: 'HOST_SPECIFIC'
  maxUses: number | null
  currentUses: number
  maxUsesPerUser: number
  minTickets: number
  minAmount: number | null
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  hostId: string
}

interface PromoCodeUsage {
  totalDiscount: number
  recentUses: Array<{
    id: string
    usedAt: string
    orderId: string
    discountAmount: number
  }>
}

export function HostPromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usageStats, setUsageStats] = useState<Record<string, PromoCodeUsage>>({})
  const [actionError, setActionError] = useState('')

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxUses: '',
    maxUsesPerUser: 1,
    minTickets: 1,
    minAmount: '',
    startDate: '',
    endDate: '',
    isActive: true
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      setLoading(true)
      const response = await promoCodesApi.getHostPromoCodes()
      setPromoCodes(response.data)
      
      // Fetch usage stats for each code
      const stats: Record<string, PromoCodeUsage> = {}
      for (const code of response.data) {
        try {
          const usageRes = await promoCodesApi.getPromoCodeUsage(code.id)
          stats[code.id] = usageRes.data
        } catch (err) {
          console.error(`Failed to fetch usage for ${code.id}:`, err)
        }
      }
      setUsageStats(stats)
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
      setActionError('Failed to load promo codes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setActionError('')
    try {
      const payload = {
        ...formData,
        scope: 'HOST_SPECIFIC',
        discountValue: Number(formData.discountValue),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null
      }
      await promoCodesApi.createHostPromoCode(payload)
      fetchPromoCodes()
      setShowForm(false)
      resetForm()
    } catch (error: any) {
      setActionError(error.response?.data || 'Failed to create promo code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCode) return
    setIsSubmitting(true)
    setActionError('')
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null
      }
      await promoCodesApi.updatePromoCode(editingCode.id, payload)
      fetchPromoCodes()
      setEditingCode(null)
      resetForm()
    } catch (error: any) {
      setActionError(error.response?.data || 'Failed to update promo code')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) return
    setIsDeleting(true)
    setActionError('')
    try {
      await promoCodesApi.deletePromoCode(showDeleteConfirm)
      fetchPromoCodes()
      setShowDeleteConfirm(null)
    } catch (error: any) {
      setActionError(error.response?.data || 'Failed to delete promo code')
    } finally {
      setIsDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: '',
      maxUsesPerUser: 1,
      minTickets: 1,
      minAmount: '',
      startDate: '',
      endDate: '',
      isActive: true
    })
    setActionError('')
  }

  const openEditModal = (code: PromoCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description || '',
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxUses: code.maxUses?.toString() || '',
      maxUsesPerUser: code.maxUsesPerUser || 1,
      minTickets: code.minTickets || 1,
      minAmount: code.minAmount?.toString() || '',
      startDate: code.startDate ? new Date(code.startDate).toISOString().slice(0, 16) : '',
      endDate: code.endDate ? new Date(code.endDate).toISOString().slice(0, 16) : '',
      isActive: code.isActive
    })
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="h-4 w-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="h-4 w-4" />
      case 'COMP': return <Gift className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const getDiscountLabel = (code: PromoCode) => {
    switch (code.discountType) {
      case 'PERCENTAGE': return `${code.discountValue}% off`
      case 'FIXED_AMOUNT': return `$${code.discountValue} off`
      case 'COMP': return 'FREE (Comp)'
      default: return ''
    }
  }

  const getUsagePercentage = (code: PromoCode) => {
    if (!code.maxUses) return code.currentUses > 0 ? 100 : 0
    return Math.min(100, (code.currentUses / code.maxUses) * 100)
  }

  const getTotalUses = () => promoCodes.reduce((sum, code) => sum + code.currentUses, 0)
  const getTotalDiscountGiven = () => {
    return Object.values(usageStats).reduce((sum, stat) => sum + (stat?.totalDiscount || 0), 0)
  }
  const getActiveCodes = () => promoCodes.filter(code => code.isActive).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-900">My Promo Codes</h1>
          <p className="text-warmgray-600">Create and manage promo codes for your events</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowForm(!showForm)
          }}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? <><X className="h-4 w-4" /> Cancel</> : <><Plus className="h-4 w-4" /> New Code</>}
        </button>
      </div>

      {/* Error Display */}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {actionError}
        </div>
      )}

      {/* Stats Overview */}
      {promoCodes.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <Tag className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Codes</span>
            </div>
            <p className="text-2xl font-bold text-warmgray-900">{promoCodes.length}</p>
            <p className="text-xs text-warmgray-500">{getActiveCodes()} active</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Uses</span>
            </div>
            <p className="text-2xl font-bold text-coral-600">{getTotalUses()}</p>
            <p className="text-xs text-warmgray-500">redemptions</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-warmgray-200">
            <div className="flex items-center gap-2 text-warmgray-500 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Discount</span>
            </div>
            <p className="text-2xl font-bold text-green-600">${getTotalDiscountGiven().toFixed(0)}</p>
            <p className="text-xs text-warmgray-500">given to customers</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-violet-600" />
            Create Host-Specific Promo Code
          </h2>
          <p className="text-sm text-warmgray-600 mb-4">
            This code will only be valid for events hosted by you.
          </p>
          <PromoCodeForm 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
            submitLabel="Create Promo Code"
          />
        </div>
      )}

      {/* Promo Codes List */}
      {promoCodes.length === 0 ? (
        <div className="card p-12 text-center">
          <Tag className="h-16 w-16 text-warmgray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-warmgray-900">No promo codes yet</h3>
          <p className="text-warmgray-600 mt-1 mb-6">
            Create your first promo code to start offering discounts.
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Code
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {promoCodes.map((code) => (
            <div 
              key={code.id} 
              className="card p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Code Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-coral-600">{code.code}</span>
                      <button
                        onClick={() => copyCode(code.code)}
                        className="text-warmgray-400 hover:text-coral-600 p-1 rounded"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      code.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-warmgray-100 text-warmgray-800'
                    }`}>
                      {code.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                      <User className="h-3 w-3" />
                      Host Only
                    </span>
                  </div>
                  {code.description && (
                    <p className="text-sm text-warmgray-600 mb-2">{code.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-warmgray-700">
                      {getDiscountIcon(code.discountType)}
                      <span className="font-medium">{getDiscountLabel(code)}</span>
                    </div>
                    {(code.startDate || code.endDate) && (
                      <span className="text-warmgray-500">
                        {code.startDate && new Date(code.startDate) > new Date() && 'Starts '}
                        {code.endDate && new Date(code.endDate) < new Date() ? 'Expired' : 
                         code.startDate && new Date(code.startDate) > new Date() ? new Date(code.startDate).toLocaleDateString() :
                         code.endDate ? `Until ${new Date(code.endDate).toLocaleDateString()}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-warmgray-400" />
                      <span className="text-xs text-warmgray-500 uppercase">Usage</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-bold text-warmgray-900">{code.currentUses}</span>
                          <span className="text-warmgray-500">/ {code.maxUses || '∞'}</span>
                        </div>
                        <div className="h-2 bg-warmgray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              getUsagePercentage(code) >= 90 ? 'bg-red-500' : 'bg-coral-500'
                            }`}
                            style={{ width: `${getUsagePercentage(code)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {code.maxUsesPerUser > 1 && (
                      <p className="text-xs text-warmgray-500 mt-1">{code.maxUsesPerUser} per user</p>
                    )}
                  </div>

                  {usageStats[code.id] && usageStats[code.id].totalDiscount > 0 && (
                    <div className="text-center hidden sm:block">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-warmgray-400" />
                        <span className="text-xs text-warmgray-500 uppercase">Total Discount</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        ${usageStats[code.id].totalDiscount.toFixed(0)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(code)}
                      className="btn-ghost text-sm py-2 px-3"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(code.id)}
                      className="btn-ghost text-sm py-2 px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-warmgray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-warmgray-900">Edit Promo Code</h2>
                <button 
                  onClick={() => setEditingCode(null)}
                  className="text-warmgray-400 hover:text-warmgray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-warmgray-600 text-sm mt-1">
                Editing: <span className="font-mono font-medium text-coral-600">{editingCode.code}</span>
              </p>
            </div>
            <div className="p-6">
              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {actionError}
                </div>
              )}
              <PromoCodeForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdate}
                onCancel={() => setEditingCode(null)}
                isSubmitting={isSubmitting}
                submitLabel="Save Changes"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-warmgray-900 mb-2">Delete Promo Code?</h3>
            <p className="text-warmgray-600 mb-6">
              Are you sure you want to delete this promo code? This action cannot be undone.
              {promoCodes.find(c => c.id === showDeleteConfirm)?.currentUses! > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Note: This code has been used {promoCodes.find(c => c.id === showDeleteConfirm)?.currentUses} time(s).
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-outline flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Form Component
interface PromoCodeFormProps {
  formData: {
    code: string
    description: string
    discountType: string
    discountValue: number
    maxUses: string
    maxUsesPerUser: number
    minTickets: number
    minAmount: string
    startDate: string
    endDate: string
    isActive: boolean
  }
  setFormData: (data: any) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}

function PromoCodeForm({ formData, setFormData, onSubmit, onCancel, isSubmitting, submitLabel }: PromoCodeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Code *</label>
          <input
            type="text"
            required
            className="input uppercase"
            placeholder="SUMMER2026"
            value={formData.code}
            onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
          />
          <p className="text-xs text-warmgray-500 mt-1">Customers will enter this code at checkout</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Discount Type *</label>
          <select
            className="input"
            value={formData.discountType}
            onChange={e => setFormData({...formData, discountType: e.target.value})}
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
            <option value="COMP">Comp (100% Free)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-warmgray-700 mb-1">Description</label>
        <input
          type="text"
          className="input"
          placeholder="Summer special discount for your events"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">
            {formData.discountType === 'PERCENTAGE' ? 'Percentage *' : 
             formData.discountType === 'COMP' ? 'Value (always 100%)' : 'Amount ($) *'}
          </label>
          <input
            type="number"
            required={formData.discountType !== 'COMP'}
            disabled={formData.discountType === 'COMP'}
            className="input"
            min={0}
            max={formData.discountType === 'PERCENTAGE' ? 100 : undefined}
            value={formData.discountType === 'COMP' ? 100 : formData.discountValue}
            onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Max Uses (empty = unlimited)</label>
          <input
            type="number"
            className="input"
            min={1}
            placeholder="Unlimited"
            value={formData.maxUses}
            onChange={e => setFormData({...formData, maxUses: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Max Uses Per User</label>
          <input
            type="number"
            className="input"
            min={1}
            value={formData.maxUsesPerUser}
            onChange={e => setFormData({...formData, maxUsesPerUser: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">Start Date</label>
          <input
            type="datetime-local"
            className="input"
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
          <p className="text-xs text-warmgray-500 mt-1">When the code becomes active (optional)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-warmgray-700 mb-1">End Date</label>
          <input
            type="datetime-local"
            className="input"
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
          />
          <p className="text-xs text-warmgray-500 mt-1">When the code expires (optional)</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={e => setFormData({...formData, isActive: e.target.checked})}
          className="rounded border-warmgray-300 text-coral-600"
        />
        <label htmlFor="isActive" className="text-sm text-warmgray-700">Active</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="submit" 
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          className="btn-outline"
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
