import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../utils/api'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
      setIsValidating(false)
      return
    }

    // Validate token
    const validateToken = async () => {
      try {
        const response = await api.get(`/auth/validate-reset-token?token=${token}`)
        if (response.data.valid) {
          setIsTokenValid(true)
        } else {
          setError('This reset link has expired or is invalid')
        }
      } catch (err) {
        setError('This reset link has expired or is invalid')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      })
      setIsSuccess(true)
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
        <p className="mt-4 text-warmgray-600">Validating reset link...</p>
      </div>
    )
  }

  if (error && !isTokenValid) {
    return (
      <div className="min-h-screen bg-warmgray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex justify-center mb-6">
            <span className="text-3xl font-bold text-coral-600">MilkTix</span>
          </Link>
          <div className="card py-8 px-4 sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-warmgray-900 mb-2">
              Invalid Reset Link
            </h3>
            <p className="text-sm text-warmgray-600 mb-6">{error}</p>
            <Link
              to="/forgot-password"
              className="btn-primary inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Request new link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warmgray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <span className="text-3xl font-bold text-coral-600">MilkTix</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-warmgray-900">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-warmgray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-warmgray-900 mb-2">
                Password reset successful!
              </h3>
              <p className="text-sm text-warmgray-600 mb-4">
                Your password has been updated. You will be redirected to login shortly.
              </p>
              <Link
                to="/login"
                className="text-coral-600 hover:text-coral-500 font-medium"
              >
                Go to login now
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
                <label htmlFor="password" className="block text-sm font-medium text-warmgray-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-warmgray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-warmgray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-warmgray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-warmgray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-warmgray-700">
                  Confirm new password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-warmgray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input pl-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Resetting...
                  </>
                ) : (
                  'Reset password'
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
