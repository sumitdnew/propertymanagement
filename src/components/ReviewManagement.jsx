import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Reply,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  Clock,
  Calendar
} from 'lucide-react';

const ReviewManagement = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, flagged, approved
  const [sortBy, setSortBy] = useState('newest');
  const [showResponseForm, setShowResponseForm] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    loadData();
  }, [filter, sortBy]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, analyticsData, notificationsData] = await Promise.all([
        api.getBusinessReviews({ status: filter, sort: sortBy }),
        api.getBusinessAnalytics(),
        api.getReviewNotifications()
      ]);
      
      setReviews(reviewsData);
      setAnalytics(analyticsData);
      setNotifications(notificationsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    try {
      await api.voteOnReview(reviewId, voteType);
      loadData(); // Reload to get updated vote counts
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReport = async (reviewId, reason) => {
    try {
      await api.reportReview(reviewId, reason, '');
      setError(t('reviewReported'));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRespond = async (reviewId) => {
    if (!responseText.trim() || responseText.length < 10) {
      setError(t('responseMinLength'));
      return;
    }

    try {
      await api.respondToReview(reviewId, responseText);
      setShowResponseForm(null);
      setResponseText('');
      loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      flagged: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: X }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        <span>{t(status)}</span>
      </span>
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('reviewManagement')}</h1>
            <p className="text-gray-600">{t('manageAndRespondToReviews')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{t('allReviews')}</option>
                <option value="pending">{t('pendingReviews')}</option>
                <option value="flagged">{t('flaggedReviews')}</option>
                <option value="approved">{t('approvedReviews')}</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{t('newestFirst')}</option>
                <option value="rating">{t('highestRating')}</option>
                <option value="helpful">{t('mostHelpful')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary?.averageRating?.toFixed(1) || '0.0'}
                </p>
                <p className="text-sm text-gray-600">{t('averageRating')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary?.totalReviews || 0}
                </p>
                <p className="text-sm text-gray-600">{t('totalReviews')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.summary?.totalViews || 0}
                </p>
                <p className="text-sm text-gray-600">{t('totalViews')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'flagged').length}
                </p>
                <p className="text-sm text-gray-600">{t('flaggedReviews')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentNotifications')}</h2>
          <div className="space-y-3">
            {notifications.slice(0, 5).map(notification => (
              <div
                key={notification.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex-1">
                  <p className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-blue-900'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-blue-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('reviews')} ({reviews.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {reviews.map(review => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
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
                        {review.reviewerApartment} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      {review.rating} {t('stars')}
                    </span>
                    {getStatusBadge(review.status)}
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="mb-3">
                      <div className="flex space-x-2">
                        {review.photos.map(photo => (
                          <img
                            key={photo.id}
                            src={photo.photoUrl}
                            alt="Review photo"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vote Actions */}
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => handleVote(review.id, 'helpful')}
                      className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpfulCount || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote(review.id, 'not_helpful')}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>{review.notHelpfulCount || 0}</span>
                    </button>
                    <button
                      onClick={() => handleReport(review.id, 'inappropriate')}
                      className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                    >
                      <Flag className="h-4 w-4" />
                      <span>{t('report')}</span>
                    </button>
                  </div>

                  {/* Business Response */}
                  {review.responses && review.responses.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        {t('businessResponse')}:
                      </p>
                      <p className="text-sm text-blue-800">{review.responses[0].response}</p>
                    </div>
                  )}

                  {/* Response Form */}
                  {showResponseForm === review.id ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={t('writeResponse')}
                        maxLength={500}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setShowResponseForm(null)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={() => handleRespond(review.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {t('respond')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResponseForm(review.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Reply className="h-4 w-4" />
                      <span>{t('respondToReview')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('noReviewsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
