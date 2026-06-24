import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import UpdateAvailability from '../pages/caregiver/UpdateAvailability'
import api from '../services/api'

// Mock api
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    }
  }
})

describe('UpdateAvailability Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches leave slots and bookings on mount and renders them', async () => {
    const mockCaregiver = {
      _id: 'caregiver123',
      leaveSlots: [
        {
          date: '2026-06-25T00:00:00.000Z',
          startTime: '09:00',
          endTime: '12:00',
          reason: 'Doctor Appointment'
        }
      ]
    }

    const mockBookings = [
      {
        _id: 'booking1',
        startDate: '2026-06-20T00:00:00.000Z',
        endDate: '2026-06-20T00:00:00.000Z',
        startTime: '10:00',
        endTime: '14:00',
        status: 'confirmed',
        client: { name: 'Client Alice' }
      }
    ]

    api.get.mockImplementation((url) => {
      if (url === '/caregivers/me') {
        return Promise.resolve({ data: { success: true, data: mockCaregiver } })
      }
      if (url === '/bookings/caregiver-bookings') {
        return Promise.resolve({ data: { success: true, data: mockBookings } })
      }
      return Promise.reject(new Error('Unknown url'))
    })

    render(
      <BrowserRouter>
        <UpdateAvailability />
      </BrowserRouter>
    )

    // Wait for the leave slot to be displayed in the list
    await waitFor(() => {
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument()
      expect(screen.getByText('09:00 - 12:00')).toBeInTheDocument()
    })
  })
})
