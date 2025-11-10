import axios from 'axios'
import config from '../config/env'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        // Try to refresh the token
        const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
          refreshToken
        })

        const { token, refreshToken: newRefreshToken } = response.data

        // Save new tokens
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        originalRequest.headers['Authorization'] = `Bearer ${token}`

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
