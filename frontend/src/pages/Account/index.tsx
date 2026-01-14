/**
 * Account Page (Protected)
 * Displays user information and account management options
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const Account: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-3xl font-bold text-white">My Account</h1>
            <p className="mt-2 text-blue-100">Manage your Voyager Gear account settings</p>
          </div>

          {/* User Information */}
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>

            <dl className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="text-sm font-medium text-gray-500 w-40">Username</dt>
                <dd className="mt-1 sm:mt-0 text-sm text-gray-900 font-medium">
                  {user.username}
                </dd>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="text-sm font-medium text-gray-500 w-40">Email</dt>
                <dd className="mt-1 sm:mt-0 text-sm text-gray-900">{user.email}</dd>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="text-sm font-medium text-gray-500 w-40">Account Status</dt>
                <dd className="mt-1 sm:mt-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="text-sm font-medium text-gray-500 w-40">Email Verified</dt>
                <dd className="mt-1 sm:mt-0">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </dd>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center">
                <dt className="text-sm font-medium text-gray-500 w-40">Member Since</dt>
                <dd className="mt-1 sm:mt-0 text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
