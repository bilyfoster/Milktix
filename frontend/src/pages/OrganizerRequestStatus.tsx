import { Link, useSearchParams } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export function OrganizerRequestStatus() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || 'pending'
  const submittedDate = '2025-03-01'

  const renderContent = () => {
    switch (status) {
      case 'approved':
        return (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-heading-lg font-bold text-warmgray-900 mb-2">Request Approved!</h1>
            <p className="text-warmgray-600 mb-6">
              Congratulations! Your organizer account has been approved.
              You can now start creating and managing events.
            </p>
            <Link to="/organizer/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          </>
        )
      case 'rejected':
        return (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-heading-lg font-bold text-warmgray-900 mb-2">Request Declined</h1>
            <p className="text-warmgray-600 mb-6">
              Unfortunately, your organizer request was not approved at this time.
              Please contact support for more information.
            </p>
          </>
        )
      case 'pending':
      default:
        return (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="text-heading-lg font-bold text-warmgray-900 mb-2">Request Pending</h1>
            <p className="text-warmgray-600 mb-6">
              Your organizer request has been submitted and is currently under review.
              You'll receive an email notification once it's approved.
            </p>
          </>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-warmgray-600 hover:text-coral-600 mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="card p-8">
        <div className="text-center">
          {renderContent()}

          <div className="bg-warmgray-50 rounded-xl p-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-warmgray-600 justify-center">
              <AlertCircle className="h-4 w-4" />
              Submitted on {submittedDate}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
