// API client for web app
// Use relative URL in production (nginx proxies /api to backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
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

  // Auth endpoints
  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async register(email: string, password: string) {
    const result = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.data?.token) {
      this.setToken(result.data.token);
    }
    return result;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  /** Database status for dashboard: 'online' | 'offline' */
  async getDatabaseStatus(): Promise<'online' | 'offline'> {
    const result = await this.request<{ database: 'online' | 'offline' }>('/status');
    return result.data?.database ?? 'offline';
  }

  // Data endpoints
  async getState() {
    return this.request('/data/state');
  }

  async getPublicProducts() {
    return this.request('/data/public/products');
  }

  async getPublicSettings() {
    return this.request('/data/public/settings');
  }

  async saveState(state: any) {
    return this.request('/data/state', {
      method: 'POST',
      body: JSON.stringify(state),
    });
  }

  // Inspiration endpoints
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

  // FAQ endpoints
  async getFAQCategories() {
    return this.request('/faq/categories');
  }

  async getFAQItems(categoryId?: string) {
    const query = categoryId ? `?category=${categoryId}` : '';
    return this.request(`/faq/items${query}`);
  }

  // Featured projects endpoints
  async getFeaturedProjects() {
    return this.request('/featured-projects');
  }

  // Services endpoints
  async getServices(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request(`/services${query}`);
  }

  async getService(id: number) {
    return this.request(`/services/${id}`);
  }

  // About endpoints
  async getMilestones() {
    return this.request('/about/milestones');
  }

  async getHighlights() {
    return this.request('/about/highlights');
  }

  // Contact form
  async submitContactForm(data: { fullName: string; email: string; phone?: string; company?: string; message: string }) {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }

  // Client endpoints
  async getClients() { return this.request('/clients'); }
  async getClient(id: string) { return this.request(`/clients/${id}`); }
  async createClient(data: any) { return this.request('/clients', { method: 'POST', body: JSON.stringify(data) }); }
  async updateClient(id: string, data: any) { return this.request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteClient(id: string) { return this.request(`/clients/${id}`, { method: 'DELETE' }); }

  // Quote endpoints
  async getQuotes() { return this.request('/quotes'); }
  async getQuote(id: string) { return this.request(`/quotes/${id}`); }
  async createQuote(data: any) { return this.request('/quotes', { method: 'POST', body: JSON.stringify(data) }); }
  async updateQuote(id: string, data: any) { return this.request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteQuote(id: string) { return this.request(`/quotes/${id}`, { method: 'DELETE' }); }
  async getSharedQuote(token: string) { return this.request(`/quotes/share/${token}`); }
  async respondToQuote(token: string, action: 'approved' | 'rejected') {
    return this.request(`/quotes/share/${token}/respond`, { method: 'POST', body: JSON.stringify({ action }) });
  }

  // Jobs (priced custom projects → quote)
  async getJobs() { return this.request('/jobs'); }
  async getJob(id: string) { return this.request(`/jobs/${id}`); }
  async createJob(data: any) { return this.request('/jobs', { method: 'POST', body: JSON.stringify(data) }); }
  async updateJob(id: string, data: any) { return this.request(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteJob(id: string) { return this.request(`/jobs/${id}`, { method: 'DELETE' }); }
  async createQuoteFromJob(jobId: string, data: { replace?: boolean; ppn_pct?: number } = {}) {
    return this.request(`/jobs/${jobId}/quote`, { method: 'POST', body: JSON.stringify(data) });
  }
  async getJobLabourPresets() { return this.request('/jobs/labour-presets'); }
  async saveJobLabourPresets(presets: any[]) {
    return this.request('/jobs/labour-presets', { method: 'PUT', body: JSON.stringify({ presets }) });
  }

  // Notification endpoints
  async getNotifications() { return this.request('/notifications'); }
  async getUnreadCount() { return this.request<{ count: number }>('/notifications/unread-count'); }
  async markNotificationRead(id: string) { return this.request(`/notifications/${id}/read`, { method: 'POST' }); }
  async markAllNotificationsRead() { return this.request('/notifications/read-all', { method: 'POST' }); }

  // Backup endpoints
  async getBackups() { return this.request('/backups'); }
  async createBackup() { return this.request('/backups', { method: 'POST' }); }
  async restoreBackup(filename: string) { return this.request('/backups/restore', { method: 'POST', body: JSON.stringify({ filename }) }); }
  async deleteBackup(filename: string) { return this.request(`/backups/${filename}`, { method: 'DELETE' }); }

  // Mail settings (admin only)
  async getMailSettings() { return this.request<{ smtpHost: string; smtpPort: number; smtpUser: string; smtpPass: string; contactEmail: string }>('/settings/mail'); }
  async saveMailSettings(data: { smtpHost?: string; smtpPort?: number; smtpUser?: string; smtpPass?: string; contactEmail?: string }) { return this.request('/settings/mail', { method: 'PUT', body: JSON.stringify(data) }); }

  // Webhook endpoints
  async getWebhooks() { return this.request('/webhooks'); }
  async createWebhook(data: any) { return this.request('/webhooks', { method: 'POST', body: JSON.stringify(data) }); }
  async updateWebhook(id: string, data: any) { return this.request(`/webhooks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteWebhook(id: string) { return this.request(`/webhooks/${id}`, { method: 'DELETE' }); }

  // Project share
  async getSharedProject(token: string) { return this.request(`/projects/share/${token}`); }
  async createProjectShare(productId: string) { return this.request<{ shareToken: string; shareUrl: string }>(`/projects/${productId}/share`, { method: 'POST' }); }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
