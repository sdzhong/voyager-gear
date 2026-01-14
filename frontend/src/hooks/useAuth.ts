/**
 * Custom hook to access authentication context
 */

import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthProvider'
import type { AuthContextType } from '@/types/auth.types'

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 *
 * @returns AuthContextType with user, login, logout, etc.
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
