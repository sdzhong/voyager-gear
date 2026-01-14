/**
 * Registration Page
 */

import { RegisterForm } from '@/components/auth/RegisterForm'

const Register: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Voyager Gear and start your adventure
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}

export default Register
