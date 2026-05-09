import { getAccessToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

export interface PremadeSongRecord {
  id: string;
  slug: string;
  title: string;
  description: string;
  occasion: string;
  mood: string;
  genre: string;
  prompt: string;
  lyrics?: string;
  style?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseSessionResponse {
  orderId: string;
  sessionId: string;
  paymentStatus: string;
  message: string;
  grantedCredits: {
    image: number;
    song: number;
  };
  mailedCards: number;
  currentBalances: {
    image: number;
    song: number;
    mailedCards?: number;
  };
}

export interface DeliveryRecord {
  cardId: string;
  format: 'physical' | 'digital';
  deliveryStatus: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  deliveryMessage?: string | null;
  shareToken?: string | null;
  shareUrl?: string | null;
  shippingAddress?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    country?: string;
  } | null;
  template?: {
    title?: string;
    occasion?: string;
    previewEmoji?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
  } | null;
  songId?: string | null;
  personalizationData?: Record<string, any> | null;
}

export interface SharedCardPayload {
  card: {
    id: string;
    format: 'physical' | 'digital';
    title: string;
    occasion?: string;
    recipientName?: string;
    personalMessage?: string;
    caption?: string;
    deliveryMessage?: string;
    previewEmoji?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
  };
  song: {
    id: string;
    title?: string;
    duration?: number;
    style?: string;
    generationMethod: string;
  } | null;
}

async function buildRequestConfig(options: ApiOptions = {}): Promise<RequestInit> {
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

  return config;
}

async function buildPublicRequestConfig(options: ApiOptions = {}): Promise<RequestInit> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  return config;
}

async function parseApiError(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type') || '';
  let errorData: any;

  try {
    errorData = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };
  } catch {
    errorData = { message: response.statusText };
  }

  throw new ApiError(
    errorData.message || `Request failed: ${response.statusText}`,
    response.status,
    errorData,
  );
}

export interface GuidedSongRequest {
  mode: 'guided';
  occasion: string;
  mood: string;
  genre: string;
  tempo?: string;
  vocal?: string;
  instrumentation?: string;
  recipientName?: string;
  personalMessage?: string;
  lyricalTheme?: string;
  additionalContext?: string;
  cardId?: string;
  model?: string;
}

export interface CardBasedSongRequest {
  mode: 'card_based';
  designPrompt: string;
  cardId?: string;
  model?: string;
}

export interface CustomSongRequest {
  mode: 'custom';
  prompt: string;
  lyrics?: string;
  style?: string;
  model?: string;
  cardId?: string;
}

export type GenerateSongRequest =
  | GuidedSongRequest
  | CardBasedSongRequest
  | CustomSongRequest;

export interface EnhancePromptResponse {
  enhancedPrompt: string;
  changes: string[];
}

export interface CardTemplateRecord {
  id: string;
  title: string;
  description?: string;
  category: string;
  occasion: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  previewEmoji?: string;
  isPersonalizable: boolean;
  isPopular: boolean;
  basePrice: number;
  config?: {
    requiresBirthday?: boolean;
    customFields?: string[];
    badge?: string;
  };
  isActive: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardTemplateQuery {
  category?: string;
  occasion?: string;
  search?: string;
  ready?: boolean;
  featured?: boolean;
  isPersonalizable?: boolean;
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
  const config = await buildRequestConfig(options);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    return parseApiError(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function requestPublic<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const config = await buildPublicRequestConfig(options);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    return parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function buildQueryString(params: object) {
  const searchParams = new URLSearchParams();

  Object.entries(params as Record<string, string | number | boolean | undefined>).forEach(
    ([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      searchParams.set(key, String(value));
    },
  );

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function requestBlob(endpoint: string, options: ApiOptions = {}): Promise<Blob> {
  const config = await buildRequestConfig(options);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    return parseApiError(response);
  }

  return response.blob();
}

async function requestPublicBlob(endpoint: string, options: ApiOptions = {}): Promise<Blob> {
  const config = await buildPublicRequestConfig(options);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    return parseApiError(response);
  }

  return response.blob();
}

// Music API
export const musicApi = {
  generateSong: (data: GenerateSongRequest) =>
    request<any>('/music/generate', { method: 'POST', body: data }),

  checkStatus: (songId: string) =>
    request<any>(`/music/status/${songId}`),

  generateLyrics: (prompt: string) =>
    request<any>('/music/generate-lyrics', { method: 'POST', body: { prompt } }),

  enhancePrompt: (prompt: string) =>
    request<EnhancePromptResponse>('/music/enhance-prompt', {
      method: 'POST',
      body: { prompt },
    }),

  linkSongToCard: (songId: string, cardId: string) =>
    request<any>(`/music/link/${songId}`, { method: 'POST', body: { cardId } }),

  getMySongs: () => request<any[]>('/music/my-songs'),

  getSongAudio: (songId: string) => requestBlob(`/music/audio/${songId}`),

  renameSong: (songId: string, title: string) =>
    request<any>(`/music/${songId}`, { method: 'PATCH', body: { title } }),

  getCredits: () =>
    request<{ image: number; song: number }>('/music/credits'),

  deleteSong: (songId: string) =>
    request<void>(`/music/${songId}`, { method: 'DELETE' }),
};

export const premadeSongsApi = {
  getAll: (query: { occasion?: string; mood?: string } = {}) =>
    request<PremadeSongRecord[]>(`/premade-songs${buildQueryString(query)}`),

  getOne: (id: string) => request<PremadeSongRecord>(`/premade-songs/${id}`),

  getAudio: (id: string) => requestBlob(`/premade-songs/${id}/audio`),

  select: (id: string) => request<any>(`/premade-songs/${id}/select`, { method: 'POST' }),
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

export const deliveryApi = {
  getCard: (cardId: string) => request<DeliveryRecord>(`/delivery/cards/${cardId}`),

  saveDigital: (
    cardId: string,
    data: { recipientName?: string; recipientEmail?: string; deliveryMessage?: string },
  ) => request<DeliveryRecord>(`/delivery/cards/${cardId}/digital`, { method: 'POST', body: data }),

  savePhysical: (
    cardId: string,
    data: {
      recipientName?: string;
      deliveryMessage?: string;
      shippingAddress: {
        fullName: string;
        line1: string;
        line2?: string;
        city: string;
        province: string;
        postalCode: string;
        country?: string;
      };
    },
  ) => request<DeliveryRecord>(`/delivery/cards/${cardId}/physical`, { method: 'POST', body: data }),

  getSharedCard: (token: string) => requestPublic<SharedCardPayload>(`/share/${token}`),

  getSharedSongAudio: (token: string) => requestPublicBlob(`/share/${token}/audio`),
};

export const purchasesApi = {
  createSession: (data: { packType: 'card' | 'credit'; packId: string }) =>
    request<PurchaseSessionResponse>('/purchases/create-session', {
      method: 'POST',
      body: data,
    }),
};

// Card Templates API
export const cardTemplatesApi = {
  getAll: (query: CardTemplateQuery = {}) =>
    request<CardTemplateRecord[]>(`/card-templates${buildQueryString(query)}`),

  getOne: (id: string) => request<CardTemplateRecord>(`/card-templates/${id}`),
};

// Users API
export const usersApi = {
  getMe: () => request<any>('/users/me'),
};

// Trust Circles API
export interface TrustCircle {
  id: string;
  ownerUserId: string;
  name: string;
  createdAt: string;
}

export interface TrustCircleMember {
  id: string;
  circleId: string;
  userId?: string;
  invitedEmail: string;
  status: 'pending' | 'active';
  createdAt: string;
}

export const trustCirclesApi = {
  getMyCircles: () => request<TrustCircle[]>('/trust-circles'),

  createCircle: (name: string) =>
    request<TrustCircle>('/trust-circles', { method: 'POST', body: { name } }),

  inviteMember: (circleId: string, email: string) =>
    request<TrustCircleMember>(`/trust-circles/${circleId}/invite`, { method: 'POST', body: { email } }),

  getMembers: (circleId: string) =>
    request<TrustCircleMember[]>(`/trust-circles/${circleId}/members`),

  deleteCircle: (circleId: string) =>
    request<void>(`/trust-circles/${circleId}`, { method: 'DELETE' }),

  removeMember: (circleId: string, memberId: string) =>
    request<void>(`/trust-circles/${circleId}/members/${memberId}`, { method: 'DELETE' }),

  acceptInvite: (token: string) =>
    request<void>('/trust-circles/accept', { method: 'POST', body: { token } }),
};

// Contacts API
export interface Contact {
  id: string;
  ownerUserId: string;
  contactName: string;
  contactEmail?: string;
  contactBirthday?: string;
  mailingAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPayload {
  contactName: string;
  contactEmail?: string;
  contactBirthday?: string;
  mailingAddress?: string;
  notes?: string;
}

export const contactsApi = {
  getContacts: () => request<Contact[]>('/contacts'),

  createContact: (data: CreateContactPayload) =>
    request<Contact>('/contacts', { method: 'POST', body: data }),

  updateContact: (id: string, data: Partial<CreateContactPayload>) =>
    request<Contact>(`/contacts/${id}`, { method: 'PATCH', body: data }),

  deleteContact: (id: string) =>
    request<void>(`/contacts/${id}`, { method: 'DELETE' }),
};

export { ApiError };
export default request;
