import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const BusinessRegistration = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    hours: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getBusinessCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.registerBusiness(formData);
      setSuccess(t('businessRegistrationSuccess'));
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t('businessRegistration')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('businessName')}
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessCategory')} *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('selectCategory')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessAddress')} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('businessAddress')}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessPhone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessEmail')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="business@example.com"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessWebsite')}
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* Business Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessHours')}
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mon-Fri 9:00-18:00, Sat 10:00-16:00"
                />
              </div>
            </div>

            {/* Business Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('businessDescription')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('businessDescription')}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? t('saving') : t('registerBusiness')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegistration;
