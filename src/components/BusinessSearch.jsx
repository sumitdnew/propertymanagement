import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Search,
  MapPin,
  Star,
  Filter,
  Grid,
  List,
  Map,
  Phone,
  Mail,
  Globe,
  Clock,
  Navigation,
  X,
  SlidersHorizontal
} from 'lucide-react';

const BusinessSearch = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, map
  const [showFilters, setShowFilters] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadCategories();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (searchQuery || selectedCategory || minRating > 0) {
      performSearch();
    }
  }, [searchQuery, selectedCategory, minRating, maxDistance]);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getBusinessCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }
  };

  const performSearch = async () => {
    setIsLoading(true);
    setError('');

    try {
      const searchParams = {
        query: searchQuery,
        categoryId: selectedCategory,
        minRating: minRating,
        maxDistance: maxDistance,
        limit: 50
      };

      if (userLocation) {
        searchParams.latitude = userLocation.latitude;
        searchParams.longitude = userLocation.longitude;
      }

      const results = await api.searchBusinesses(searchParams);
      setBusinesses(results);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating(0);
    setMaxDistance(10);
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

  const renderBusinessCard = (business) => (
    <div key={business.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{business.name}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: business.categoryColor + '20', color: business.categoryColor }}
              >
                {business.categoryName}
              </span>
              {business.distance && (
                <span className="text-sm text-gray-600 flex items-center">
                  <Navigation className="h-3 w-3 mr-1" />
                  {business.distance} km
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(business.averageRating || 0)}
            <span className="text-sm text-gray-600 ml-1">
              ({business.reviewCount || 0})
            </span>
          </div>
        </div>

        {business.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{business.description}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{business.address}</span>
          </div>
          
          {business.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{business.phone}</span>
            </div>
          )}

          {business.hours && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="truncate">{business.hours}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t('owner')}: {business.ownerName}
          </div>
          <div className="flex space-x-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBusinessList = (business) => (
    <div key={business.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: business.categoryColor + '20', color: business.categoryColor }}
            >
              {business.categoryName}
            </span>
          </div>
          
          {business.description && (
            <p className="text-gray-600 text-sm mb-3">{business.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{business.address}</span>
            </div>
            
            {business.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{business.phone}</span>
              </div>
            )}

            {business.hours && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="truncate">{business.hours}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-1">
            {renderStars(business.averageRating || 0)}
            <span className="text-sm text-gray-600">
              ({business.reviewCount || 0})
            </span>
          </div>
          
          {business.distance && (
            <span className="text-sm text-gray-600 flex items-center">
              <Navigation className="h-3 w-3 mr-1" />
              {business.distance} km
            </span>
          )}

          <div className="flex space-x-2">
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchBusinesses')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('businessCategory')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('minimumRating')}
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>{t('anyRating')}</option>
                  <option value={4.5}>4.5+ {t('stars')}</option>
                  <option value={4.0}>4.0+ {t('stars')}</option>
                  <option value={3.5}>3.5+ {t('stars')}</option>
                  <option value={3.0}>3.0+ {t('stars')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('maxDistance')} (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">{maxDistance} km</div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>{t('clearFilters')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t('searching')}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!isLoading && !error && businesses.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('noBusinessesFound')}
            </h3>
            <p className="text-gray-600">
              {t('tryAdjustingSearchFilters')}
            </p>
          </div>
        )}

        {!isLoading && !error && businesses.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {t('found')} {businesses.length} {t('businesses')}
              </p>
            </div>

            {viewMode === 'map' ? (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('mapViewComingSoon')}</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {businesses.map(renderBusinessList)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map(renderBusinessCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessSearch;
