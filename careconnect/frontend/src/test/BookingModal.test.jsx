import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import BookingModal from '../components/ui/BookingModal'
import api from '../services/api'

// Mock api and authService
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    },
    authService: {
      getProfile: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: {
            name: 'Client Bob',
            phone: '123456789',
            address: '123 Main St',
            careReceiverName: 'Alice Bob',
            careReceiverRelationship: 'Mother',
            geoLocation: { coordinates: [79.86, 6.92] }
          }
        }
      })
    }
  }
})

describe('BookingModal Component - Leave slots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and renders leave slots as disabled in the booking calendar', async () => {
    const mockCaregiver = {
      _id: 'caregiver999',
      user: { name: 'Caregiver Jane' },
      hourlyRate: 500,
      serviceTypes: ['Childcare']
    }

    const mockProfileResponse = {
      success: true,
      data: {
        _id: 'caregiver999',
        bookedDates: [],
        leaveSlots: [
          {
            date: '2026-06-25T00:00:00.000Z',
            startTime: '09:00',
            endTime: '17:00',
            reason: 'Vacation'
          }
        ]
      }
    }

    api.get.mockResolvedValue({ data: mockProfileResponse })

    render(
      <BrowserRouter>
        <BookingModal
          caregiver={mockCaregiver}
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      </BrowserRouter>
    )

    // Wait for caregiver profile fetch to complete
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/caregivers/caregiver999')
    })

    // Check if the "Leave" legend element is rendered
    expect(screen.getByText('Leave')).toBeInTheDocument()

    // Find the button for date 25. Note that we render the day of the month as button text.
    const dateButtons = screen.getAllByRole('button')
    const button25 = dateButtons.find(btn => btn.textContent === '25')

    expect(button25).toBeInTheDocument()
    // It should be disabled since it is a leave date
    expect(button25).toBeDisabled()
    // It should have the appropriate tooltip title
    expect(button25.getAttribute('title')).toBe('Leave: Vacation (09:00 - 17:00)')
  })
})
