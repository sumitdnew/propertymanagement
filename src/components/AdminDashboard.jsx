import React from 'react';
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
  Camera
} from 'lucide-react';
import Community from './Community';
import { useLanguage } from '../contexts/LanguageContext';
import { exportToCSV, generateReportData } from '../utils/exportUtils';

const AdminDashboard = ({ 
  metrics, 
  maintenanceRequests, 
  tenants, 
  payments,
  invitations,
  openModal,
  resendInvitation,
  cancelInvitation
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'maintenance', label: t('maintenance'), icon: Wrench },
    { id: 'community', label: t('community'), icon: MessageCircle },
    { id: 'tenants', label: t('tenants'), icon: Users },
    { id: 'invitations', label: t('invitations'), icon: Mail },
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
            {maintenanceRequests?.slice(0, 3).map(request => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentPayments')}</h3>
          <div className="space-y-3">
            {payments?.slice(0, 3).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.tenantName || payment.tenantId}</p>
                  <p className="text-sm text-gray-600">{payment.apartment} • {payment.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${payment.amount.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'paid' ? t('paid') : t('pending')}
                  </span>
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
              {maintenanceRequests?.map(request => (
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
                      {request.status === 'pending' ? t('statusPending') :
                       request.status === 'in-progress' ? t('statusInProgress') : t('statusCompleted')}
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
                        onClick={() => openModal('delete-maintenance', request)}
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
        <div className="flex space-x-3">
          <button
            onClick={() => openModal('invitation')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" />
            <span>{t('inviteNewTenant')}</span>
          </button>
          <button
            onClick={() => openModal('tenant')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            <span>{t('newTenant')}</span>
          </button>
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
              {tenants?.map(tenant => (
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

  // Invitations Component
  const Invitations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">{t('invitationManagement')}</h2>
        <button
          onClick={() => openModal('invitation')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Mail className="h-4 w-4" />
          <span>{t('newInvitation')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {invitations?.filter(inv => inv.status === 'pending').length || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('accepted')}</p>
              <p className="text-2xl font-bold text-green-600">
                {invitations?.filter(inv => inv.status === 'accepted').length || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('expired')}</p>
              <p className="text-2xl font-bold text-red-600">
                {invitations?.filter(inv => inv.status === 'expired').length || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invited')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('apartment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invitationDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('expiresAt')}
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
              {invitations?.map(invitation => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invitation.name}</div>
                      <div className="text-sm text-gray-500">{invitation.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.apartment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.invitedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invitation.expiresAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invitation.status === 'pending' ? t('pending') :
                       invitation.status === 'accepted' ? t('accepted') : t('expired')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {invitation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => resendInvitation(invitation.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title={t('resendInvitation')}
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => cancelInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('cancelInvitation')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
              <p className="text-sm font-medium text-gray-600">{t('totalRevenue')}</p>
              <p className="text-2xl font-bold text-green-600">
                ${payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString() || '0'}
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
                ${payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString() || '0'}
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
                {payments?.length ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0}%
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
              {payments?.map(payment => (
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
  const Analytics = () => {
    const [selectedReport, setSelectedReport] = React.useState('maintenance');
    const [dateRange, setDateRange] = React.useState('month');
    const [isExporting, setIsExporting] = React.useState(false);

    // Calculate analytics data
    const calculateMaintenanceAnalytics = () => {
      const total = maintenanceRequests.length;
      const completed = maintenanceRequests.filter(req => req.status === 'completed').length;
      const pending = maintenanceRequests.filter(req => req.status === 'pending').length;
      const inProgress = maintenanceRequests.filter(req => req.status === 'in-progress').length;
      const highPriority = maintenanceRequests.filter(req => req.priority === 'high').length;
      const totalCost = maintenanceRequests.reduce((sum, req) => sum + (req.estimatedCost || 0), 0);
      const avgResponseTime = 2.3; // This would be calculated from actual data

      return { total, completed, pending, inProgress, highPriority, totalCost, avgResponseTime };
    };

    const calculateFinancialAnalytics = () => {
      const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
      const rentPayments = payments.filter(p => p.type === 'rent' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const otherPayments = payments.filter(p => p.type !== 'rent' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const occupancyRate = ((tenants.length / metrics.totalProperties) * 100).toFixed(1);

      return { totalRevenue, pendingPayments, rentPayments, otherPayments, occupancyRate };
    };

    const calculateOccupancyAnalytics = () => {
      const occupiedUnits = tenants.length;
      const vacantUnits = metrics.totalProperties - occupiedUnits;
      const occupancyRate = ((occupiedUnits / metrics.totalProperties) * 100).toFixed(1);
      const avgRent = payments.filter(p => p.type === 'rent' && p.status === 'paid').length > 0 
        ? payments.filter(p => p.type === 'rent' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) / payments.filter(p => p.type === 'rent' && p.status === 'paid').length
        : 0;

      return { occupiedUnits, vacantUnits, occupancyRate, avgRent };
    };

    const exportReport = async (type, format = 'json') => {
      setIsExporting(true);
      try {
        let filename = '';
        
        if (format === 'csv') {
          // Export as CSV
          const reportData = generateReportData(type, { maintenanceRequests, payments, tenants }, metrics);
          filename = `${type}-report-${dateRange}-${new Date().toISOString().split('T')[0]}`;
          exportToCSV(reportData, filename);
        } else {
          // Export as JSON
          let data = {};
          
          switch (type) {
            case 'maintenance':
              data = {
                reportType: 'Maintenance Report',
                dateRange: dateRange,
                generatedAt: new Date().toISOString(),
                summary: calculateMaintenanceAnalytics(),
                details: maintenanceRequests.map(req => ({
                  id: req.id,
                  title: req.title,
                  description: req.description,
                  status: req.status,
                  priority: req.priority,
                  apartment: req.apartment,
                  submittedBy: req.submittedBy,
                  estimatedCost: req.estimatedCost,
                  submittedDate: req.submittedDate
                }))
              };
              filename = `maintenance-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
              break;
              
            case 'financial':
              data = {
                reportType: 'Financial Report',
                dateRange: dateRange,
                generatedAt: new Date().toISOString(),
                summary: calculateFinancialAnalytics(),
                details: payments.map(payment => ({
                  id: payment.id,
                  tenantId: payment.tenantId,
                  apartment: payment.apartment,
                  amount: payment.amount,
                  type: payment.type,
                  status: payment.status,
                  method: payment.method,
                  date: payment.date
                }))
              };
              filename = `financial-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
              break;
              
            case 'occupancy':
              data = {
                reportType: 'Occupancy Report',
                dateRange: dateRange,
                generatedAt: new Date().toISOString(),
                summary: calculateOccupancyAnalytics(),
                details: tenants.map(tenant => ({
                  id: tenant.id,
                  name: tenant.name,
                  email: tenant.email,
                  apartment: tenant.apartment,
                  phone: tenant.phone,
                  userType: tenant.userType
                }))
              };
              filename = `occupancy-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
              break;
              
            case 'comprehensive':
              data = {
                reportType: 'Comprehensive Property Report',
                dateRange: dateRange,
                generatedAt: new Date().toISOString(),
                building: {
                  totalProperties: metrics.totalProperties,
                  activeTenants: metrics.activeTenants,
                  occupancyRate: metrics.occupancyRate
                },
                maintenance: calculateMaintenanceAnalytics(),
                financial: calculateFinancialAnalytics(),
                occupancy: calculateOccupancyAnalytics(),
                maintenanceRequests: maintenanceRequests,
                payments: payments,
                tenants: tenants
              };
              filename = `comprehensive-report-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
              break;
          }

          // Create and download JSON file
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setIsExporting(false);
      }
    };

    const maintenanceData = calculateMaintenanceAnalytics();
    const financialData = calculateFinancialAnalytics();
    const occupancyData = calculateOccupancyAnalytics();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('analyticsAndReports')}</h2>
          <div className="flex space-x-2">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">{t('lastWeek')}</option>
              <option value="month">{t('lastMonth')}</option>
              <option value="quarter">{t('lastQuarter')}</option>
              <option value="year">{t('lastYear')}</option>
            </select>
            <div className="relative">
              <button
                onClick={() => exportReport(selectedReport, 'json')}
                disabled={isExporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? t('exporting') : t('exportReport')}</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => exportReport(selectedReport, 'json')}
                    disabled={isExporting}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('exportAsJSON')}
                  </button>
                  <button
                    onClick={() => exportReport(selectedReport, 'csv')}
                    disabled={isExporting}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('exportAsCSV')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex space-x-4">
            {[
              { id: 'maintenance', label: t('maintenanceReport'), icon: Wrench },
              { id: 'financial', label: t('financialReport'), icon: DollarSign },
              { id: 'occupancy', label: t('occupancyReport'), icon: Building },
              { id: 'comprehensive', label: t('comprehensiveReport'), icon: BarChart3 }
            ].map(report => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedReport === report.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{report.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Maintenance Analytics */}
        {selectedReport === 'maintenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('maintenanceOverview')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{maintenanceData.total}</p>
                  <p className="text-sm text-gray-600">{t('totalRequests')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{maintenanceData.completed}</p>
                  <p className="text-sm text-gray-600">{t('completed')}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{maintenanceData.inProgress}</p>
                  <p className="text-sm text-gray-600">{t('inProgress')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{maintenanceData.pending}</p>
                  <p className="text-sm text-gray-600">{t('pending')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('maintenanceMetrics')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('highPriorityRequests')}</span>
                  <span className="text-sm font-medium text-gray-900">{maintenanceData.highPriority}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('totalEstimatedCost')}</span>
                  <span className="text-sm font-medium text-gray-900">${maintenanceData.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('averageResponseTime')}</span>
                  <span className="text-sm font-medium text-gray-900">{maintenanceData.avgResponseTime} {t('days')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('completionRate')}</span>
                  <span className="text-sm font-medium text-gray-900">{((maintenanceData.completed / maintenanceData.total) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Analytics */}
        {selectedReport === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('financialOverview')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">${financialData.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('totalRevenue')}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">${financialData.pendingPayments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('pendingPayments')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">${financialData.rentPayments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('rentPayments')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">${financialData.otherPayments.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('otherPayments')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('paymentBreakdown')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('rentPayments')}</span>
                  <span className="text-sm font-medium text-gray-900">${financialData.rentPayments.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(financialData.rentPayments / financialData.totalRevenue) * 100}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('otherPayments')}</span>
                  <span className="text-sm font-medium text-gray-900">${financialData.otherPayments.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(financialData.otherPayments / financialData.totalRevenue) * 100}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('occupancyRate')}</span>
                  <span className="text-sm font-medium text-gray-900">{financialData.occupancyRate}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Occupancy Analytics */}
        {selectedReport === 'occupancy' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('occupancyOverview')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{occupancyData.occupiedUnits}</p>
                  <p className="text-sm text-gray-600">{t('occupiedUnits')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{occupancyData.vacantUnits}</p>
                  <p className="text-sm text-gray-600">{t('vacantUnits')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{occupancyData.occupancyRate}%</p>
                  <p className="text-sm text-gray-600">{t('occupancyRate')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">${occupancyData.avgRent.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('averageRent')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tenantDistribution')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('totalUnits')}</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.totalProperties}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${occupancyData.occupancyRate}%` }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('occupiedUnits')}</span>
                  <span className="text-sm font-medium text-gray-900">{occupancyData.occupiedUnits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('vacantUnits')}</span>
                  <span className="text-sm font-medium text-gray-900">{occupancyData.vacantUnits}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Report */}
        {selectedReport === 'comprehensive' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('buildingMetrics')}</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{metrics.totalProperties}</p>
                  <p className="text-sm text-gray-600">{t('totalProperties')}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{metrics.activeTenants}</p>
                  <p className="text-sm text-gray-600">{t('activeTenants')}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{metrics.occupancyRate}%</p>
                  <p className="text-sm text-gray-600">{t('occupancyRate')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('maintenanceSummary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('totalRequests')}</span>
                  <span className="text-sm font-medium text-gray-900">{maintenanceData.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('pendingRequests')}</span>
                  <span className="text-sm font-medium text-gray-900">{maintenanceData.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('totalCost')}</span>
                  <span className="text-sm font-medium text-gray-900">${maintenanceData.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('financialSummary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('totalRevenue')}</span>
                  <span className="text-sm font-medium text-gray-900">${financialData.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('pendingPayments')}</span>
                  <span className="text-sm font-medium text-gray-900">${financialData.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('monthlyRevenue')}</span>
                  <span className="text-sm font-medium text-gray-900">${metrics.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Data Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('detailedData')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {selectedReport === 'maintenance' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('request')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('apartment')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('priority')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('estimatedCost')}</th>
                    </>
                  )}
                  {selectedReport === 'financial' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('tenant')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('apartment')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    </>
                  )}
                  {selectedReport === 'occupancy' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('apartment')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phone')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedReport === 'maintenance' && maintenanceRequests.slice(0, 10).map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.apartment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.priority === 'high' ? 'bg-red-100 text-red-800' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${request.estimatedCost?.toLocaleString() || 0}</td>
                  </tr>
                ))}
                {selectedReport === 'financial' && payments.slice(0, 10).map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.tenantName || payment.tenantId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.apartment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {selectedReport === 'occupancy' && tenants.slice(0, 10).map(tenant => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.apartment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">{t('dashboard')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'maintenance' && <Maintenance />}
        {activeTab === 'community' && <Community openModal={openModal} />}
        {activeTab === 'tenants' && <Tenants />}
        {activeTab === 'invitations' && <Invitations />}
        {activeTab === 'payments' && <Payments />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
};

export default AdminDashboard;
