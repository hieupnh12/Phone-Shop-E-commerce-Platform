import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Upload } from "lucide-react";
import Button from "../common/Button";
import InputField from "../common/InputField";
import Modal from "../common/Modal";
import Toast from "../common/Toast";
import VersionForm from "./VersionForm";
import productService from "../../services/productService";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Component form tạo/sửa sản phẩm
 * Bao gồm thông tin sản phẩm, upload hình ảnh, quản lý phiên bản
 */
const ProductForm = ({
  product = null,
  onSubmit,
  onCancel,
  isLoading = false,
  brandList = [],
  originList = [],
  operatingSystemList = [],
  warehouseList = [],
  categoryList = [],
  ramList = [],
  romList = [],
  colorList = [],
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    idProduct: null,
    nameProduct: "",
    battery: "",
    scanFrequency: "",
    screenSize: "",
    screenResolution: "",
    screenTech: "",
    chipset: "",
    rearCamera: "",
    frontCamera: "",
    warrantyPeriod: "",
    brandId: "",
    originId: "",
    operatingSystemId: "",
    warehouseAreaId: "",
    categoryId: "",
    status: true,
  });

useEffect(() => {
  console.log("Warehouse list:", warehouseList);
}, [warehouseList]); // sẽ log mỗi khi warehouseList thay đổi



  const [versions, setVersions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [isInitializing, setIsInitializing] = useState(!product);

  // Khởi tạo sản phẩm nếu là thêm mới
  useEffect(() => {
    if (!product && !formData.idProduct) {
      initializeProduct();
    } else if (product) {
      setFormData({
        idProduct: product.idProduct,
        nameProduct: product.nameProduct || "",
        battery: product.battery || "",
        scanFrequency: product.scanFrequency || "",
        screenSize: product.screenSize || "",
        screenResolution: product.screenResolution || "",
        screenTech: product.screenTech || "",
        chipset: product.chipset || "",
        rearCamera: product.rearCamera || "",
        frontCamera: product.frontCamera || "",
        warrantyPeriod: product.warrantyPeriod || "",
        brandId: String(product.brandId || ""),
        originId: String(product.originId || ""),
        operatingSystemId: String(product.operatingSystemId || ""),
        warehouseAreaId: String(product.warehouseAreaId || ""),
        categoryId: String(product.categoryId || ""),
        status: product.status !== undefined ? product.status : true,
      });

      

      if (product.image) {
        setImagePreview(product.image);
      }

      if (
        product.productVersionResponses &&
        product.productVersionResponses.length > 0
      ) {
        setVersions(
          product.productVersionResponses.map((v) => ({
            idProductVersion: v.idVersion || v.idProductVersion, // Backend returns idVersion
            idRam: v.ramName
              ? ramList.find((r) => r.nameRam === v.ramName)?.idRam
              : "",
            idRom: v.romName
              ? romList.find((r) => r.nameRom === v.romName)?.idRom
              : "",
            idColor: v.colorName
              ? colorList.find((c) => c.nameColor === v.colorName)?.idColor
              : "",
            importPrice: v.importPrice,
            exportPrice: v.exportPrice,
            stockQuantity: v.stockQuantity,
            status: v.status,
            images: v.images || [],
          }))
        );
      }

      setIsInitializing(false);
    }
  }, [
    product,
    brandList,
    originList,
    operatingSystemList,
    warehouseList,
    categoryList,
    ramList,
    romList,
    colorList,
  ]);

  const initializeProduct = async () => {
    try {
      const result = await productService.initProduct();
      if (result.result && result.result.idProduct) {
        setFormData((prev) => ({
          ...prev,
          idProduct: result.result.idProduct,
        }));
        setToast({ type: "success", message: t('common.productCreateSuccess') });
      }
    } catch (error) {
      setToast({
        type: "error",
        message: "Lỗi khởi tạo sản phẩm: " + error.message,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setToast({ type: "error", message: t('admin.productForm.errors.selectImageFile') });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({
          type: "error",
          message: t('admin.productForm.errors.imageTooLarge'),
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.nameProduct || formData.nameProduct.trim() === "") {
      setToast({ type: "error", message: t('admin.productForm.errors.productNameRequired') });
      return false;
    }

    if (formData.nameProduct.length > 255) {
      setToast({ type: "error", message: t('admin.productForm.errors.productNameTooLong') });
      return false;
    }

    if (!formData.brandId) {
      setToast({ type: "error", message: t('admin.productForm.errors.brandRequired') });
      return false;
    }

    if (!formData.originId) {
      setToast({ type: "error", message: t('admin.productForm.errors.originRequired') });
      return false;
    }

    if (!formData.operatingSystemId) {
      setToast({ type: "error", message: t('admin.productForm.errors.osRequired') });
      return false;
    }

    if (!formData.warehouseAreaId) {
      setToast({ type: "error", message: t('admin.productForm.errors.warehouseRequired') });
      return false;
    }

    if (formData.battery !== null && formData.battery !== undefined && formData.battery !== "") {
      const batteryStr = String(formData.battery).trim();
      if (batteryStr !== "") {
        const batteryNum = parseInt(batteryStr);
        if (isNaN(batteryNum) || batteryNum <= 0) {
          setToast({ type: "error", message: t('admin.productForm.errors.batteryInvalid') });
          return false;
        }
      }
    }

    if (formData.scanFrequency !== null && formData.scanFrequency !== undefined && formData.scanFrequency !== "") {
      const scanFreqStr = String(formData.scanFrequency).trim();
      if (scanFreqStr !== "") {
        const scanFreq = parseInt(scanFreqStr);
        if (isNaN(scanFreq) || scanFreq <= 0) {
          setToast({ type: "error", message: t('admin.productForm.errors.scanFreqInvalid') });
          return false;
        }
      }
    }

    if (formData.screenSize !== null && formData.screenSize !== undefined && formData.screenSize !== "") {
      const screenSizeStr = String(formData.screenSize).trim();
      if (screenSizeStr !== "") {
        const screenSizeNum = parseFloat(screenSizeStr);
        if (isNaN(screenSizeNum) || screenSizeNum <= 0) {
          setToast({ type: "error", message: t('admin.productForm.errors.screenSizeInvalid') });
          return false;
        }
      }
    }

    if (formData.screenResolution && formData.screenResolution.length > 100) {
      setToast({ type: "error", message: t('admin.productForm.errors.screenResTooLong') });
      return false;
    }

    if (formData.screenTech && formData.screenTech.length > 100) {
      setToast({ type: "error", message: t('admin.productForm.errors.screenTechTooLong') });
      return false;
    }

    if (formData.chipset && formData.chipset.length > 255) {
      setToast({ type: "error", message: t('admin.productForm.errors.chipsetTooLong') });
      return false;
    }

    if (formData.rearCamera && formData.rearCamera.length > 255) {
      setToast({ type: "error", message: t('admin.productForm.errors.rearCameraTooLong') });
      return false;
    }

    if (formData.frontCamera && formData.frontCamera.length > 255) {
      setToast({ type: "error", message: t('admin.productForm.errors.frontCameraTooLong') });
      return false;
    }

    if (formData.warrantyPeriod !== null && formData.warrantyPeriod !== undefined && formData.warrantyPeriod !== "") {
      const warrantyStr = String(formData.warrantyPeriod).trim();
      if (warrantyStr !== "") {
        const warrantyNum = parseInt(warrantyStr);
        if (isNaN(warrantyNum) || warrantyNum < 0) {
          setToast({ type: "error", message: t('admin.productForm.errors.warrantyInvalid') });
          return false;
        }
      }
    }

    if (versions.length === 0) {
      setToast({ type: "error", message: t('admin.productForm.errors.versionRequired') });
      return false;
    }

    const hasActiveVersion = versions.some(v => v.status === true);
    if (!hasActiveVersion) {
      setToast({ type: "error", message: t('admin.productForm.errors.activeVersionRequired') });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Filter out images from versions before sending to backend
    // For new versions, don't include idProductVersion; for editing, include it
    const versionsForBackend = versions.map(v => {
      const versionData = {
        idProduct: formData.idProduct || null, // Include product ID for version creation
        idRam: v.idRam,
        idRom: v.idRom,
        idColor: v.idColor,
        importPrice: v.importPrice,
        exportPrice: v.exportPrice,
        stockQuantity: v.stockQuantity,
        status: v.status,
        Items: v.Items || [],
      };
      
      // Only include idProductVersion if it's an existing version (editing)
      if (v.idProductVersion) {
        versionData.idProductVersion = v.idProductVersion;
      }
      
      return versionData;
    });

    const productPayload = {
      idProduct: formData.idProduct,
      products: {
        nameProduct: formData.nameProduct,
        battery: formData.battery || null,
        scanFrequency: formData.scanFrequency || null,
        screenSize: formData.screenSize || null,
        screenResolution: formData.screenResolution || null,
        screenTech: formData.screenTech || null,
        chipset: formData.chipset || null,
        rearCamera: formData.rearCamera || null,
        frontCamera: formData.frontCamera || null,
        warrantyPeriod: formData.warrantyPeriod
          ? parseInt(formData.warrantyPeriod)
          : 0,
        brandId: parseInt(formData.brandId),
        originId: parseInt(formData.originId),
        operatingSystemId: parseInt(formData.operatingSystemId),
        warehouseAreaId: formData.warehouseAreaId,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        stockQuantity: 0,
        status: formData.status, // Sử dụng giá trị từ form
      },
      versions: versionsForBackend,
    };

    console.log("📝 ProductForm - formData.status:", formData.status);
    console.log("📝 ProductForm - productPayload.products.status:", productPayload.products.status);
    console.log("📝 ProductForm - versionsForBackend:", versionsForBackend);
    console.log("📝 ProductForm - productPayload:", productPayload);
    console.log("📝 ProductForm - versionsWithImages:", versions);

    onSubmit({
      payload: productPayload,
      image: imageFile,
      versionsWithImages: versions, // Pass original versions with images for client-side upload
      // Each version may have deletedImageIds property
    });
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('admin.productForm.initializing')}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông Tin Cơ Bản */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('admin.productForm.basicInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={t('admin.productForm.productName')}
            name="nameProduct"
            value={formData.nameProduct}
            onChange={handleInputChange}
            placeholder="VD: iPhone 15 Pro Max"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('admin.productForm.brand')} <span className="text-red-500">*</span>
            </label>
            <select
              name="brandId"
              value={String(formData.brandId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('admin.productForm.selectBrand')}</option>
              {brandList.map((brand) => (
                <option
                  key={String(brand.idBrand)}
                  value={String(brand.idBrand)}
                >
                  {brand.nameBrand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('admin.productForm.origin')} <span className="text-red-500">*</span>
            </label>
            <select
              name="originId"
              value={String(formData.originId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('admin.productForm.selectOrigin')}</option>
              {originList.map((origin) => (
                <option
                  key={String(origin.idOrigin)}
                  value={String(origin.idOrigin)}
                >
                  {origin.nameOrigin}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('admin.productForm.operatingSystem')} <span className="text-red-500">*</span>
            </label>
            <select
              name="operatingSystemId"
              value={String(formData.operatingSystemId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('admin.productForm.selectOS')}</option>
              {operatingSystemList.map((os) => (
                <option key={String(os.idOS)} value={String(os.idOS)}>
                  {os.nameOS}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('admin.productForm.warehouseArea')} <span className="text-red-500">*</span>
            </label>
            <select
              name="warehouseAreaId"
              value={String(formData.warehouseAreaId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('admin.productForm.selectWarehouse')}</option>
          {warehouseList.map((warehouse) => {
  console.log("Warehouse ID:", warehouse.idWarehouse, "Name:", warehouse.nameWarehouse);
  return (
    <option
      key={String(warehouse.idWarehouse)}
      value={String(warehouse.idWarehouse)}
    >
      {warehouse.nameWarehouse}
    </option>
  );
})}
</select>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('admin.productForm.category')}
            </label>
            <select
              name="categoryId"
              value={String(formData.categoryId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('admin.productForm.selectCategory')}</option>
              {categoryList.map((category) => (
                <option
                  key={String(category.idCategory)}
                  value={String(category.idCategory)}
                >
                  {category.nameCategory}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thông Tin Kỹ Thuật */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('admin.productForm.technicalInfo')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={t('admin.productForm.battery')}
            name="battery"
            value={formData.battery}
            onChange={handleInputChange}
            placeholder="VD: 3500"
          />

          <InputField
            label={t('admin.productForm.scanFrequency')}
            name="scanFrequency"
            value={formData.scanFrequency}
            onChange={handleInputChange}
            placeholder="VD: 120"
          />

          <InputField
            label={t('admin.productForm.screenSize')}
            name="screenSize"
            value={formData.screenSize}
            onChange={handleInputChange}
            placeholder="VD: 6.7"
          />

          <InputField
            label={t('admin.screenResolution')}
            name="screenResolution"
            value={formData.screenResolution}
            onChange={handleInputChange}
            placeholder="VD: 2796x1290"
          />

          <InputField
            label={t('admin.productForm.screenTech')}
            name="screenTech"
            value={formData.screenTech}
            onChange={handleInputChange}
            placeholder="VD: OLED"
          />

          <InputField
            label={t('admin.productForm.chipset')}
            name="chipset"
            value={formData.chipset}
            onChange={handleInputChange}
            placeholder="VD: A17 Pro"
          />

          <InputField
            label={t('admin.productForm.rearCamera')}
            name="rearCamera"
            value={formData.rearCamera}
            onChange={handleInputChange}
            placeholder="VD: 48MP + 12MP + 12MP"
          />

          <InputField
            label={t('admin.productForm.frontCamera')}
            name="frontCamera"
            value={formData.frontCamera}
            onChange={handleInputChange}
            placeholder="VD: 12MP"
          />

          <InputField
            label={t('admin.productForm.warrantyPeriod')}
            name="warrantyPeriod"
            type="number"
            value={formData.warrantyPeriod}
            onChange={handleInputChange}
            placeholder="VD: 12"
          />
        </div>
      </div>

      {/* Hình Ảnh */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('admin.productForm.productImage')}
        </h3>

        <div className="flex gap-6">
          <div className="flex-1">
            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  {t('admin.productForm.uploadImage')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.productForm.imageFormat')}
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {imagePreview && (
            <div className="flex-1">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>
      </div>

      {/* Phiên Bản */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <VersionForm
          versions={versions}
          onVersionsChange={setVersions}
          ramList={ramList}
          romList={romList}
          colorList={colorList}
          isEditMode={!!product} // true if editing existing product
          productId={product?.idProduct} // Product ID for edit mode
        />
      </div>

      {/* Trạng Thái */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="status"
            checked={formData.status}
            onChange={handleInputChange}
            id="productStatus"
            className="w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="productStatus"
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {t('admin.productForm.productActive')}
          </label>
        </div>
      </div>

      {/* Nút Hành Động */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          {t('admin.productForm.cancel')}
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {product ? t('admin.productForm.update') : t('admin.productForm.createProduct')}
        </Button>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  brandList: PropTypes.array,
  originList: PropTypes.array,
  operatingSystemList: PropTypes.array,
  warehouseList: PropTypes.array,
  categoryList: PropTypes.array,
  ramList: PropTypes.array,
  romList: PropTypes.array,
  colorList: PropTypes.array,
};

export default ProductForm;
