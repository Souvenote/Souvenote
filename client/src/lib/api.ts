import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const token = await getAccessToken();

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    throw new ApiError(
      errorData.message || `Request failed: ${response.statusText}`,
      response.status,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Music API
export const musicApi = {
  generateSong: (data: {
    prompt: string;
    lyrics?: string;
    style?: string;
    model?: string;
    cardId?: string;
    generationMethod?: string;
  }) => request<any>('/music/generate', { method: 'POST', body: data }),

  checkStatus: (songId: string) =>
    request<any>(`/music/status/${songId}`),

  generateLyrics: (prompt: string) =>
    request<any>('/music/generate-lyrics', { method: 'POST', body: { prompt } }),

  linkSongToCard: (songId: string, cardId: string) =>
    request<any>(`/music/link/${songId}`, { method: 'POST', body: { cardId } }),

  getMySongs: () => request<any[]>('/music/my-songs'),

  getCredits: () =>
    request<{ image: number; song: number }>('/music/credits'),

  deleteSong: (songId: string) =>
    request<void>(`/music/${songId}`, { method: 'DELETE' }),
};

// Greeting Cards API
export const cardsApi = {
  create: (data: any) =>
    request<any>('/greeting-cards', { method: 'POST', body: data }),

  getAll: () => request<any[]>('/greeting-cards'),

  getOne: (id: string) => request<any>(`/greeting-cards/${id}`),

  update: (id: string, data: any) =>
    request<any>(`/greeting-cards/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    request<void>(`/greeting-cards/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getMe: () => request<any>('/users/me'),
};

export { ApiError };
export default request;
