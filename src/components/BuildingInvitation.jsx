import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Building,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

const BuildingInvitation = ({ invitationToken, onJoinSuccess }) => {
  const { t } = useLanguage();
  const [invitation, setInvitation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    apartment: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Simulate fetching invitation data
    const fetchInvitation = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock invitation data - in real app this would come from API
        const mockInvitation = {
          id: 1,
          email: 'nuevo.inquilino@email.com',
          apartment: '4C',
          name: 'Laura Fernández',
          phone: '+54 11 3456-7890',
          rentAmount: 95000,
          status: 'pending',
          invitedBy: 'Admin',
          invitedDate: '2024-01-10',
          expiresAt: '2024-01-24',
          building: {
            name: 'Edificio Central',
            address: 'Av. Corrientes 1234, Buenos Aires',
            description: 'Edificio residencial en el centro de Buenos Aires'
          }
        };

        setInvitation(mockInvitation);
      } catch (error) {
        setError(t('errorLoadingInvitation'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.apartment || !formData.password) {
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      return false;
    }
    return true;
  };

  const handleJoinBuilding = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError(t('pleaseCompleteAllFields'));
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const userData = {
        id: Date.now(),
        email: invitation.email,
        name: formData.name,
        phone: formData.phone,
        apartment: formData.apartment,
        userType: 'tenant',
        building: invitation.building,
        isAuthenticated: true,
        createdAt: new Date().toISOString()
      };

      // Store user data
      localStorage.setItem('baPropertyManagerUser', JSON.stringify(userData));
      
      onJoinSuccess(userData);
    } catch (error) {
      setError(t('errorJoiningBuilding'));
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Building className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('loadingInvitation')}
          </h1>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('invalidInvitationTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (invitation?.status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                {t('invitationExpired')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('invitationExpiredMessage')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('joinBuilding')}
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('completeRegistrationToAccess')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Building Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center mb-3">
              <Building className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-blue-900">
                {invitation.building.name}
              </h3>
            </div>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{invitation.building.address}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>{t('apartment')}: {invitation.apartment}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{t('rent')}: ${invitation.rentAmount.toLocaleString()}/{t('month')}</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleJoinBuilding} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('yourFullName')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="+54 11 1234-5678"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('apartment')}
              </label>
              <input
                type="text"
                name="apartment"
                value={formData.apartment}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('apartmentExample')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')}
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="ml-2 text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isJoining}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('joining')}...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('joinBuilding')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('termsAndConditions')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingInvitation;
