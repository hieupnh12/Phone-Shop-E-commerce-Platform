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
      setToast({ type: 'error', message: 'Vui lòng chọn RAM' });
      return false;
    }

    const ramId = parseInt(formData.idRam);
    if (isNaN(ramId) || ramId <= 0) {
      setToast({ type: 'error', message: 'RAM không hợp lệ' });
      return false;
    }

    if (!formData.idRom) {
      setToast({ type: 'error', message: 'Vui lòng chọn ROM' });
      return false;
    }

    const romId = parseInt(formData.idRom);
    if (isNaN(romId) || romId <= 0) {
      setToast({ type: 'error', message: 'ROM không hợp lệ' });
      return false;
    }

    if (!formData.idColor) {
      setToast({ type: 'error', message: 'Vui lòng chọn màu sắc' });
      return false;
    }

    const colorId = parseInt(formData.idColor);
    if (isNaN(colorId) || colorId <= 0) {
      setToast({ type: 'error', message: 'Màu sắc không hợp lệ' });
      return false;
    }

    if (!formData.importPrice || formData.importPrice.toString().trim() === '') {
      setToast({ type: 'error', message: 'Giá nhập không được để trống' });
      return false;
    }

    const importPriceNum = parseFloat(formData.importPrice);
    if (isNaN(importPriceNum) || importPriceNum < 0) {
      setToast({ type: 'error', message: 'Giá nhập phải là số không âm' });
      return false;
    }

    if (!formData.exportPrice || formData.exportPrice.toString().trim() === '') {
      setToast({ type: 'error', message: 'Giá bán không được để trống' });
      return false;
    }

    const exportPriceNum = parseFloat(formData.exportPrice);
    if (isNaN(exportPriceNum) || exportPriceNum < 0) {
      setToast({ type: 'error', message: 'Giá bán phải là số không âm' });
      return false;
    }

    if (exportPriceNum < importPriceNum) {
      setToast({ type: 'error', message: 'Giá bán phải lớn hơn hoặc bằng giá nhập' });
      return false;
    }

    if (formData.stockQuantity && formData.stockQuantity.toString().trim() !== '') {
      const stockQty = parseInt(formData.stockQuantity);
      if (isNaN(stockQty) || stockQty < 0) {
        setToast({ type: 'error', message: 'Số lượng tồn kho phải là số nguyên không âm' });
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
        setToast({ type: 'error', message: 'Phiên bản với RAM, ROM, Màu sắc này đã tồn tại' });
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
        setToast({ type: 'error', message: 'Phiên bản với RAM, ROM, Màu sắc này đã tồn tại' });
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
      setToast({ type: 'error', message: 'Lỗi cập nhật phiên bản' });
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
          || 'Lỗi xóa phiên bản';
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
        <h3 className="text-lg font-semibold text-gray-900">Phiên Bản Sản Phẩm</h3>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => handleOpenModal()}
        >
          Thêm Phiên Bản
        </Button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Chưa có phiên bản nào. Nhấp "Thêm Phiên Bản" để bắt đầu</p>
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
                  Giá nhập: {version.importPrice.toLocaleString()} VND | Giá bán: {version.exportPrice.toLocaleString()} VND | Số lượng: {version.stockQuantity}
                </p>
                {version.images && version.images.length > 0 && (
                  <p className="text-xs text-blue-600">
                    📷 {version.images.length} ảnh
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Trạng thái: {version.status ? '✅ Hoạt động' : '❌ Tắt'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(index)}
                >
                  Sửa
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
        title={editingIndex !== null ? 'Sửa Phiên Bản' : 'Thêm Phiên Bản'}
        size="lg"
      >
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Thông Tin Cơ Bản</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  RAM <span className="text-red-500">*</span>
                </label>
                <select
                  name="idRam"
                  value={formData.idRam}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn RAM</option>
                  {ramList.map(ram => (
                    <option key={ram.idRam} value={ram.idRam}>
                      {ram.nameRam}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ROM <span className="text-red-500">*</span>
                </label>
                <select
                  name="idRom"
                  value={formData.idRom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn ROM</option>
                  {romList.map(rom => (
                    <option key={rom.idRom} value={rom.idRom}>
                      {rom.nameRom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Màu Sắc <span className="text-red-500">*</span>
                </label>
                <select
                  name="idColor"
                  value={formData.idColor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn Màu</option>
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
                label="Giá Nhập (VND)"
                name="importPrice"
                type="number"
                placeholder="0"
                value={formData.importPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, importPrice: e.target.value }))}
                required
              />

              <InputField
                label="Giá Bán (VND)"
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
                Phiên bản này hoạt động
              </label>
            </div>
          </div>

          {/* Image Upload */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Hình Ảnh Phiên Bản (Tối đa 5 ảnh)</h4>
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
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddOrUpdate} disabled={isUploadingImages}>
            {isUploadingImages ? 'Đang xử lý...' : (editingIndex !== null ? 'Cập Nhật' : 'Thêm')}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, index: null, versionInfo: null })}
        title="Xóa Phiên Bản"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Cảnh báo:</strong> Bạn sắp xóa phiên bản "<strong>{deleteModal.versionInfo}</strong>". 
              {' '}Hành động này không thể hoàn tác. Nếu phiên bản đã được bán, bạn sẽ không thể xóa nó.
            </p>
          </div>

          <p className="text-gray-700">
            Bạn có chắc chắn muốn xóa phiên bản này không?
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, index: null, versionInfo: null })}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDeleteVersion}
          >
            Xóa
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
