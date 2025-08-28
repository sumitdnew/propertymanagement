const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Dashboard
  async getDashboardMetrics() {
    return await this.request('/dashboard/metrics');
  }

  // Maintenance Requests
  async getMaintenanceRequests() {
    return await this.request('/maintenance-requests');
  }

  async createMaintenanceRequest(requestData) {
    return await this.request('/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async updateMaintenanceRequest(id, updates) {
    return await this.request(`/maintenance-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMaintenanceRequest(id) {
    return await this.request(`/maintenance-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Community Posts
  async getCommunityPosts() {
    return await this.request('/community-posts');
  }

  async createCommunityPost(postData) {
    return await this.request('/community-posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Tenants
  async getTenants() {
    return await this.request('/tenants');
  }

  async createTenant(tenantData) {
    return await this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id, updates) {
    return await this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Payments
  async getPayments() {
    return await this.request('/payments');
  }

  async createPayment(paymentData) {
    return await this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Invitations
  async getInvitations() {
    return await this.request('/invitations');
  }

  async createInvitation(invitationData) {
    return await this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(invitationData),
    });
  }

  async resendInvitation(id) {
    return await this.request(`/invitations/${id}/resend`, {
      method: 'POST',
    });
  }

  async cancelInvitation(id) {
    return await this.request(`/invitations/${id}`, {
      method: 'DELETE',
    });
  }

  // User Profile
  async getUserProfile() {
    return await this.request('/user/profile');
  }

  async updateUserProfile(profileData) {
    return await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Groups API methods
  async getGroups() {
    try {
      const response = await this.request('/groups');
      return response;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  }

  async createGroup(groupData) {
    try {
      const response = await this.request('/groups', {
        method: 'POST',
        body: JSON.stringify(groupData)
      });
      return response;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  async joinGroup(groupId) {
    try {
      const response = await this.request(`/groups/${groupId}/join`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async leaveGroup(groupId) {
    try {
      const response = await this.request(`/groups/${groupId}/leave`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  async getGroupPosts(groupId) {
    try {
      const response = await this.request(`/groups/${groupId}/posts`);
      return response;
    } catch (error) {
      console.error('Error fetching group posts:', error);
      throw error;
    }
  }

  async createGroupPost(groupId, postData) {
    try {
      const response = await this.request(`/groups/${groupId}/posts`, {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      return response;
    } catch (error) {
      console.error('Error creating group post:', error);
      throw error;
    }
  }
}

export default new ApiService();
