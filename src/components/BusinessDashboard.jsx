import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Building,
  Star,
  Eye,
  Phone,
  Mail,
  Globe,
  Clock,
  MapPin,
  Edit,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const BusinessDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profile');
  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);

  const tabs = [
    { id: 'profile', label: t('businessProfile'), icon: Building },
    { id: 'reviews', label: t('businessReviews'), icon: Star },
    { id: 'analytics', label: t('businessAnalytics'), icon: BarChart3 }
  ];

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      const [businessData, reviewsData, analyticsData] = await Promise.all([
        api.getBusinessProfile(),
        api.getBusinessReviews(),
        api.getBusinessAnalytics()
      ]);
      
      setBusiness(businessData);
      setReviews(reviewsData);
      setAnalytics(analyticsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-gray-600">{business.category}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(business.status)}`}>
              {getStatusIcon(business.status)}
              <span>{t(business.status)}</span>
            </span>
            {business.status === 'approved' && (
              <button
                onClick={() => setShowEditForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                <span>{t('edit')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('businessDetails')}
                  </h3>
                  
                  <div className="space-y-3">
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
                          <p className="text-sm text-gray-600">{business.phone}</p>
                        </div>
                      </div>
                    )}

                    {business.email && (
                      <div className="flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{t('businessEmail')}</p>
                          <p className="text-sm text-gray-600">{business.email}</p>
                        </div>
                      </div>
                    )}

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
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('businessDescription')}
                  </h3>
                  <p className="text-gray-600">
                    {business.description || t('noDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('businessReviews')} ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('noReviews')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
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
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('businessAnalytics')}
              </h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.summary?.totalViews || 0}
                      </p>
                      <p className="text-sm text-blue-600">{t('totalViews')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.summary?.totalContacts || 0}
                      </p>
                      <p className="text-sm text-green-600">{t('totalContacts')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {analytics.summary?.totalReviews || 0}
                      </p>
                      <p className="text-sm text-yellow-600">{t('totalReviews')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.summary?.averageRating?.toFixed(1) || '0.0'}
                      </p>
                      <p className="text-sm text-purple-600">{t('averageRating')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Chart Placeholder */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {t('analyticsAndReports')}
                </h4>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">{t('analyticsChartComingSoon')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
