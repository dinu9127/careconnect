import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import Login from '../pages/auth/Login'
import { authService } from '../services/api'

// Mock the API service
vi.mock('../services/api', () => {
  return {
    authService: {
      login: vi.fn(),
    },
    default: {
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }
  }
})

describe('Login Component - Remember Me Option', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders Remember me checkbox unchecked by default and email field empty', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const rememberCheckbox = screen.getByLabelText('Remember me')

    expect(emailInput.value).toBe('')
    expect(rememberCheckbox.checked).toBe(false)
  })

  it('pre-fills email and checks checkbox if rememberedEmail is set in localStorage on mount', () => {
    localStorage.setItem('rememberedEmail', 'test@example.com')

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const rememberCheckbox = screen.getByLabelText('Remember me')

    expect(emailInput.value).toBe('test@example.com')
    expect(rememberCheckbox.checked).toBe(true)
  })

  it('stores email in localStorage if Remember me is checked and login succeeds', async () => {
    authService.login.mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'fake-token',
          role: 'client',
          name: 'Test User',
          email: 'submit@example.com'
        }
      }
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const rememberCheckbox = screen.getByLabelText('Remember me')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    // Input details
    fireEvent.change(emailInput, { target: { value: 'submit@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    // Check remember me
    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox.checked).toBe(true)

    // Submit form
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'submit@example.com',
        password: 'password123'
      })
    })

    expect(localStorage.getItem('rememberedEmail')).toBe('submit@example.com')
  })

  it('removes email from localStorage if Remember me is NOT checked and login succeeds', async () => {
    localStorage.setItem('rememberedEmail', 'old@example.com')
    
    authService.login.mockResolvedValue({
      data: {
        success: true,
        data: {
          token: 'fake-token',
          role: 'client',
          name: 'Test User',
          email: 'submit@example.com'
        }
      }
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('you@example.com')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const rememberCheckbox = screen.getByLabelText('Remember me')
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    // Uncheck remember me
    fireEvent.click(rememberCheckbox)
    expect(rememberCheckbox.checked).toBe(false)

    // Fill password (email is already pre-filled from mount)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Submit form
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled()
    })

    expect(localStorage.getItem('rememberedEmail')).toBeNull()
  })
})
