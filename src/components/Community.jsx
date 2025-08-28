import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Star, 
  Users, 
  Building, 
  Globe, 
  Lock,
  ChevronRight,
  Calendar,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';

const Community = ({ openModal = null }) => {
  const { t } = useLanguage();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('groups'); // 'groups' or 'posts'

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsData = await api.getGroups();
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async (groupId) => {
    try {
      const posts = await api.getGroupPosts(groupId);
      setGroupPosts(posts);
    } catch (error) {
      console.error('Error fetching group posts:', error);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await api.joinGroup(groupId);
      fetchGroups(); // Refresh groups to update membership status
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await api.leaveGroup(groupId);
      fetchGroups(); // Refresh groups to update membership status
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
        setGroupPosts([]);
        setActiveTab('groups');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    fetchGroupPosts(group.id);
    setActiveTab('posts');
  };

  const getGroupTypeIcon = (type) => {
    switch (type) {
      case 'building':
        return <Building className="h-4 w-4" />;
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getGroupTypeLabel = (type) => {
    switch (type) {
      case 'building':
        return t('buildingGroup');
      case 'public':
        return t('publicGroup');
      case 'private':
        return t('privateGroup');
      default:
        return type;
    }
  };

  const GroupsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('community')}</h2>
        {openModal && (
          <button
            onClick={() => openModal('createGroup')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            <span>{t('createGroup')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getGroupTypeIcon(group.type)}
                  <span className="text-sm text-gray-500">{getGroupTypeLabel(group.type)}</span>
                </div>
                {group.isMember && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {t('member')}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>

              {group.buildingName && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Building className="h-4 w-4 mr-1" />
                  {group.buildingName}
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.memberCount} {t('members')}
                  </span>
                  <span className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {group.postCount} {t('posts')}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {group.isMember ? (
                  <>
                    <button
                      onClick={() => handleGroupClick(group)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {t('viewPosts')}
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                    >
                      {t('leave')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                  >
                    {t('joinGroup')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const GroupPosts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setSelectedGroup(null);
              setActiveTab('groups');
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedGroup?.name}</h2>
            <p className="text-gray-600">{selectedGroup?.description}</p>
          </div>
        </div>
        {openModal && (
          <button
            onClick={() => openModal('groupPost', { groupId: selectedGroup?.id })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>{t('newPost')}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groupPosts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{post.authorName?.[0] || 'U'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">{post.authorName}</h3>
                  {post.authorApartment && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.authorApartment}</span>
                    </>
                  )}
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <Star className="h-4 w-4" />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <MessageCircle className="h-4 w-4" />
                    <span>0</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeTab === 'groups' ? <GroupsList /> : <GroupPosts />}
    </div>
  );
};

export default Community;
