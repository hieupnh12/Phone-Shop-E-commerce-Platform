import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Plus } from 'lucide-react';
import Button from '../common/Button';
import InputField from '../common/InputField';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import VersionImageUpload from './VersionImageUpload';
import productService from '../../services/productService';
import { useLanguage } from '../../contexts/LanguageContext';

const VersionForm = ({ versions = [], onVersionsChange, ramList = [], romList = [], colorList = [], isEditMode = false, productId = null }) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentVersionId, setCurrentVersionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null, versionInfo: null });
  const [formData, setFormData] = useState({
    idRam: '',
    idRom: '',
    idColor: '',
    importPrice: '',
    exportPrice: '',
    stockQuantity: '',
    status: true,
    images: [],
  });

  const resetForm = () => {
    setFormData({
      idRam: '',
      idRom: '',
      idColor: '',
      importPrice: '',
      exportPrice: '',
      stockQuantity: '',
      status: true,
      images: [],
    });
    setEditingIndex(null);
    setCurrentVersionId(null);
  };

  const handleOpenModal = (index = null) => {
    if (index !== null) {
      const version = versions[index];
      setFormData({
        idRam: version.idRam,
        idRom: version.idRom,
        idColor: version.idColor,
        importPrice: version.importPrice,
        exportPrice: version.exportPrice,
        stockQuantity: version.stockQuantity,
        status: version.status,
        images: version.images || [],
        deletedImageIds: [], // Reset deleted image IDs when opening modal
      });
      setEditingIndex(index);
      // Get idVersion from either idVersion or idProductVersion field
      setCurrentVersionId(version.idVersion || version.idProductVersion || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImagesChange = (images, deletedImageIds = []) => {
    setFormData(prev => ({
      ...prev,
      images: images,
      deletedImageIds: deletedImageIds, // Track images to be deleted
    }));
  };

  const validateForm = () => {
    if (!formData.idRam) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.ramRequired') });
      return false;
    }

    const ramId = parseInt(formData.idRam);
    if (isNaN(ramId) || ramId <= 0) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.ramInvalid') });
      return false;
    }

    if (!formData.idRom) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.romRequired') });
      return false;
    }

    const romId = parseInt(formData.idRom);
    if (isNaN(romId) || romId <= 0) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.romInvalid') });
      return false;
    }

    if (!formData.idColor) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.colorRequired') });
      return false;
    }

    const colorId = parseInt(formData.idColor);
    if (isNaN(colorId) || colorId <= 0) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.colorInvalid') });
      return false;
    }

    if (!formData.importPrice || formData.importPrice.toString().trim() === '') {
      setToast({ type: 'error', message: t('admin.versionForm.errors.importPriceRequired') });
      return false;
    }

    const importPriceNum = parseFloat(formData.importPrice);
    if (isNaN(importPriceNum) || importPriceNum < 0) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.importPriceInvalid') });
      return false;
    }

    if (!formData.exportPrice || formData.exportPrice.toString().trim() === '') {
      setToast({ type: 'error', message: t('admin.versionForm.errors.exportPriceRequired') });
      return false;
    }

    const exportPriceNum = parseFloat(formData.exportPrice);
    if (isNaN(exportPriceNum) || exportPriceNum < 0) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.exportPriceInvalid') });
      return false;
    }

    if (exportPriceNum < importPriceNum) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.exportPriceTooLow') });
      return false;
    }

    if (formData.stockQuantity && formData.stockQuantity.toString().trim() !== '') {
      const stockQty = parseInt(formData.stockQuantity);
      if (isNaN(stockQty) || stockQty < 0) {
        setToast({ type: 'error', message: t('admin.versionForm.errors.stockInvalid') });
        return false;
      }
    }

    return true;
  };

  const handleAddOrUpdate = async () => {
    if (!validateForm()) return;

    const ramId = parseInt(formData.idRam);
    const romId = parseInt(formData.idRom);
    const colorId = parseInt(formData.idColor);

    if (editingIndex === null) {
      const isDuplicate = versions.some((v) => 
        parseInt(v.idRam) === ramId && 
        parseInt(v.idRom) === romId && 
        parseInt(v.idColor) === colorId
      );

      if (isDuplicate) {
        setToast({ type: 'error', message: t('admin.versionForm.errors.duplicateVersion') });
        return;
      }
    } else {
      const isDuplicate = versions.some((v, index) => 
        index !== editingIndex &&
        parseInt(v.idRam) === ramId && 
        parseInt(v.idRom) === romId && 
        parseInt(v.idColor) === colorId
      );

      if (isDuplicate) {
        setToast({ type: 'error', message: t('admin.versionForm.errors.duplicateVersion') });
        return;
      }
    }

    const newVersion = {
      idRam: ramId,
      idRom: romId,
      idColor: colorId,
      importPrice: parseFloat(formData.importPrice),
      exportPrice: parseFloat(formData.exportPrice),
      stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0,
      status: formData.status,
      images: formData.images || [],
      deletedImageIds: formData.deletedImageIds || [],
      Items: [],
    };

    if (editingIndex !== null && currentVersionId) {
      newVersion.idProductVersion = currentVersionId;
      newVersion.idVersion = currentVersionId;
    }

    try {
      if (editingIndex !== null) {
        const updatedVersions = [...versions];
        const existingVersion = updatedVersions[editingIndex];
        if (existingVersion.idProductVersion && !newVersion.idProductVersion) {
          newVersion.idProductVersion = existingVersion.idProductVersion;
          newVersion.idVersion = existingVersion.idVersion || existingVersion.idProductVersion;
        }
        updatedVersions[editingIndex] = newVersion;
        onVersionsChange(updatedVersions);
        setToast({ type: 'success', message: t('common.versionUpdateSuccess') });
      } else {
        onVersionsChange([...versions, newVersion]);
        setToast({ type: 'success', message: t('common.versionAddSuccess') });
      }

      handleCloseModal();
    } catch (error) {
      setToast({ type: 'error', message: t('admin.versionForm.errors.updateError') });
    }
  };

  const handleDeleteVersion = (index) => {
    const version = versions[index];
    const versionInfo = `${getRamName(version.idRam)} - ${getRomName(version.idRom)} - ${getColorName(version.idColor)}`;
    setDeleteModal({ isOpen: true, index, versionInfo });
  };

  const handleConfirmDeleteVersion = async () => {
    const { index } = deleteModal;
    const version = versions[index];
    
    const versionId = version?.idVersion || version?.idProductVersion;
    
    if (isEditMode && versionId) {
      try {
        const response = await productService.deleteProductVersion(versionId);
        const message = response?.message || response?.data?.message || t('common.versionDeleteSuccess');
        setToast({ type: 'success', message: message });
        
        const updatedVersions = versions.map((v, i) => {
          if (i === index) {
            return { ...v, status: false };
          }
          return v;
        });
        onVersionsChange(updatedVersions);
      } catch (error) {
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.error 
          || error.message 
          || t('admin.versionForm.errors.deleteError');
        setToast({ type: 'error', message: errorMessage });
        setDeleteModal({ isOpen: false, index: null, versionInfo: null });
        return;
      }
    } else {
      const updatedVersions = versions.filter((_, i) => i !== index);
      onVersionsChange(updatedVersions);
      setToast({ type: 'success', message: t('common.versionDeleteSuccess') });
    }
    
    setDeleteModal({ isOpen: false, index: null, versionInfo: null });
  };

  const getRamName = (ramId) => {
    const ram = ramList.find(r => r.idRam === ramId);
    return ram ? ram.nameRam : `RAM ${ramId}`;
  };

  const getRomName = (romId) => {
    const rom = romList.find(r => r.idRom === romId);
    return rom ? rom.nameRom : `ROM ${romId}`;
  };

  const getColorName = (colorId) => {
    const color = colorList.find(c => c.idColor === colorId);
    return color ? color.nameColor : `Màu ${colorId}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t('admin.versionForm.title')}</h3>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => handleOpenModal()}
        >
          {t('admin.versionForm.addVersion')}
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">{t('admin.versionForm.noVersions')}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {versions.map((version, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {getRamName(version.idRam)} - {getRomName(version.idRom)} - {getColorName(version.idColor)}
                </p>
                <p className="text-sm text-gray-600">
                  {t('admin.versionForm.importPriceLabel')}: {version.importPrice.toLocaleString()} VND | {t('admin.versionForm.exportPriceLabel')}: {version.exportPrice.toLocaleString()} VND | {t('admin.versionForm.quantityLabel')}: {version.stockQuantity}
                </p>
                {version.images && version.images.length > 0 && (
                  <p className="text-xs text-blue-600">
                    📷 {version.images.length} {t('admin.versionForm.imagesCount')}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {t('common.status')}: {version.status ? t('admin.versionForm.statusActive') : t('admin.versionForm.statusInactive')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(index)}
                >
                  {t('admin.versionForm.edit')}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDeleteVersion(index)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa Phiên Bản */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingIndex !== null ? t('admin.versionForm.editVersion') : t('admin.versionForm.addVersion')}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t('admin.versionForm.basicInfo')}</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('admin.versionForm.ram')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="idRam"
                  value={formData.idRam}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.versionForm.selectRam')}</option>
                  {ramList.map(ram => (
                    <option key={ram.idRam} value={ram.idRam}>
                      {ram.nameRam}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('admin.versionForm.rom')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="idRom"
                  value={formData.idRom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.versionForm.selectRom')}</option>
                  {romList.map(rom => (
                    <option key={rom.idRom} value={rom.idRom}>
                      {rom.nameRom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('admin.versionForm.color')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="idColor"
                  value={formData.idColor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.versionForm.selectColor')}</option>
                  {colorList.map(color => (
                    <option key={color.idColor} value={color.idColor}>
                      {color.nameColor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <InputField
                label={t('admin.versionForm.importPrice')}
                name="importPrice"
                type="number"
                placeholder="0"
                value={formData.importPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, importPrice: e.target.value }))}
                required
              />

              <InputField
                label={t('admin.versionForm.exportPrice')}
                name="exportPrice"
                type="number"
                placeholder="0"
                value={formData.exportPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, exportPrice: e.target.value }))}
                required
              />

              <InputField
                label={t('common.quantity')}
                name="stockQuantity"
                type="number"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleInputChange}
                id="versionStatus"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="versionStatus" className="text-sm font-medium text-gray-700 cursor-pointer">
                {t('admin.versionForm.versionActive')}
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">{t('admin.versionForm.versionImages')}</h4>
            <VersionImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={5}
              versionId={currentVersionId}
              isEditMode={isEditMode && currentVersionId !== null}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button variant="secondary" onClick={handleCloseModal}>
            {t('admin.versionForm.cancel')}
          </Button>
          <Button variant="primary" onClick={handleAddOrUpdate} disabled={isUploadingImages}>
            {isUploadingImages ? t('admin.versionForm.processing') : (editingIndex !== null ? t('admin.versionForm.update') : t('admin.versionForm.add'))}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null, versionInfo: null })}
        title={t('admin.versionForm.deleteTitle')}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>{t('common.warning')}:</strong> {t('admin.versionForm.deleteWarning')} "<strong>{deleteModal.versionInfo}</strong>". 
              {' '}{t('admin.noUndo')} {t('admin.cannotDelete')}
            </p>
          </div>

          <p className="text-gray-700">
            {t('admin.versionForm.deleteConfirm')}
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, index: null, versionInfo: null })}
          >
            {t('admin.versionForm.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDeleteVersion}
          >
            {t('admin.versionForm.delete')}
          </Button>
        </div>
      </Modal>

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

VersionForm.propTypes = {
  versions: PropTypes.arrayOf(PropTypes.shape({
    idRam: PropTypes.number,
    idRom: PropTypes.number,
    idColor: PropTypes.number,
    importPrice: PropTypes.number,
    exportPrice: PropTypes.number,
    stockQuantity: PropTypes.number,
    status: PropTypes.bool,
    images: PropTypes.array,
  })),
  onVersionsChange: PropTypes.func.isRequired,
  ramList: PropTypes.array,
  romList: PropTypes.array,
  colorList: PropTypes.array,
  isEditMode: PropTypes.bool,
  productId: PropTypes.number,
};

export default VersionForm;
