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

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
