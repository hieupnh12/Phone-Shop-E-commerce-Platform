import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Toast from '../common/Toast';
import productService from '../../services/productService';
import { useLanguage } from '../../contexts/LanguageContext';

const VersionImageUpload = ({ images = [], onImagesChange, maxImages = 5, versionId = null, isEditMode = false }) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState([]);
  const [toast, setToast] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(null);
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Track images to be deleted on submit

  // Initialize preview with existing images
  useEffect(() => {
    const initialPreview = (images || []).map((img, idx) => {
      if (img instanceof File) {
        return {
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(img),
          file: img,
          isNew: true,
          isFile: true
        };
      } else if (typeof img === 'string') {
        // URL string from backend
        return {
          id: img,
          url: img,
          file: null,
          isNew: false,
          isFile: false
        };
      } else if (img && typeof img === 'object') {
        // Object with images field from backend (ImageVersionResponse)
        const imageUrl = img.images || img.image || img.url || '';
        const imageId = img.imageId || img.idProductVersionImage || img.id;
        if (imageUrl) {
          return {
            id: imageId || imageUrl,
            url: imageUrl,
            file: null,
            isNew: false,
            isFile: false,
            imageId: imageId // Store the actual imageId from backend
          };
        }
      }
      return null;
    }).filter(Boolean);
    setPreview(initialPreview);
  }, [images]);

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({ type: 'error', message: t('admin.versionImageUpload.errors.imageOnly') });
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ type: 'error', message: t('admin.versionImageUpload.errors.fileTooLarge') });
        return false;
      }

      return true;
    });

    // Check total limit
    if (preview.length + newFiles.length > maxImages) {
      setToast({ type: 'error', message: t('admin.versionImageUpload.errors.maxImages', { max: maxImages }) });
      return;
    }

    // Add new files
    const newPreviews = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          id: Date.now() + Math.random(),
          url: reader.result,
          file: file,
          isNew: true,
          isFile: true
        });
        
        if (newPreviews.length === newFiles.length) {
          const updatedPreview = [...preview, ...newPreviews];
          setPreview(updatedPreview);
          updateParentComponent(updatedPreview);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const updateParentComponent = (currentPreview, deletedIds = []) => {
    // Send both File objects and URLs to parent
    const output = currentPreview.map(p => p.file || p.url);
    // Also send deleted image IDs if in edit mode
    if (isEditMode && deletedIds.length > 0) {
      onImagesChange(output, deletedIds);
    } else {
      onImagesChange(output);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleRemoveImage = (img) => {
    // Don't delete immediately, just mark for deletion on submit
    if (!img.isNew && isEditMode && versionId && !img.isFile && img.imageId) {
      // Track image ID to be deleted on submit
      const imageIdToDelete = img.imageId;
      setDeletedImageIds(prev => [...prev, imageIdToDelete]);
      setToast({ type: 'info', message: t('admin.versionImageUpload.imageWillDelete') });
    }

    // Remove from preview
    const newPreview = preview.filter(p => p.id !== img.id);
    setPreview(newPreview);
    updateParentComponent(newPreview, [...deletedImageIds, img.imageId].filter(Boolean));
  };

  const remainingSlots = maxImages - preview.length;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          disabled={remainingSlots === 0}
          className="hidden"
          id="version-image-input"
        />
        <label htmlFor="version-image-input" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-blue-500" />
            <p className="font-medium text-gray-900">
              {t('admin.versionImageUpload.dragDropOrClick')}
            </p>
            <p className="text-sm text-gray-600">
              {remainingSlots === 0 
                ? t('admin.versionImageUpload.reachedMax', { max: maxImages })
                : t('admin.versionImageUpload.maxRemaining', { remaining: remainingSlots })
              }
            </p>
          </div>
        </label>
      </div>

      {/* Image Preview Grid */}
      {preview.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t('admin.versionImageUpload.selectedImages', { current: preview.length, max: maxImages })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {preview.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.url}
                  alt="preview"
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  disabled={isDeletingImage === img.id}
                  className={`
                    absolute top-0 right-0 -m-2 bg-red-500 text-white rounded-full p-1
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${isDeletingImage === img.id ? 'cursor-wait' : 'cursor-pointer'}
                  `}
                  title={t('admin.versionImageUpload.deleteImage')}
                >
                  <X className="w-4 h-4" />
                </button>
                {img.isNew && (
                  <span className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                    {t('admin.versionImageUpload.new')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {preview.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{t('admin.versionImageUpload.noImagesSelected')}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default VersionImageUpload;
