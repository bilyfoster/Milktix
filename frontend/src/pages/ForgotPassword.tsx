import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../utils/api'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [devToken, setDevToken] = useState('') // For development only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/forgot-password', { email })
      setIsSubmitted(true)
      // In development, show the token
      if (response.data.devToken) {
        setDevToken(response.data.devToken)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warmgray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <span className="text-3xl font-bold text-coral-600">MilkTix</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-warmgray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-warmgray-600">
          Enter your email and we'll send you instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-warmgray-900 mb-2">
                Check your email
              </h3>
              <p className="text-sm text-warmgray-600 mb-4">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
              </p>
              
              {devToken && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-xs font-semibold text-yellow-800 mb-2">DEVELOPMENT MODE:</p>
                  <p className="text-xs text-yellow-700 mb-2">Reset token:</p>
                  <code className="block bg-yellow-100 p-2 rounded text-xs break-all">{devToken}</code>
                  <Link 
                    to={`/reset-password?token=${devToken}`}
                    className="text-xs text-coral-600 hover:underline mt-2 inline-block"
                  >
                    Click here to reset password →
                  </Link>
                </div>
              )}
              
              <Link
                to="/login"
                className="text-coral-600 hover:text-coral-500 font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-warmgray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-warmgray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Sending...
                  </>
                ) : (
                  'Send reset instructions'
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-coral-600 hover:text-coral-500 font-medium inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
