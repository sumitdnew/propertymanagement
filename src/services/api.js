class ApiService {
  constructor() {
    // Use environment variable for base URL, fallback to localhost for development
    this.baseURL = process.env.REACT_APP_API_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://your-backend-domain.com/api' 
                     : 'http://localhost:5000/api');
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
    const url = `${this.baseURL}${endpoint}`;
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

  // ==================== BUSINESS API METHODS ====================

  // Business Registration and Management
  async registerBusiness(businessData) {
    try {
      const response = await this.request('/businesses/register', {
        method: 'POST',
        body: JSON.stringify(businessData)
      });
      return response;
    } catch (error) {
      console.error('Error registering business:', error);
      throw error;
    }
  }

  async getBusinessProfile() {
    try {
      const response = await this.request('/businesses/profile');
      return response;
    } catch (error) {
      console.error('Error fetching business profile:', error);
      throw error;
    }
  }

  async updateBusinessProfile(businessData) {
    try {
      const response = await this.request('/businesses/profile', {
        method: 'PUT',
        body: JSON.stringify(businessData)
      });
      return response;
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }

  async getBusinessReviews() {
    try {
      const response = await this.request('/businesses/reviews');
      return response;
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      throw error;
    }
  }

  async getBusinessAnalytics(period = '30') {
    try {
      const response = await this.request(`/businesses/analytics?period=${period}`);
      return response;
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw error;
    }
  }

  // Admin Business Management
  async getAdminBusinesses() {
    try {
      const response = await this.request('/admin/businesses');
      return response;
    } catch (error) {
      console.error('Error fetching businesses for admin:', error);
      throw error;
    }
  }

  async updateBusinessStatus(businessId, status) {
    try {
      const response = await this.request(`/admin/businesses/${businessId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      return response;
    } catch (error) {
      console.error('Error updating business status:', error);
      throw error;
    }
  }

  async getAdminBusinessDetails(businessId) {
    try {
      const response = await this.request(`/admin/businesses/${businessId}`);
      return response;
    } catch (error) {
      console.error('Error fetching business details for admin:', error);
      throw error;
    }
  }

  // Public Business Endpoints
  async getPublicBusinesses() {
    try {
      const response = await this.request('/businesses');
      return response;
    } catch (error) {
      console.error('Error fetching public businesses:', error);
      throw error;
    }
  }

  async getPublicBusinessDetails(businessId) {
    try {
      const response = await this.request(`/businesses/${businessId}`);
      return response;
    } catch (error) {
      console.error('Error fetching public business details:', error);
      throw error;
    }
  }

  async addBusinessReview(businessId, reviewData) {
    try {
      const response = await this.request(`/businesses/${businessId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      });
      return response;
    } catch (error) {
      console.error('Error adding business review:', error);
      throw error;
    }
  }

  async getPublicBusinessReviews(businessId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/businesses/${businessId}/reviews?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching public business reviews:', error);
      throw error;
    }
  }

  // ==================== ENHANCED REVIEW API METHODS ====================

  async voteOnReview(reviewId, voteType) {
    try {
      const response = await this.request(`/reviews/${reviewId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteType })
      });
      return response;
    } catch (error) {
      console.error('Error voting on review:', error);
      throw error;
    }
  }

  async reportReview(reviewId, reason, description) {
    try {
      const response = await this.request(`/reviews/${reviewId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason, description })
      });
      return response;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }

  async respondToReview(reviewId, response) {
    try {
      const response = await this.request(`/reviews/${reviewId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response })
      });
      return response;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  }

  async getReviewNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/review-notifications?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching review notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.request(`/review-notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // ==================== BUSINESS CATEGORIES API METHODS ====================

  async getBusinessCategories() {
    try {
      const response = await this.request('/business-categories');
      return response;
    } catch (error) {
      console.error('Error fetching business categories:', error);
      throw error;
    }
  }

  async createBusinessCategory(categoryData) {
    try {
      const response = await this.request('/admin/business-categories', {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
      return response;
    } catch (error) {
      console.error('Error creating business category:', error);
      throw error;
    }
  }

  async updateBusinessCategory(categoryId, categoryData) {
    try {
      const response = await this.request(`/admin/business-categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData)
      });
      return response;
    } catch (error) {
      console.error('Error updating business category:', error);
      throw error;
    }
  }

  async deleteBusinessCategory(categoryId) {
    try {
      const response = await this.request(`/admin/business-categories/${categoryId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Error deleting business category:', error);
      throw error;
    }
  }

  // ==================== BUSINESS SEARCH API METHODS ====================

  async searchBusinesses(searchParams) {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await this.request(`/businesses/search?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  async getBusinessesByCategory(categoryId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/businesses/category/${categoryId}?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching businesses by category:', error);
      throw error;
    }
  }

  async getNearbyBusinesses(params) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/businesses/nearby?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      throw error;
    }
  }

  // ==================== ADMIN REVIEW MODERATION API METHODS ====================

  async getAdminReviews(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/admin/reviews?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching admin reviews:', error);
      throw error;
    }
  }

  async moderateReview(reviewId, action, reason = '') {
    try {
      const response = await this.request(`/admin/reviews/${reviewId}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ action, reason })
      });
      return response;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  async getBusinessReviews(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/business/reviews?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      throw error;
    }
  }

  async getBusinessAnalytics() {
    try {
      const response = await this.request('/business/analytics');
      return response;
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw error;
    }
  }

  async getReviewNotifications(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request(`/business/review-notifications?${queryString}`);
      return response;
    } catch (error) {
      console.error('Error fetching review notifications:', error);
      throw error;
    }
  }
}

export default new ApiService();
