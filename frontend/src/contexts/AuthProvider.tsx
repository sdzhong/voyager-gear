/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to the app
 */

import React, { createContext, useEffect, useState } from 'react'
import type {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types'
import { authService } from '@/services/auth.service'
import { getStoredToken, removeStoredToken, setStoredToken } from '@/utils/storage'

// Create auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getStoredToken(),
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  /**
   * Initialize authentication state on mount
   * Checks if there's a stored token and fetches user data
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()

      if (token) {
        try {
          // Fetch user data with stored token
          const user = await authService.getCurrentUser()
          setState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          // Token is invalid or expired
          console.error('Failed to fetch user:', error)
          removeStoredToken()
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  /**
   * Login with credentials
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await authService.login(credentials)

      // Store token and update state
      setStoredToken(response.access_token)
      setState({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw new Error(errorMessage)
    }
  }

  /**
   * Register a new user and auto-login
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Register user
      await authService.register(credentials)

      // Auto-login after successful registration
      await login({
        username: credentials.username,
        password: credentials.password,
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw new Error(errorMessage)
    }
  }

  /**
   * Logout and clear authentication state
   */
  const logout = (): void => {
    try {
      // Call logout endpoint (optional, for token blacklisting)
      authService.logout().catch((error) => {
        console.error('Logout API call failed:', error)
      })
    } finally {
      // Clear token and state regardless of API call result
      removeStoredToken()
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  /**
   * Refresh user data from the server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const user = await authService.getCurrentUser()
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }))
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh user data'
      console.error('Failed to refresh user:', errorMessage)
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
