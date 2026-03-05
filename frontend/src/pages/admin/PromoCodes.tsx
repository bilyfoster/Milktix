import { useEffect, useState } from 'react'
import { Tag, Plus, Edit2, Trash2, Copy, Check, Percent, DollarSign, Gift } from 'lucide-react'
import api from '../../utils/api'

interface PromoCode {
  id: string
  code: string
  description: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'COMP'
  discountValue: number
  scope: 'GLOBAL' | 'EVENT_SPECIFIC'
  maxUses: number | null
  currentUses: number
  minTickets: number
  startDate: string
  endDate: string
  isActive: boolean
}

export function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    scope: 'GLOBAL',
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
      const response = await api.get('/promo-codes')
      setPromoCodes(response.data)
    } catch (error) {
      console.error('Failed to fetch promo codes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        minAmount: formData.minAmount ? Number(formData.minAmount) : null
      }
      await api.post('/promo-codes', payload)
      fetchPromoCodes()
      setShowForm(false)
      setFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        scope: 'GLOBAL',
        maxUses: '',
        maxUsesPerUser: 1,
        minTickets: 1,
        minAmount: '',
        startDate: '',
        endDate: '',
        isActive: true
      })
    } catch (error: any) {
      alert(error.response?.data || 'Failed to create promo code')
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warmgray-900">Promo Codes</h1>
          <p className="text-warmgray-600">Create and manage discount codes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus className="h-4 w-4" /> New Code</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Create Promo Code</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Summer special discount"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
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

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create Promo Code</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes List */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-warmgray-200">
          <thead className="bg-warmgray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">Uses</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-warmgray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-warmgray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warmgray-200">
            {promoCodes.map((code) => (
              <tr key={code.id} className="hover:bg-warmgray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-coral-600">{code.code}</span>
                    <button
                      onClick={() => copyCode(code.code)}
                      className="text-warmgray-400 hover:text-coral-600"
                      title="Copy code"
                    >
                      {copiedCode === code.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {code.description && (
                    <p className="text-xs text-warmgray-500 mt-1">{code.description}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getDiscountIcon(code.discountType)}
                    <span className="font-medium">{getDiscountLabel(code)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm">
                    {code.currentUses} / {code.maxUses || '∞'}
                  </span>
                  <div className="w-24 h-1.5 bg-warmgray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-coral-500 rounded-full"
                      style={{ 
                        width: code.maxUses 
                          ? `${Math.min(100, (code.currentUses / code.maxUses) * 100)}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    code.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-warmgray-100 text-warmgray-800'
                  }`}>
                    {code.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-coral-600 hover:text-coral-800">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {promoCodes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-warmgray-500">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-warmgray-300" />
                  <p>No promo codes yet</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
