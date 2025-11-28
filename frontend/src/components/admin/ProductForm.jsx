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
        brandId: product.brandId || "",
        originId: product.originId || "",
        operatingSystemId: product.operatingSystemId || "",
        
        warehouseAreaId: product.warehouseAreaId || "",
        categoryId: product.categoryId || "",
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
        setToast({ type: "error", message: "Vui lòng chọn file hình ảnh" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setToast({
          type: "error",
          message: "Kích thước hình ảnh không vượt quá 5MB",
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
    if (!formData.nameProduct) {
      setToast({ type: "error", message: "Tên sản phẩm không được để trống" });
      return false;
    }

    if (!formData.brandId) {
      setToast({ type: "error", message: "Vui lòng chọn nhãn hiệu" });
      return false;
    }

    if (!formData.originId) {
      setToast({ type: "error", message: "Vui lòng chọn xuất xứ" });
      return false;
    }

    if (!formData.operatingSystemId) {
      setToast({ type: "error", message: "Vui lòng chọn hệ điều hành" });
      return false;
    }

    if (!formData.warehouseAreaId) {
      setToast({ type: "error", message: "Vui lòng chọn khu vực kho" });
      return false;
    }

    if (versions.length === 0) {
      setToast({ type: "error", message: "Vui lòng thêm ít nhất 1 phiên bản" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
        status: false,
      },
      versions: versions,
    };

    onSubmit({
      payload: productPayload,
      image: imageFile,
    });
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang khởi tạo sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông Tin Cơ Bản */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông Tin Cơ Bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Tên Sản Phẩm"
            name="nameProduct"
            value={formData.nameProduct}
            onChange={handleInputChange}
            placeholder="VD: iPhone 15 Pro Max"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nhãn Hiệu <span className="text-red-500">*</span>
            </label>
            <select
              name="brandId"
              value={String(formData.brandId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn Nhãn Hiệu</option>
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
              Xuất Xứ <span className="text-red-500">*</span>
            </label>
            <select
              name="originId"
              value={String(formData.originId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn Xuất Xứ</option>
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
              Hệ Điều Hành <span className="text-red-500">*</span>
            </label>
            <select
              name="operatingSystemId"
              value={String(formData.operatingSystemId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn Hệ Điều Hành</option>
              {operatingSystemList.map((os) => (
                <option key={String(os.idOS)} value={String(os.idOS)}>
                  {os.nameOS}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Khu Vực Kho <span className="text-red-500">*</span>
            </label>
            <select
              name="warehouseAreaId"
              value={String(formData.warehouseAreaId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Chọn Khu Vực Kho</option>
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
              Danh Mục
            </label>
            <select
              name="categoryId"
              value={String(formData.categoryId || "")}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn Danh Mục</option>
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
          Thông Tin Kỹ Thuật
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Dung Lượng Pin (mAh)"
            name="battery"
            value={formData.battery}
            onChange={handleInputChange}
            placeholder="VD: 3500"
          />

          <InputField
            label="Tần Số Quét (Hz)"
            name="scanFrequency"
            value={formData.scanFrequency}
            onChange={handleInputChange}
            placeholder="VD: 120"
          />

          <InputField
            label="Kích Thước Màn Hình (inch)"
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
            label="Công Nghệ Màn Hình"
            name="screenTech"
            value={formData.screenTech}
            onChange={handleInputChange}
            placeholder="VD: OLED"
          />

          <InputField
            label="Chipset"
            name="chipset"
            value={formData.chipset}
            onChange={handleInputChange}
            placeholder="VD: A17 Pro"
          />

          <InputField
            label="Camera Sau (MP)"
            name="rearCamera"
            value={formData.rearCamera}
            onChange={handleInputChange}
            placeholder="VD: 48MP + 12MP + 12MP"
          />

          <InputField
            label="Camera Trước (MP)"
            name="frontCamera"
            value={formData.frontCamera}
            onChange={handleInputChange}
            placeholder="VD: 12MP"
          />

          <InputField
            label="Thời Hạn Bảo Hành (tháng)"
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
          Hình Ảnh Sản Phẩm
        </h3>

        <div className="flex gap-6">
          <div className="flex-1">
            <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  Nhấp để chọn hình ảnh hoặc kéo thả
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG (Tối đa 5MB)
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
            Sản phẩm này đang hoạt động
          </label>
        </div>
      </div>

      {/* Nút Hành Động */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" loading={isLoading}>
          {product ? "Cập Nhật" : "Tạo Sản Phẩm"}
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
