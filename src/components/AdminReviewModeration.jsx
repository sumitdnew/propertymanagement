import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  CheckCircle,
  X,
  AlertTriangle,
  Eye,
  Clock,
  Filter,
  Search,
  Shield,
  Ban,
  Check,
  MoreHorizontal,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const AdminReviewModeration = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, flagged, all
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    flagged: 0,
    total: 0,
    averageSpamScore: 0
  });

  useEffect(() => {
    loadData();
  }, [filter, sortBy]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const reviewsData = await api.getAdminReviews({ 
        status: filter, 
        sort: sortBy,
        search: searchTerm 
      });
      
      setReviews(reviewsData);
      
      // Calculate stats
      const pendingCount = reviewsData.filter(r => r.status === 'pending').length;
      const flaggedCount = reviewsData.filter(r => r.status === 'flagged').length;
      const avgSpamScore = reviewsData.length > 0 
        ? reviewsData.reduce((sum, r) => sum + (r.spamScore || 0), 0) / reviewsData.length 
        : 0;
      
      setStats({
        pending: pendingCount,
        flagged: flaggedCount,
        total: reviewsData.length,
        averageSpamScore: avgSpamScore
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeration = async (reviewId, action, reason = '') => {
    try {
      await api.moderateReview(reviewId, action, reason);
      loadData(); // Reload to get updated data
      setError(t('reviewModerated'));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
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

  const getSpamScoreColor = (score) => {
    if (score >= 0.7) return 'text-red-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
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
            <h1 className="text-2xl font-bold text-gray-900">{t('reviewModeration')}</h1>
            <p className="text-gray-600">{t('moderateAndManageReviews')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('searchReviews')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('search')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">{t('pendingReviews')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              <p className="text-sm text-gray-600">{t('flaggedReviews')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">{t('totalReviews')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <div>
              <p className={`text-2xl font-bold ${getSpamScoreColor(stats.averageSpamScore)}`}>
                {(stats.averageSpamScore * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">{t('avgSpamScore')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">{t('pendingReviews')}</option>
              <option value="flagged">{t('flaggedReviews')}</option>
              <option value="all">{t('allReviews')}</option>
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
              <option value="spam">{t('highestSpamScore')}</option>
              <option value="reports">{t('mostReported')}</option>
            </select>
          </div>
        </div>
      </div>

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
              <div className="flex items-start justify-between">
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
                        {review.businessName} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-600">
                      {review.rating} {t('stars')}
                    </span>
                    {getStatusBadge(review.status)}
                    <span className={`text-sm font-medium ${getSpamScoreColor(review.spamScore)}`}>
                      {t('spamScore')}: {(review.spamScore * 100).toFixed(1)}%
                    </span>
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

                  {/* Review Stats */}
                  <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                    <span>{t('helpful')}: {review.helpfulCount || 0}</span>
                    <span>{t('notHelpful')}: {review.notHelpfulCount || 0}</span>
                    <span>{t('reports')}: {review.reportCount || 0}</span>
                    {review.isVerified && (
                      <span className="text-green-600 font-medium">{t('verified')}</span>
                    )}
                  </div>

                  {/* Reports */}
                  {review.reports && review.reports.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-red-900 mb-2">{t('reports')}:</p>
                      {review.reports.map(report => (
                        <div key={report.id} className="text-sm text-red-800 mb-1">
                          <span className="font-medium">{report.reason}:</span> {report.description}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Business Response */}
                  {review.responses && review.responses.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        {t('businessResponse')}:
                      </p>
                      <p className="text-sm text-blue-800">{review.responses[0].response}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setShowDetails(true);
                    }}
                    className="p-2 text-gray-600 hover:text-gray-800"
                    title={t('viewDetails')}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  {review.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleModeration(review.id, 'approve')}
                        className="p-2 text-green-600 hover:text-green-800"
                        title={t('approveReview')}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleModeration(review.id, 'reject')}
                        className="p-2 text-red-600 hover:text-red-800"
                        title={t('rejectReview')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleModeration(review.id, 'flag')}
                    className="p-2 text-yellow-600 hover:text-yellow-800"
                    title={t('flagReview')}
                  >
                    <Flag className="h-4 w-4" />
                  </button>
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

      {/* Review Details Modal */}
      {showDetails && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{t('reviewDetails')}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('reviewer')}</h3>
                  <p className="text-gray-700">{selectedReview.reviewerName || t('anonymous')}</p>
                  <p className="text-sm text-gray-600">{selectedReview.reviewerEmail}</p>
                  <p className="text-sm text-gray-600">{selectedReview.reviewerApartment}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('business')}</h3>
                  <p className="text-gray-700">{selectedReview.businessName}</p>
                  <p className="text-sm text-gray-600">{selectedReview.businessAddress}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">{t('review')}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-gray-600">
                    {selectedReview.rating} {t('stars')}
                  </span>
                </div>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">{t('reviewStats')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('spamScore')}:</span>
                    <span className={`ml-1 font-medium ${getSpamScoreColor(selectedReview.spamScore)}`}>
                      {(selectedReview.spamScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('helpful')}:</span>
                    <span className="ml-1 font-medium">{selectedReview.helpfulCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('notHelpful')}:</span>
                    <span className="ml-1 font-medium">{selectedReview.notHelpfulCount || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('reports')}:</span>
                    <span className="ml-1 font-medium">{selectedReview.reportCount || 0}</span>
                  </div>
                </div>
              </div>

              {selectedReview.reports && selectedReview.reports.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{t('reports')}</h3>
                  <div className="space-y-2">
                    {selectedReview.reports.map(report => (
                      <div key={report.id} className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-900">{report.reason}</span>
                          <span className="text-sm text-red-700">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-red-800 mt-1">{report.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  {t('close')}
                </button>
                {selectedReview.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleModeration(selectedReview.id, 'approve');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('approveReview')}
                    </button>
                    <button
                      onClick={() => {
                        handleModeration(selectedReview.id, 'reject');
                        setShowDetails(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('rejectReview')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewModeration;
