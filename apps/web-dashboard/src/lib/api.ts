export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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

export async function getStats() {
  return fetchApi('/alerts/stats')
}

export async function getUsers() {
  return fetchApi('/admin/users')
}

export async function getSettings() {
  return fetchApi('/settings/')
}

export async function updateSettings(data: any) {
  return fetchApi('/settings/', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function uploadFootage(file: File, cameraId: string, sector: string, priority: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (cameraId) formData.append('camera_id', cameraId)
  if (sector) formData.append('sector', sector)
  if (priority) formData.append('priority', priority)
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('astra_token') : null
  const response = await fetch(`${API_URL}/uploads/`, {
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

export async function getUploads() {
  return fetchApi('/uploads/')
}

export function uploadFootageWithProgress(
  file: File, 
  cameraId: string, 
  sector: string, 
  priority: string,
  onProgress: (percent: number) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    if (cameraId) formData.append('camera_id', cameraId)
    if (sector) formData.append('sector', sector)
    if (priority) formData.append('priority', priority)
    
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}/uploads/`)
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('astra_token') : null
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100)
        onProgress(percentComplete)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('astra_token')
        window.location.href = '/login'
        reject(new Error('Unauthorized - Redirecting to login'))
        return
      }
      
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`API error: ${xhr.status} ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error occurred during upload'))
    }

    xhr.send(formData)
  })
}

export async function analyzeVideo(id: string) {
  return fetchApi(`/uploads/${id}/analyze`, { method: 'POST' })
}

export async function batchAnalyzeVideos() {
  return fetchApi('/uploads/batch-analyze', { method: 'POST' })
}
