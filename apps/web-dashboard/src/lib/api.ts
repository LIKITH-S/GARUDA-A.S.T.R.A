const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('astra_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })
  
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('astra_token')
    window.location.href = '/login'
    throw new Error('Unauthorized - Redirecting to login')
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export async function getAlerts() {
  return fetchApi('/alerts/')
}

export async function verifyAlert(id: string) {
  return fetchApi(`/alerts/${id}/verify`, { method: 'POST' })
}

export async function rejectAlert(id: string) {
  return fetchApi(`/alerts/${id}/reject`, { method: 'POST' })
}

export async function getMissingPersons() {
  return fetchApi('/missing-persons/')
}

export async function createMissingPerson(data: any) {
  return fetchApi('/missing-persons/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function uploadMissingPersonImage(id: string, file: File) {
  const formData = new FormData()
  formData.append('image', file)
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('astra_token') : null
  const response = await fetch(`${API_URL}/missing-persons/${id}/image`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: formData,
  })
  
  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('astra_token')
    window.location.href = '/login'
    throw new Error('Unauthorized - Redirecting to login')
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}
