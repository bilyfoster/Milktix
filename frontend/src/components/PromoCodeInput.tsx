import { useState } from 'react'
import { Tag, Check, X, Loader2 } from 'lucide-react'
import api from '../utils/api'

interface PromoCodeInputProps {
  eventId: string
  orderTotal: number
  ticketCount: number
  ticketTypeIds: string[]
  onApply: (discount: { code: string; amount: number; finalTotal: number }) => void
  onRemove: () => void
}

export function PromoCodeInput({ 
  eventId, 
  orderTotal, 
  ticketCount, 
  ticketTypeIds,
  onApply, 
  onRemove 
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const validateCode = async () => {
    if (!code.trim()) return
    
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/promo-codes/validate', {
        code: code.trim(),
        eventId,
        orderTotal,
        ticketCount,
        ticketTypeIds
      })

      const result = response.data

      if (result.valid) {
        setAppliedCode(result.code)
        onApply({
          code: result.code,
          amount: result.discountAmount,
          finalTotal: result.finalAmount
        })
      } else {
        setError(result.message || 'Invalid promo code')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error validating code')
    } finally {
      setIsLoading(false)
    }
  }

  const removeCode = () => {
    setAppliedCode(null)
    setCode('')
    setError('')
    onRemove()
  }

  if (appliedCode) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-900">Code applied: {appliedCode}</p>
            <p className="text-sm text-green-700">Discount will be applied at checkout</p>
          </div>
        </div>
        <button
          onClick={removeCode}
          className="text-green-700 hover:text-green-900 p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-warmgray-700">
        Promo Code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-4 w-4 text-warmgray-400" />
          </div>
          <input
            type="text"
            className="input pl-10 uppercase"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && validateCode()}
          />
        </div>
        <button
          onClick={validateCode}
          disabled={isLoading || !code.trim()}
          className="btn-outline whitespace-nowrap"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
