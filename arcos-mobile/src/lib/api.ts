// API client for mobile app
// Use public domain via Cloudflare Zero Trust tunnel for outside network access
// Falls back to local IP for development/testing on same network
// Can be overridden with EXPO_PUBLIC_API_URL environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.2.189:3001/api';

console.log('API Base URL:', API_BASE_URL);

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('auth_token', token);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('auth_token');
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      this.token = await AsyncStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Public request (no auth required)
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.requestInternal<T>(endpoint, options, false);
  }

  private async requestInternal<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token && requireAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        return { error: error.error || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth endpoints (public, no auth required)
  async login(email: string, password: string) {
    const result = await this.requestInternal<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    if (result.data?.token) {
      await this.setToken(result.data.token);
    }
    return result;
  }

  async register(email: string, password: string) {
    const result = await this.requestInternal<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    if (result.data?.token) {
      await this.setToken(result.data.token);
    }
    return result;
  }

  async getCurrentUser() {
    return this.requestInternal('/auth/me', {}, true);
  }

  // Data endpoints (require auth)
  async getState() {
    return this.requestInternal('/data/state', {}, true);
  }

  async saveState(state: any) {
    return this.requestInternal('/data/state', {
      method: 'POST',
      body: JSON.stringify(state),
    }, true);
  }

  // Public data endpoints (no auth required)
  async getPublicProducts() {
    return this.request('/data/public/products');
  }

  async getPublicSettings() {
    return this.request('/data/public/settings');
  }

  // Inspiration endpoints (public, no auth required)
  async getInspirationCategories() {
    return this.request('/inspiration/categories');
  }

  async getInspirationImages(categoryId?: string) {
    const query = categoryId ? `?category=${categoryId}` : '';
    return this.request(`/inspiration/images${query}`);
  }

  async getInspirationImage(id: number) {
    return this.request(`/inspiration/images/${id}`);
  }

  // FAQ endpoints (public, no auth required)
  async getFAQCategories() {
    return this.request('/faq/categories');
  }

  async getFAQItems(categoryId?: string) {
    const query = categoryId ? `?category=${categoryId}` : '';
    return this.request(`/faq/items${query}`);
  }

  // Featured projects endpoints (public, no auth required)
  async getFeaturedProjects() {
    return this.request('/featured-projects');
  }

  // Services endpoints (public, no auth required)
  async getServices(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/services${query}`);
  }

  async getService(id: number) {
    return this.request(`/services/${id}`);
  }

  // About endpoints (public, no auth required)
  async getMilestones() {
    return this.request('/about/milestones');
  }

  async getHighlights() {
    return this.request('/about/highlights');
  }

  // Contact form (public, no auth)
  async submitContactForm(data: { fullName: string; email: string; phone?: string; company?: string; message: string }) {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }

  // Client endpoints (require auth)
  async getClients() {
    return this.requestInternal('/clients', {}, true);
  }

  async getClient(id: string) {
    return this.requestInternal(`/clients/${id}`, {}, true);
  }

  async createClient(data: any) {
    return this.requestInternal('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateClient(id: string, data: any) {
    return this.requestInternal(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteClient(id: string) {
    return this.requestInternal(`/clients/${id}`, { method: 'DELETE' }, true);
  }

  // Quote endpoints (require auth)
  async getQuotes() {
    return this.requestInternal('/quotes', {}, true);
  }

  async getQuote(id: string) {
    return this.requestInternal(`/quotes/${id}`, {}, true);
  }

  async createQuote(data: any) {
    return this.requestInternal('/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateQuote(id: string, data: any) {
    return this.requestInternal(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async deleteQuote(id: string) {
    return this.requestInternal(`/quotes/${id}`, { method: 'DELETE' }, true);
  }

  async getSharedQuote(token: string) {
    return this.request(`/quotes/share/${token}`);
  }

  async respondToQuote(token: string, action: 'approved' | 'rejected') {
    return this.request(`/quotes/share/${token}/respond`, { method: 'POST', body: JSON.stringify({ action }) });
  }

  // Notification endpoints (require auth)
  async getNotifications() {
    return this.requestInternal('/notifications', {}, true);
  }

  async getUnreadCount() {
    return this.requestInternal<{ count: number }>('/notifications/unread-count', {}, true);
  }

  async markNotificationRead(id: string) {
    return this.requestInternal(`/notifications/${id}/read`, { method: 'POST' }, true);
  }

  async markAllNotificationsRead() {
    return this.requestInternal('/notifications/read-all', { method: 'POST' }, true);
  }

  // Backup endpoints (require auth, admin)
  async getBackups() {
    return this.requestInternal('/backups', {}, true);
  }

  async createBackup() {
    return this.requestInternal('/backups', { method: 'POST' }, true);
  }

  async restoreBackup(filename: string) {
    return this.requestInternal('/backups/restore', { method: 'POST', body: JSON.stringify({ filename }) }, true);
  }

  async deleteBackup(filename: string) {
    return this.requestInternal(`/backups/${filename}`, { method: 'DELETE' }, true);
  }

  // Mail settings (require auth, admin)
  async getMailSettings() {
    return this.requestInternal('/settings/mail', {}, true);
  }

  async saveMailSettings(data: { smtpHost?: string; smtpPort?: number; smtpUser?: string; smtpPass?: string; contactEmail?: string }) {
    return this.requestInternal('/settings/mail', { method: 'PUT', body: JSON.stringify(data) }, true);
  }

  // Webhook endpoints (require auth, admin)
  async getWebhooks() {
    return this.requestInternal('/webhooks', {}, true);
  }

  async createWebhook(data: any) {
    return this.requestInternal('/webhooks', { method: 'POST', body: JSON.stringify(data) }, true);
  }

  async updateWebhook(id: string, data: any) {
    return this.requestInternal(`/webhooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true);
  }

  async deleteWebhook(id: string) {
    return this.requestInternal(`/webhooks/${id}`, { method: 'DELETE' }, true);
  }

  // Project share
  async getSharedProject(token: string) {
    return this.request(`/projects/share/${token}`);
  }

  async createProjectShare(productId: string) {
    return this.requestInternal<{ shareToken: string; shareUrl: string }>(`/projects/${productId}/share`, { method: 'POST' }, true);
  }

  async getDatabaseStatus(): Promise<'online' | 'offline'> {
    const result = await this.request<{ database: 'online' | 'offline' }>('/status');
    return result.data?.database ?? 'offline';
  }

  async logout() {
    await this.setToken(null);
  }
}

export const api = new ApiClient();
