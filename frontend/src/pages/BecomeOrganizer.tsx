import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Mail, Phone, Globe, FileText, Briefcase, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { organizerRequestApi } from '../utils/api'
import { useAuthStore } from '../stores/authStore'

export function BecomeOrganizer() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [existingRequest, setExistingRequest] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    taxId: '',
    website: '',
    phoneNumber: '',
    businessEmail: ''
  })

  // Check if user already has a request
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { message: 'Please sign in to become an organizer' } })
        return
      }

      // If already an organizer, redirect to dashboard
      if (user?.role === 'ORGANIZER') {
        navigate('/organizer/dashboard')
        return
      }

      try {
        const response = await organizerRequestApi.getMyRequest()
        if (response.data && response.data.id) {
          setExistingRequest(response.data)
        }
      } catch (err) {
        // No existing request is fine
      } finally {
        setIsChecking(false)
      }
    }

    checkExistingRequest()
  }, [isAuthenticated, user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await organizerRequestApi.create(formData)
      setSuccess('Your organizer request has been submitted for review!')
      // Refresh to show status
      const response = await organizerRequestApi.getMyRequest()
      setExistingRequest(response.data)
    } catch (err: any) {
      setError(err.response?.data || 'Failed to submit request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-16 w-16 text-yellow-500" />
      case 'APPROVED':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Your application is under review'
      case 'APPROVED':
        return 'Your application has been approved!'
      case 'REJECTED':
        return 'Your application was not approved'
      default:
        return ''
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
      </div>
    )
  }

  // Show existing request status
  if (existingRequest) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-6">
              {getStatusIcon(existingRequest.status)}
            </div>
            <h2 className="text-heading-lg font-bold text-warmgray-900 mb-2">
              {getStatusText(existingRequest.status)}
            </h2>
            <p className="text-warmgray-600 mb-6">
              {existingRequest.status === 'PENDING' && (
                "We're reviewing your application. You'll receive an email once it's processed."
              )}
              {existingRequest.status === 'APPROVED' && (
                "Welcome! You can now create and manage your events."
              )}
              {existingRequest.status === 'REJECTED' && (
                existingRequest.adminNotes || "Please contact support for more information."
              )}
            </p>
            
            <div className="bg-warmgray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-warmgray-900 mb-2">Application Details</h3>
              <p className="text-sm text-warmgray-600">
                <span className="font-medium">Business:</span> {existingRequest.businessName}
              </p>
              <p className="text-sm text-warmgray-600">
                <span className="font-medium">Submitted:</span>{' '}
                {new Date(existingRequest.createdAt).toLocaleDateString()}
              </p>
            </div>

            {existingRequest.status === 'APPROVED' ? (
              <Link to="/organizer/dashboard" className="btn-primary w-full">
                Go to Organizer Dashboard
              </Link>
            ) : (
              <Link to="/" className="btn-outline w-full">
                Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral-100 mb-4">
              <Building2 className="h-8 w-8 text-coral-600" />
            </div>
            <h2 className="text-heading-lg font-bold text-warmgray-900">Become an Organizer</h2>
            <p className="mt-2 text-warmgray-600">
              Host events and sell tickets on MilkTix. Fill out the form below to apply.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-warmgray-700 mb-2">
                Business Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-warmgray-400" />
                </div>
                <input
                  id="businessName"
                  type="text"
                  required
                  className="input pl-12"
                  placeholder="Your business or organization name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <label htmlFor="businessEmail" className="block text-sm font-medium text-warmgray-700 mb-2">
                Business Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-warmgray-400" />
                </div>
                <input
                  id="businessEmail"
                  type="email"
                  required
                  className="input pl-12"
                  placeholder="business@example.com"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Business Description */}
            <div>
              <label htmlFor="businessDescription" className="block text-sm font-medium text-warmgray-700 mb-2">
                Business Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 flex items-start pointer-events-none">
                  <FileText className="h-5 w-5 text-warmgray-400" />
                </div>
                <textarea
                  id="businessDescription"
                  rows={4}
                  className="input pl-12 pt-3"
                  placeholder="Tell us about your business and the types of events you plan to host..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-warmgray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-warmgray-400" />
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className="input pl-12"
                    placeholder="(555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-warmgray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-warmgray-400" />
                  </div>
                  <input
                    id="website"
                    type="url"
                    className="input pl-12"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Tax ID */}
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-warmgray-700 mb-2">
                Tax ID / EIN (optional)
              </label>
              <input
                id="taxId"
                type="text"
                className="input"
                placeholder="XX-XXXXXXX"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-warmgray-500">
                Required for tax reporting if you earn over $600/year
              </p>
            </div>

            <div className="bg-warmgray-50 rounded-xl p-4">
              <p className="text-sm text-warmgray-600">
                By submitting this application, you agree to our{' '}
                <Link to="/terms" className="text-coral-600 hover:text-coral-700">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/organizer-agreement" className="text-coral-600 hover:text-coral-700">Organizer Agreement</Link>.
                We typically review applications within 1-2 business days.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
