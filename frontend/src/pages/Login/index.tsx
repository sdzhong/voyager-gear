/**
 * Login Page
 */

import { LoginForm } from '@/components/auth/LoginForm'

const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your Voyager Gear account</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

export default Login
