import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dnuzwotulgkfxdrvlgmb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRudXp3b3R1bGdrZnhkcnZsZ21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0OTE1MTYsImV4cCI6MjA3ODA2NzUxNn0.dMy4lHJFLdS2RjYW0HG-d8llRW5SSlyp-8AvGcp9j9g'

export const supabase = createClient(supabaseUrl, supabaseKey)

export const apiService = {
  async getEmployees() {
    const token = localStorage.getItem('auth_token')
    if (!token) return []
    try {
      const response = await fetch('http://localhost:8000/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching employees:', error)
      return []
    }
  },

  async createEmployee(employee: any) {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    const response = await fetch('http://localhost:8000/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(employee)
    })
    if (!response.ok) throw new Error('Failed to create employee')
    return response.json()
  },

  async updateEmployee(employeeId: string, employee: any) {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    const response = await fetch(`http://localhost:8000/employees/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(employee)
    })
    if (!response.ok) throw new Error('Failed to update employee')
    return response.json()
  },

  async getLeaveRequests() {
    const token = localStorage.getItem('auth_token')
    if (!token) return []
    try {
      const response = await fetch('http://localhost:8000/leave-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      return []
    }
  },

  async createLeaveRequest(leave: any) {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    const response = await fetch('http://localhost:8000/leave-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(leave)
    })
    if (!response.ok) throw new Error('Failed to create leave request')
    return response.json()
  },

  async updateLeaveStatus(leaveId: string, status: string) {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    const response = await fetch(`http://localhost:8000/leave-requests/${leaveId}?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to update leave status')
    return response.json()
  },

  async getAttendanceCorrections() {
    const token = localStorage.getItem('auth_token')
    if (!token) return []
    try {
      const response = await fetch('http://localhost:8000/attendance-corrections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching corrections:', error)
      return []
    }
  },

  async updateCorrectionStatus(correctionId: string, status: string) {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('No auth token')
    const response = await fetch(`http://localhost:8000/attendance-corrections/${correctionId}?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Failed to update correction status')
    return response.json()
  },

  async getShifts() {
    try {
      const response = await fetch('http://localhost:8000/shifts')
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching shifts:', error)
      return []
    }
  },

  async createShift(shift: any) {
    const response = await fetch('http://localhost:8000/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift)
    })
    if (!response.ok) throw new Error('Failed to create shift')
    return response.json()
  },

  async deleteShift(shiftId: string) {
    const response = await fetch(`http://localhost:8000/shifts/${shiftId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete shift')
    return response.json()
  },

  async getHolidays() {
    try {
      const response = await fetch('http://localhost:8000/holidays')
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching holidays:', error)
      return []
    }
  },

  async createHoliday(holiday: any) {
    const response = await fetch('http://localhost:8000/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holiday)
    })
    if (!response.ok) throw new Error('Failed to create holiday')
    return response.json()
  },

  async deleteHoliday(holidayId: string) {
    const response = await fetch(`http://localhost:8000/holidays/${holidayId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete holiday')
    return response.json()
  },

  async getGeofencing() {
    try {
      const response = await fetch('http://localhost:8000/geofencing')
      if (!response.ok) return []
      return response.json()
    } catch (error) {
      console.error('Error fetching geofencing:', error)
      return []
    }
  },

  async createGeofencing(geo: any) {
    const response = await fetch('http://localhost:8000/geofencing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geo)
    })
    if (!response.ok) throw new Error('Failed to create geofencing')
    return response.json()
  },

  async deleteGeofencing(geoId: string) {
    const response = await fetch(`http://localhost:8000/geofencing/${geoId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete geofencing')
    return response.json()
  }
}