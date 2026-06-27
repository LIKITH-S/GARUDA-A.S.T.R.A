import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getHeaders() {
  const token = await SecureStore.getItemAsync('astra_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function loginApi(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append('username', username.trim().toLowerCase());
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    let errorMsg = 'Invalid credentials';
    try {
      const errData = await response.json();
      if (errData.error && errData.error.message) {
        errorMsg = errData.error.message;
      } else if (errData.detail) {
        errorMsg = errData.detail;
      }
    } catch(e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export async function updateAlertStatusApi(id: string, status: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/alerts/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    let errorText = 'Failed to update alert status';
    try {
      const errData = await response.json();
      errorText = JSON.stringify(errData);
    } catch (e) {
      errorText = await response.text();
    }
    throw new Error(`Failed to update alert status: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function getMissingPersonsApi() {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/missing-persons/`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to fetch missing persons. Status: ${response.status}, Body: ${errorText}`);
    throw new Error('Failed to fetch missing persons');
  }

  return response.json();
}

export async function getAlertsApi() {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/alerts/`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }

  return response.json();
}
