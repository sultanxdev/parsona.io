import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../lib/axios'
import config from '../config/env'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Check for OAuth tokens in URL
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')

    if (token && refreshToken) {
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Clean URL
      window.history.replaceState({}, document.title, location.pathname)
    }

    // Fetch user if token exists
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [location])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      setUser(user)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    fetchUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}