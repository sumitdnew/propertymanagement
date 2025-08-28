import React, { useState, useCallback, useEffect } from 'react';
import {
  Home,
  Wrench,
  Users,
  MessageCircle,
  DollarSign,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Building,
  Car,
  Wifi,
  Shield,
  Camera,
  User,
  LogOut
} from 'lucide-react';
import Community from './Community';
import TenantDashboard from './TenantDashboard';
import AdminDashboard from './AdminDashboard';
import Auth from './Auth';
import UserProfile from './UserProfile';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const PropertyManagementApp = () => {
  const { t } = useLanguage();
  
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login, register
  const [showProfile, setShowProfile] = useState(false);

  // Main state management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Dashboard metrics
  const [metrics] = useState({
    totalProperties: 12,
    activeTenants: 48,
    pendingRequests: 7,
    monthlyRevenue: 1250000,
    maintenanceCosts: 180000,
    occupancyRate: 94
  });

  // Maintenance requests state
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    {
      id: 1,
      title: 'Fuga de agua en baño',
      description: t('waterLeakDescription'),
      status: 'pending',
      priority: 'high',
      submittedBy: 'María González',
      apartment: '3A',
      submittedDate: '2024-01-15',
      assignedTo: 'Plomería Rápida',
      estimatedCost: 25000,
      timeSpent: 0,
      vendor: {
        name: 'Plomería Rápida',
        phone: '+54 11 4567-8901',
        email: 'info@plomeria.com',
        rating: 4.8
      }
    },
    {
      id: 2,
      title: 'Ascensor fuera de servicio',
      description: 'El ascensor del edificio principal no funciona',
      status: 'in-progress',
      priority: 'critical',
      submittedBy: 'Carlos Rodríguez',
      apartment: 'Admin',
      submittedDate: '2024-01-14',
      assignedTo: 'Ascensores BA',
      estimatedCost: 150000,
      timeSpent: 4,
      vendor: {
        name: 'Ascensores BA',
        phone: '+54 11 3456-7890',
        email: 'servicio@ascensoresba.com',
        rating: 4.5
      }
    }
  ]);

  // Community posts state
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 1,
      author: 'Ana Martínez',
      apartment: '5B',
      content: '¿Alguien sabe si hay algún evento en el barrio este fin de semana?',
      timestamp: '2024-01-15T10:30:00',
      likes: 8,
      comments: 3,
      type: 'question'
    },
    {
      id: 2,
      author: 'Roberto Silva',
      apartment: '2C',
      content: 'Excelente trabajo del personal de limpieza hoy. ¡El edificio se ve impecable!',
      timestamp: '2024-01-15T09:15:00',
      likes: 12,
      comments: 1,
      type: 'appreciation'
    }
  ]);

  // Tenants state
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: 'María González',
      apartment: '3A',
      email: 'maria.gonzalez@email.com',
      phone: '+54 11 1234-5678',
      rentAmount: 85000,
      dueDate: '2024-01-25',
      status: 'current',
      leaseEnd: '2024-12-31'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      apartment: '1B',
      email: 'carlos.rodriguez@email.com',
      phone: '+54 11 2345-6789',
      rentAmount: 92000,
      dueDate: '2024-01-25',
      status: 'overdue',
      leaseEnd: '2024-06-30'
    }
  ]);

  // Payments state
  const [payments, setPayments] = useState([
    {
      id: 1,
      tenant: 'María González',
      apartment: '3A',
      amount: 85000,
      type: 'rent',
      date: '2024-01-25',
      status: 'paid',
      method: 'transfer'
    },
    {
      id: 2,
      tenant: 'Carlos Rodríguez',
      apartment: '1B',
      amount: 92000,
      type: 'rent',
      date: '2024-01-25',
      status: 'pending',
      method: 'cash'
    }
  ]);

  // Tenant invitations state
  const [invitations, setInvitations] = useState([
    {
      id: 1,
      email: 'nuevo.inquilino@email.com',
      apartment: '4C',
      name: 'Laura Fernández',
      phone: '+54 11 3456-7890',
      rentAmount: 95000,
      status: 'pending', // pending, accepted, expired
      invitedBy: 'Admin',
      invitedDate: '2024-01-10',
      expiresAt: '2024-01-24',
      invitationToken: 'abc123def456'
    },
    {
      id: 2,
      email: 'propietario.nuevo@email.com',
      apartment: '6A',
      name: 'Roberto Martínez',
      phone: '+54 11 4567-8901',
      rentAmount: 110000,
      status: 'accepted',
      invitedBy: 'Admin',
      invitedDate: '2024-01-05',
      expiresAt: '2024-01-19',
      invitationToken: 'xyz789abc123'
    }
  ]);

  // Modal handlers
  const openModal = useCallback((type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
  }, []);

  // CRUD operations
  const addMaintenanceRequest = useCallback((request) => {
    const newRequest = {
      ...request,
      id: Date.now(),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      timeSpent: 0
    };
    setMaintenanceRequests(prev => [...prev, newRequest]);
    closeModal();
  }, [closeModal]);

  const updateMaintenanceRequest = useCallback((id, updates) => {
    setMaintenanceRequests(prev => 
      prev.map(req => req.id === id ? { ...req, ...updates } : req)
    );
    closeModal();
  }, [closeModal]);

  const deleteMaintenanceRequest = useCallback((id) => {
    setMaintenanceRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const addCommunityPost = useCallback((post) => {
    const newPost = {
      ...post,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0
    };
    setCommunityPosts(prev => [...prev, newPost]);
    closeModal();
  }, [closeModal]);

  const addTenant = useCallback((tenant) => {
    const newTenant = {
      ...tenant,
      id: Date.now(),
      status: 'current'
    };
    setTenants(prev => [...prev, newTenant]);
    closeModal();
  }, [closeModal]);

  const sendTenantInvitation = useCallback((invitationData) => {
    const newInvitation = {
      ...invitationData,
      id: Date.now(),
      status: 'pending',
      invitedBy: 'Admin',
      invitedDate: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
      invitationToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    setInvitations(prev => [...prev, newInvitation]);
    
    // Simulate sending email invitation
    console.log('Sending invitation email to:', invitationData.email);
    console.log('Invitation link:', `https://ba-property-manager.com/invite/${newInvitation.invitationToken}`);
    
    closeModal();
  }, [closeModal]);

  const resendInvitation = useCallback((invitationId) => {
    const invitation = invitations.find(inv => inv.id === invitationId);
    if (invitation) {
      console.log('Resending invitation email to:', invitation.email);
      console.log('Invitation link:', `https://ba-property-manager.com/invite/${invitation.invitationToken}`);
    }
  }, [invitations]);

  const cancelInvitation = useCallback((invitationId) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  }, []);

  // Authentication handlers
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      api.getUserProfile()
        .then(user => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token is invalid, clear it
          api.logout();
        });
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setShowAuth(false);
    setAuthMode('login'); // Reset to login mode
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowProfile(false);
    setActiveTab('dashboard');
    setAuthMode('login'); // Reset to login mode
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const getUserRole = () => {
    if (!currentUser) return 'guest';
    return currentUser.userType === 'property-manager' || currentUser.userType === 'building-owner' ? 'admin' : 'tenant';
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'maintenance', label: t('maintenance'), icon: Wrench },
    { id: 'community', label: t('community'), icon: MessageCircle },
    { id: 'tenants', label: t('tenants'), icon: Users },
    { id: 'payments', label: t('payments'), icon: DollarSign },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 }
  ];

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalApartments')}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalProperties}</p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('activeMembers')}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeTenants}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('pendingRequests')}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingRequests}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('monthlyRevenue')}</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.monthlyRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('maintenanceCosts')}</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.maintenanceCosts.toLocaleString()}</p>
            </div>
            <Wrench className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('occupancyRate')}</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.occupancyRate}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentRequests')}</h3>
          <div className="space-y-3">
            {maintenanceRequests.slice(0, 3).map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{request.title}</p>
                  <p className="text-sm text-gray-600">{request.apartment} • {request.submittedBy}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.status === 'pending' ? t('statusPending') :
                   request.status === 'in-progress' ? t('statusInProgress') : t('statusCompleted')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity')}</h3>
          <div className="space-y-3">
            {communityPosts.slice(0, 3).map(post => (
              <div key={post.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{post.author[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-600">{post.content.substring(0, 50)}...</p>
                  <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Maintenance Component
  const Maintenance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('maintenanceManagement')}</h2>
        <button
          onClick={() => openModal('maintenance')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>{t('newRequest')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('request')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('estimatedCost')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {maintenanceRequests.map(request => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">{request.submittedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.apartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status === 'pending' ? t('pending') :
                       request.status === 'in-progress' ? t('inProgress') : t('completed')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.priority === 'high' ? 'bg-red-100 text-red-800' :
                      request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.priority === 'high' ? t('high') :
                       request.priority === 'medium' ? t('medium') : t('low')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${request.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view-maintenance', request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit-maintenance', request)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMaintenanceRequest(request.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  // Tenants Component
  const Tenants = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('tenantManagement')}</h2>
        <button
          onClick={() => openModal('tenant')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>{t('newTenant')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rentAmount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('paymentDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-sm text-gray-500">{tenant.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.apartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${tenant.rentAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tenant.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tenant.status === 'current' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tenant.status === 'current' ? t('paid') : t('overdue')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('view-tenant', tenant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal('edit-tenant', tenant)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Payments Component
  const Payments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('paymentManagement')}</h2>
        <button
          onClick={() => openModal('payment')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          <span>{t('newPayment')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
              <p className="text-2xl font-bold text-green-600">
                ${payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
              <p className="text-2xl font-bold text-orange-600">
                ${payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('collectionRate')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tenant')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('paymentMethod')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.apartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status === 'paid' ? t('paid') : t('pending')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.method === 'transfer' ? t('bankTransfer') : t('cash')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Analytics Component
  const Analytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('analyticsAndReports')}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('expensesByCategory')}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Plomería</span>
              <span className="text-sm font-medium text-gray-900">$45,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Electricidad</span>
              <span className="text-sm font-medium text-gray-900">$32,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ascensores</span>
              <span className="text-sm font-medium text-gray-900">$28,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '28%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('averageResponseTime')}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('average')}</span>
              <span className="text-sm font-medium text-gray-900">2.3 {t('daysAgo')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('urgentResponse')}</span>
              <span className="text-sm font-medium text-gray-900">4 {t('hoursAgo')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('regularResponse')}</span>
              <span className="text-sm font-medium text-gray-900">3.1 {t('daysAgo')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('monthlyReport')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">24</p>
            <p className="text-sm text-gray-600">{t('totalRequests')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-sm text-gray-600">{t('completed')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">4</p>
            <p className="text-sm text-gray-600">{t('statusInProgress')}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">2</p>
            <p className="text-sm text-gray-600">{t('pending')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Component
  const Modal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'maintenance':
          return (
            <form className="space-y-6">
              <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-2">{t('title')}</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={t('enterRequestTitle')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('description')} *</label>
                <textarea 
                  rows={4} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder={t('describeTheIssue')}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartment')}</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={currentUser?.apartment || t('enterApartment')}
                    defaultValue={currentUser?.apartment}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('priority')} *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                    <option value="low">{t('low')}</option>
                    <option value="medium">{t('medium')}</option>
                    <option value="high">{t('high')}</option>
                    <option value="urgent">{t('urgent')}</option>
                  </select>
                </div>
              </div>
            </form>
          );
        
        case 'createGroup':
          return (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupName')} *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={t('groupName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupDescription')}</label>
                <textarea 
                  rows={3} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder={t('groupDescription')}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('groupType')} *</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <option value="">{t('selectGroupType')}</option>
                  <option value="building">{t('buildingGroup')}</option>
                  <option value="public">{t('publicGroup')}</option>
                  <option value="private">{t('privateGroup')}</option>
                </select>
              </div>
            </form>
          );
        
        case 'groupPost':
          return (
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('content')} *</label>
                <textarea 
                  rows={4} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder={t('shareWithCommunity')}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('type')}</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                  <option value="general">{t('general')}</option>
                  <option value="question">{t('question')}</option>
                  <option value="event">{t('event')}</option>
                  <option value="appreciation">{t('appreciation')}</option>
                </select>
              </div>
            </form>
          );
        
                                   case 'tenant':
            return (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')} *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={t('fullName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartment')} *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder={t('apartmentExample')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')} *</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={t('emailExample')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="+54 11 1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('monthlyRent')}</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div>
              </form>
            );
         
                                       case 'payment':
             return (
               <form className="space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('tenant')} *</label>
                   <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                     <option value="">{t('selectTenant')}</option>
                     {tenants.map(tenant => (
                       <option key={tenant.id} value={tenant.id}>
                         {tenant.name} - {tenant.apartment}
                       </option>
                     ))}
                   </select>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('amount')} *</label>
                     <input 
                       type="number" 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                       placeholder="0"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('date')} *</label>
                     <input 
                       type="date" 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                     />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('type')}</label>
                     <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                       <option value="rent">{t('rent')}</option>
                       <option value="deposit">{t('deposit')}</option>
                       <option value="expense">{t('expense')}</option>
                       <option value="other">{t('other')}</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('method')}</label>
                     <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                       <option value="transfer">{t('bankTransfer')}</option>
                       <option value="cash">{t('cash')}</option>
                       <option value="check">{t('check')}</option>
                       <option value="card">{t('card')}</option>
                     </select>
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">{t('notes')}</label>
                   <textarea 
                     rows={3} 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                     placeholder={t('additionalNotes')}
                   ></textarea>
                 </div>
               </form>
             );

                     case 'invitation':
             return (
               <div className="space-y-6">
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                   <p className="text-sm text-blue-800">{t('invitationEmailSent')}</p>
                 </div>
                 
                 <form className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">{t('name')} *</label>
                       <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                         placeholder={t('fullName')}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">{t('apartment')} *</label>
                       <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                         placeholder={t('apartmentExample')}
                       />
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')} *</label>
                     <input 
                       type="email" 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                       placeholder={t('emailExample')}
                       required 
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
                     <input 
                       type="tel" 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                       placeholder="+54 11 1234-5678"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('rentAmount')}</label>
                     <input 
                       type="number" 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                       placeholder="0"
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('userType')}</label>
                     <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                       <option value="tenant">{t('tenant')}</option>
                       <option value="owner">{t('buildingOwner')}</option>
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">{t('personalizedMessage')} ({t('optional')})</label>
                     <textarea 
                       rows={3} 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                       placeholder={t('invitationEmailTemplate')}
                     ></textarea>
                   </div>
                 </form>
               </div>
             );
        
        default:
          return <div>Modal content not found</div>;
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {modalType === 'maintenance' && t('newMaintenanceRequest')}
              {modalType === 'community' && t('newCommunityPost')}
              {modalType === 'tenant' && t('newTenant')}
              {modalType === 'payment' && t('newPayment')}
              {modalType === 'invitation' && t('inviteNewTenant')}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {renderModalContent()}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    );
  };

    // Main render
  if (showAuth) {
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess}
        onBackToMain={() => {
          setShowAuth(false);
          setAuthMode('login');
        }}
        initialAuthMode={authMode}
      />
    );
  }

  if (showProfile) {
    return (
      <UserProfile 
        user={currentUser}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Language Toggle for unauthenticated users */}
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>
        
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Building className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            BA Property Manager
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Gestión inteligente de propiedades en Buenos Aires
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('welcomeMessage')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('subtitleMessage')}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuth(true);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('login')}
                </button>
                
                <div className="text-sm text-gray-600">
                  {t('noAccount')}{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuth(true);
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('signUpHere')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">BA Property Manager</h1>
              {currentUser?.building && (
                <span className="text-sm text-gray-500">
                  • {currentUser.building.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  {t('welcome').split(' ')[0]}, {currentUser?.name}
                </span>
                <button
                  onClick={() => setShowProfile(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <User className="h-5 w-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render appropriate dashboard based on user role */}
      {getUserRole() === 'admin' ? (
        <AdminDashboard
          metrics={metrics}
          maintenanceRequests={maintenanceRequests}
          tenants={tenants}
          payments={payments}
          invitations={invitations}
          openModal={openModal}
          resendInvitation={resendInvitation}
          cancelInvitation={cancelInvitation}
        />
      ) : (
        <TenantDashboard
          tenant={currentUser}
          maintenanceRequests={maintenanceRequests.filter(req => req.submittedBy === currentUser?.name)}
          payments={payments}
          openModal={openModal}
        />
      )}

      {/* Modal */}
      <Modal />
    </div>
  );
};

export default PropertyManagementApp;