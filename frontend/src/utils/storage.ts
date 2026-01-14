/**
 * LocalStorage utilities for JWT token management
 */

const TOKEN_KEY = 'voyager_auth_token'

/**
 * Get stored authentication token from localStorage
 */
export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error reading token from localStorage:', error)
    return null
  }
}

/**
 * Store authentication token in localStorage
 */
export const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.error('Error storing token in localStorage:', error)
  }
}

/**
 * Remove authentication token from localStorage
 */
export const removeStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error removing token from localStorage:', error)
  }
}
