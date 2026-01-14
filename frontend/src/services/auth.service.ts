/**
 * Authentication service for API calls
 */

import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  User,
} from '@/types/auth.types'
import { apiClient } from './api'

export const authService = {
  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<User> {
    return apiClient.post<User>('/api/auth/register', credentials)
  },

  /**
   * Login with username/email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials)
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/auth/me', { requiresAuth: true })
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    return apiClient.post<void>('/api/auth/logout', {}, { requiresAuth: true })
  },
}
