import { supabase, auth, db, storage } from '../lib/supabase.js'

class SupabaseApiService {
  constructor() {
    this.supabase = supabase
    this.auth = auth
  }

  // ==================== AUTHENTICATION ====================

  async signUp(email, password, userData) {
    try {
      const { data, error } = await this.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.userType || 'tenant',
            apartment: userData.apartment,
            phone: userData.phone
          }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  async signOut() {
    try {
      const { error } = await this.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async getProfile() {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  }

  async updateProfile(updates) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // ==================== BUILDINGS ====================

  async getBuildings() {
    try {
      const { data, error } = await this.supabase
        .from('buildings')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching buildings:', error)
      throw error
    }
  }

  async joinBuilding(buildingId, apartment) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('profiles')
        .update({ 
          building_id: buildingId, 
          apartment: apartment 
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error joining building:', error)
      throw error
    }
  }

  // ==================== BUSINESSES ====================

  async registerBusiness(businessData) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('businesses')
        .insert({
          ...businessData,
          owner_id: user.id
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error registering business:', error)
      throw error
    }
  }

  async getBusinessProfile() {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, icon, color)
        `)
        .eq('owner_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting business profile:', error)
      throw error
    }
  }

  async updateBusinessProfile(updates) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('businesses')
        .update(updates)
        .eq('owner_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating business profile:', error)
      throw error
    }
  }

  async getBusinesses() {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, icon, color),
          profiles!owner_id(name as owner_name)
        `)
        .eq('status', 'approved')
        .order('name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching businesses:', error)
      throw error
    }
  }

  async getBusinessDetails(businessId) {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, icon, color),
          profiles!owner_id(name as owner_name)
        `)
        .eq('id', businessId)
        .eq('status', 'approved')
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching business details:', error)
      throw error
    }
  }

  // ==================== BUSINESS CATEGORIES ====================

  async getBusinessCategories() {
    try {
      const { data, error } = await this.supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order, name')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching business categories:', error)
      throw error
    }
  }

  // ==================== BUSINESS SEARCH ====================

  async searchBusinesses(searchParams) {
    try {
      let query = this.supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, icon, color),
          profiles!owner_id(name as owner_name)
        `)
        .eq('status', 'approved')

      if (searchParams.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,address.ilike.%${searchParams.query}%`)
      }

      if (searchParams.categoryId) {
        query = query.eq('category_id', searchParams.categoryId)
      }

      if (searchParams.minRating && searchParams.minRating > 0) {
        // This would need a more complex query with business_reviews table
        // For now, we'll filter after fetching
      }

      const { data, error } = await query.order('name')

      if (error) throw error

      // Filter by rating if needed
      if (searchParams.minRating && searchParams.minRating > 0) {
        // This is a simplified approach - in production you'd want to do this in the database
        return data.filter(business => business.averageRating >= searchParams.minRating)
      }

      return data
    } catch (error) {
      console.error('Error searching businesses:', error)
      throw error
    }
  }

  // ==================== BUSINESS REVIEWS ====================

  async addBusinessReview(businessId, reviewData) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      // Check if user already reviewed this business
      const { data: existingReview } = await this.supabase
        .from('business_reviews')
        .select('id')
        .eq('business_id', businessId)
        .eq('reviewer_id', user.id)
        .single()

      if (existingReview) {
        throw new Error('You have already reviewed this business')
      }

      // Calculate spam score (simplified)
      const spamScore = this.calculateSpamScore(reviewData.comment)

      const { data, error } = await this.supabase
        .from('business_reviews')
        .insert({
          business_id: businessId,
          reviewer_id: user.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          spam_score: spamScore,
          status: spamScore > 0.7 ? 'flagged' : 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Add photos if provided
      if (reviewData.photos && reviewData.photos.length > 0) {
        await this.addReviewPhotos(data.id, reviewData.photos)
      }

      return data
    } catch (error) {
      console.error('Error adding business review:', error)
      throw error
    }
  }

  async getBusinessReviews(businessId, params = {}) {
    try {
      let query = this.supabase
        .from('business_reviews')
        .select(`
          *,
          profiles!reviewer_id(name as reviewer_name, apartment as reviewer_apartment),
          review_photos(*),
          review_responses(*)
        `)
        .eq('business_id', businessId)
        .eq('status', 'approved')

      if (params.sort === 'rating') {
        query = query.order('rating', { ascending: false })
      } else if (params.sort === 'helpful') {
        query = query.order('helpful_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching business reviews:', error)
      throw error
    }
  }

  async addReviewPhotos(reviewId, photos) {
    try {
      const photoData = photos.map(photo => ({
        review_id: reviewId,
        photo_url: photo.url,
        caption: photo.caption || ''
      }))

      const { error } = await this.supabase
        .from('review_photos')
        .insert(photoData)

      if (error) throw error
    } catch (error) {
      console.error('Error adding review photos:', error)
      throw error
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  calculateSpamScore(comment) {
    let score = 0
    
    // Check for repetitive words
    const words = comment.toLowerCase().split(/\s+/)
    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    Object.values(wordCount).forEach(count => {
      if (count > 3) score += 0.2
    })

    // Check for all caps
    if (comment === comment.toUpperCase() && comment.length > 10) {
      score += 0.3
    }

    // Check for excessive punctuation
    const punctuationCount = (comment.match(/[!?]{2,}/g) || []).length
    score += punctuationCount * 0.1

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /buy.*now/i,
      /click.*here/i,
      /free.*offer/i,
      /limited.*time/i,
      /\d{10,}/, // Long numbers
      /[A-Z]{5,}/ // All caps words
    ]

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(comment)) {
        score += 0.2
      }
    })

    return Math.min(score, 1.0)
  }

  // ==================== MAINTENANCE REQUESTS ====================

  async getMaintenanceRequests() {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await this.supabase
        .from('maintenance_requests')
        .select(`
          *,
          profiles!requester_id(name as requester_name),
          profiles!assigned_to(name as assigned_to_name)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      throw error
    }
  }

  async createMaintenanceRequest(requestData) {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const profile = await this.getProfile()
      if (!profile.building_id) {
        throw new Error('You must be part of a building to create maintenance requests')
      }

      const { data, error } = await this.supabase
        .from('maintenance_requests')
        .insert({
          ...requestData,
          requester_id: user.id,
          building_id: profile.building_id
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating maintenance request:', error)
      throw error
    }
  }

  // ==================== DASHBOARD METRICS ====================

  async getDashboardMetrics() {
    try {
      const { data: { user } } = await this.auth.getUser()
      if (!user) throw new Error('No user found')

      const profile = await this.getProfile()
      if (!profile.building_id) {
        return { error: 'No building associated' }
      }

      // Get various metrics
      const [
        maintenanceRequests,
        communityPosts,
        payments
      ] = await Promise.all([
        this.supabase
          .from('maintenance_requests')
          .select('*', { count: 'exact' })
          .eq('building_id', profile.building_id),
        this.supabase
          .from('community_posts')
          .select('*', { count: 'exact' })
          .eq('building_id', profile.building_id),
        this.supabase
          .from('payments')
          .select('*', { count: 'exact' })
          .eq('building_id', profile.building_id)
      ])

      return {
        totalMaintenanceRequests: maintenanceRequests.count || 0,
        totalCommunityPosts: communityPosts.count || 0,
        totalPayments: payments.count || 0,
        buildingId: profile.building_id
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  }
}

export default new SupabaseApiService()
