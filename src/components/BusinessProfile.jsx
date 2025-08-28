import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Building,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Navigation,
  MessageSquare,
  Heart,
  Share2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const BusinessProfile = () => {
  const { businessId } = useParams();
  const { t } = useLanguage();
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      const [businessData, reviewsData] = await Promise.all([
        api.getPublicBusinessDetails(businessId),
        api.getPublicBusinessReviews(businessId)
      ]);
      
      setBusiness(businessData);
      setReviews(reviewsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);

    try {
      await api.addBusinessReview(businessId, reviewForm);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      loadBusinessData(); // Reload to get updated reviews
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : '0.0';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('businessNotFound')}
        </h3>
        <p className="text-gray-600">
          {t('businessNotFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
                <div className="flex items-center space-x-4">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: business.categoryColor + '20', color: business.categoryColor }}
                  >
                    {business.categoryName}
                  </span>
                  <div className="flex items-center space-x-1">
                    {renderStars(business.averageRating || 0)}
                    <span className="ml-2">
                      {formatRating(business.averageRating)} ({business.reviewCount || 0} {t('reviews')})
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('businessDetails')}</h2>
            
            {business.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('businessDescription')}</h3>
                <p className="text-gray-600 leading-relaxed">{business.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('businessAddress')}</p>
                    <p className="text-sm text-gray-600">{business.address}</p>
                  </div>
                </div>

                {business.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('businessPhone')}</p>
                      <a 
                        href={`tel:${business.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {business.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('businessEmail')}</p>
                      <a 
                        href={`mailto:${business.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {business.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('businessWebsite')}</p>
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {business.website}
                      </a>
                    </div>
                  </div>
                )}

                {business.hours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t('businessHours')}</p>
                      <p className="text-sm text-gray-600">{business.hours}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t('ownerName')}</p>
                    <p className="text-sm text-gray-600">{business.ownerName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('businessReviews')} ({reviews.length})
              </h2>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t('addReview')}</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{t('noReviews')}</p>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('beFirstToReview')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {review.reviewerName?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.reviewerName || t('anonymous')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {review.reviewerApartment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 ml-13">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 ml-13">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
            <div className="space-y-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{t('callNow')}</span>
                </a>
              )}
              
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{t('sendEmail')}</span>
                </a>
              )}

              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>{t('visitWebsite')}</span>
                </a>
              )}

              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Star className="h-4 w-4" />
                <span>{t('writeReview')}</span>
              </button>
            </div>
          </div>

          {/* Business Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('businessStats')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('averageRating')}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(business.averageRating || 0)}
                  <span className="font-medium">{formatRating(business.averageRating)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('totalReviews')}</span>
                <span className="font-medium">{business.reviewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('businessCategory')}</span>
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: business.categoryColor + '20', color: business.categoryColor }}
                >
                  {business.categoryName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{t('writeReview')}</h2>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('rating')}
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('comment')}
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('shareYourExperience')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmittingReview ? t('submitting') : t('submitReview')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;
