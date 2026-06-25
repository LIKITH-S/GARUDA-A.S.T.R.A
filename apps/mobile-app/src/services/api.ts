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
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  return response.json();
}

export async function verifyAlertApi(id: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/alerts/${id}/verify`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to verify alert');
  }

  return response.json();
}

export async function rejectAlertApi(id: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_URL}/alerts/${id}/reject`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to reject alert');
  }

  return response.json();
}
