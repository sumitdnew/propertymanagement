import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import {
  Star,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const ReviewForm = ({ businessId, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (photos.length + files.length > 5) {
      setError(t('maxPhotosLimit'));
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('photoSizeLimit'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError(t('invalidPhotoType'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          caption: ''
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const updatePhotoCaption = (photoId, caption) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, caption } : photo
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate inputs
      if (!comment.trim() || comment.trim().length < 10) {
        setError(t('reviewMinLength'));
        return;
      }

      if (comment.length > 1000) {
        setError(t('reviewMaxLength'));
        return;
      }

      // Upload photos first (in a real app, you'd upload to a file service)
      const uploadedPhotos = await Promise.all(
        photos.map(async (photo) => {
          // Simulate photo upload - in real app, upload to cloud storage
          return {
            url: photo.url,
            caption: photo.caption
          };
        })
      );

      // Submit review
      await api.addBusinessReview(businessId, {
        rating,
        comment: comment.trim(),
        photos: uploadedPhotos
      });

      setSuccess(t('reviewSubmittedSuccess'));
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = comment.length;
  const isCommentValid = comment.trim().length >= 10 && comment.length <= 1000;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('writeReview')}</h2>
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('rating')} *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {rating} {t('stars')}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('reviewComment')} *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isCommentValid ? 'border-gray-300' : 'border-red-300'
              }`}
              placeholder={t('shareYourExperience')}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-sm ${isCommentValid ? 'text-gray-500' : 'text-red-500'}`}>
                {t('minCharacters')}: 10, {t('maxCharacters')}: 1000
              </p>
              <p className={`text-sm ${characterCount > 900 ? 'text-red-500' : 'text-gray-500'}`}>
                {characterCount}/1000
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('addPhotos')} ({t('optional')})
            </label>
            
            {/* Photo Upload Button */}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors"
              >
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">{t('clickToUploadPhotos')}</p>
                  <p className="text-xs text-gray-500">{t('max5Photos')} • {t('max5MBEach')}</p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">{t('uploadedPhotos')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt="Review photo"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updatePhotoCaption(photo.id, e.target.value)}
                        placeholder={t('addCaption')}
                        className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        maxLength={100}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">{t('reviewGuidelines')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('guidelineBeHonest')}</li>
              <li>• {t('guidelineBeRespectful')}</li>
              <li>• {t('guidelineNoSpam')}</li>
              <li>• {t('guidelinePersonalExperience')}</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isCommentValid}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('submitting') : t('submitReview')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
