import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, User, Building2, Mail, Phone, Globe, Loader2, AlertCircle } from 'lucide-react'
import { organizerRequestApi } from '../utils/api'
interface OrganizerRequest {
  id: string
  businessName: string
  businessDescription: string
  taxId: string
  website: string
  phoneNumber: string
  businessEmail: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNotes: string
  user: {
    id: string
    fullName: string
  }
  reviewedBy: {
    id: string
    fullName: string
  } | null
  reviewedAt: string
  createdAt: string
}

export function AdminOrganizerRequests() {
  const [requests, setRequests] = useState<OrganizerRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<OrganizerRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [selectedRequest, setSelectedRequest] = useState<OrganizerRequest | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchRequests()
    fetchPendingCount()
  }, [])

  useEffect(() => {
    if (activeFilter === 'ALL') {
      setFilteredRequests(requests)
    } else {
      setFilteredRequests(requests.filter(r => r.status === activeFilter))
    }
  }, [activeFilter, requests])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const response = await organizerRequestApi.getAll()
      setRequests(response.data)
      setFilteredRequests(response.data.filter((r: OrganizerRequest) => r.status === 'PENDING'))
    } catch (err: any) {
      setError('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPendingCount = async () => {
    try {
      const response = await organizerRequestApi.getPendingCount()
      setPendingCount(response.data.count)
    } catch (err) {
      // Ignore error
    }
  }

  const handleReview = async () => {
    if (!selectedRequest || !reviewAction) return

    setIsReviewing(true)
    try {
      const action = reviewAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      await organizerRequestApi.review(selectedRequest.id, action, adminNotes)
      
      // Refresh requests
      await fetchRequests()
      await fetchPendingCount()
      
      setSelectedRequest(null)
      setReviewAction(null)
      setAdminNotes('')
    } catch (err: any) {
      setError(err.response?.data || 'Failed to process review')
    } finally {
      setIsReviewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        )
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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-heading-lg font-bold text-warmgray-900">Organizer Requests</h2>
        <p className="mt-1 text-warmgray-600">
          Review and manage organizer applications
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coral-100 text-coral-800">
              {pendingCount} pending
            </span>
        )}
        </p>
      </div>

      {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

      {/* Filter Tabs */}
        <div className="mb-6 border-b border-warmgray-200">
          <nav className="-mb-px flex space-x-8">
            {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeFilter === filter
                    ? 'border-coral-500 text-coral-600'
                    : 'border-transparent text-warmgray-500 hover:text-warmgray-700 hover:border-warmgray-300'
                }`}
              >
                {filter === 'ALL' ? 'All Requests' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                {filter === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-coral-100 text-coral-800">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

      {/* Requests List */}
        <div className="space-y-4">
        {filteredRequests.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warmgray-100 mb-4">
                <Building2 className="h-8 w-8 text-warmgray-400" />
              </div>
              <h3 className="text-lg font-medium text-warmgray-900">No requests found</h3>
              <p className="mt-1 text-warmgray-500">
                {activeFilter === 'PENDING' 
                  ? 'No pending organizer requests at the moment.'
                  : 'No requests match the selected filter.'}
              </p>
            </div>
        ) : (
            filteredRequests.map((request) => (
              <div 
                key={request.id} 
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-warmgray-900">
                        {request.businessName}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-warmgray-600 mb-3">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {request.user.fullName}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {request.businessEmail}
                      </span>
                      {request.phoneNumber && (
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {request.phoneNumber}
                        </span>
                      )}
                    </div>

                    {request.businessDescription && (
                      <p className="text-sm text-warmgray-600 line-clamp-2 mb-3">
                        {request.businessDescription}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-warmgray-500">
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.website && (
                        <a 
                          href={request.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-coral-600 hover:text-coral-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setReviewAction('APPROVE')
                        }}
                        className="btn-primary text-sm py-2"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setReviewAction('REJECT')
                        }}
                        className="btn-outline text-sm py-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      {/* Review Modal */}
      {selectedRequest && reviewAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-warmgray-900 mb-4">
              {reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Organizer Request
            </h3>
            
            <div className="bg-warmgray-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-warmgray-900">{selectedRequest.businessName}</p>
              <p className="text-sm text-warmgray-600">{selectedRequest.user.fullName}</p>
              <p className="text-sm text-warmgray-600">{selectedRequest.businessEmail}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-warmgray-700 mb-2">
                Admin Notes (optional)
              </label>
              <textarea
                rows={3}
                className="input"
                placeholder={reviewAction === 'REJECT' ? 'Reason for rejection...' : 'Any notes for the organizer...'}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {reviewAction === 'REJECT' && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl text-sm text-red-700">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                The applicant will be notified that their request was not approved.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(null)
                  setReviewAction(null)
                  setAdminNotes('')
                }}
                className="btn-outline flex-1"
                disabled={isReviewing}
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                className={`flex-1 ${reviewAction === 'APPROVE' ? 'btn-primary' : 'bg-red-600 text-white hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition-all'}`}
                disabled={isReviewing}
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  reviewAction === 'APPROVE' ? 'Approve Request' : 'Reject Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && !reviewAction && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-warmgray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-warmgray-900">
                  {selectedRequest.businessName}
                </h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-warmgray-500 uppercase">Applicant</label>
                  <p className="text-warmgray-900">{selectedRequest.user.fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-warmgray-500 uppercase">Business Email</label>
                  <p className="text-warmgray-900">{selectedRequest.businessEmail}</p>
                </div>
                {selectedRequest.phoneNumber && (
                  <div>
                    <label className="text-xs font-medium text-warmgray-500 uppercase">Phone</label>
                    <p className="text-warmgray-900">{selectedRequest.phoneNumber}</p>
                  </div>
                )}
                {selectedRequest.website && (
                  <div>
                    <label className="text-xs font-medium text-warmgray-500 uppercase">Website</label>
                    <a 
                      href={selectedRequest.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral-600 hover:text-coral-700"
                    >
                      {selectedRequest.website}
                    </a>
                  </div>
                )}
                {selectedRequest.taxId && (
                  <div>
                    <label className="text-xs font-medium text-warmgray-500 uppercase">Tax ID</label>
                    <p className="text-warmgray-900">{selectedRequest.taxId}</p>
                  </div>
                )}
              </div>

              {selectedRequest.businessDescription && (
                <div>
                  <label className="text-xs font-medium text-warmgray-500 uppercase">Description</label>
                  <p className="text-warmgray-900 mt-1">{selectedRequest.businessDescription}</p>
                </div>
              )}

              <div className="pt-4 border-t border-warmgray-200">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-warmgray-500 uppercase">Submitted</label>
                    <p className="text-warmgray-900">
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedRequest.reviewedAt && (
                    <div>
                      <label className="text-xs font-medium text-warmgray-500 uppercase">Reviewed</label>
                      <p className="text-warmgray-900">
                        {new Date(selectedRequest.reviewedAt).toLocaleString()}
                        {selectedRequest.reviewedBy && ` by ${selectedRequest.reviewedBy.fullName}`}
                      </p>
                    </div>
                  )}
                </div>
                {selectedRequest.adminNotes && (
                  <div className="mt-4">
                    <label className="text-xs font-medium text-warmgray-500 uppercase">Admin Notes</label>
                    <p className="text-warmgray-900 mt-1">{selectedRequest.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-warmgray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="btn-outline"
              >
                Close
              </button>
              {selectedRequest.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => setReviewAction('REJECT')}
                    className="btn-outline border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => setReviewAction('APPROVE')}
                    className="btn-primary"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
