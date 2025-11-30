import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  User,
  UserPlus,
  Trash2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import customerService from "../../../services/customerService";
import orderService from "../../../services/orderService";
import Toast from "../../../components/common/Toast";
import useDebounce from "../../../contexts/useDebounce";

const vnd = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);

export default function CreateInStoreOrder() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const debouncedCustomerSearch = useDebounce(customerSearch, 500);

  // Product state
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const debouncedProductSearch = useDebounce(productSearch, 500);

  // Cart state
  const [cartItems, setCartItems] = useState([]);

  // Order state
  const [note, setNote] = useState("");

  // Search customers by phone or email (with button click)
  const handleSearchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const data = await orderService.searchCustomers(customerSearch.trim(), 0, 20);
      setCustomerResults(data);
      
      if (data.length === 0) {
        setToast({
          message: "Không tìm thấy khách hàng. Bạn có muốn tạo khách hàng mới?",
          type: "info",
        });
      }
    } catch (error) {
      setToast({
        message: error.message || "Không thể tìm kiếm khách hàng. Vui lòng thử lại!",
        type: "error",
      });
      setCustomerResults([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, [customerSearch]);

  // Get suggestions when typing (phone, email, or name) - từ 2 ký tự trở lên
  const fetchCustomerSuggestions = useCallback(async () => {
    const searchValue = customerSearch.trim();
    
    if (searchValue.length >= 2) {
      try {
        setLoadingSuggestions(true);
        const suggestions = await orderService.getCustomerSuggestions(searchValue);
        setCustomerSuggestions(suggestions);
      } catch (error) {
        setCustomerSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setCustomerSuggestions([]);
    }
  }, [customerSearch]);

  // Auto-fetch customer suggestions when typing
  useEffect(() => {
    fetchCustomerSuggestions();
  }, [fetchCustomerSuggestions]);

  // Product suggestions state
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [loadingProductSuggestions, setLoadingProductSuggestions] = useState(false);

  // Fetch product suggestions when typing (từ 1 ký tự trở lên)
  const fetchProductSuggestions = useCallback(async () => {
    const searchValue = productSearch.trim();
    
    if (searchValue.length >= 1) {
      try {
        setLoadingProductSuggestions(true);
        const suggestions = await orderService.getProductSuggestions(searchValue);
        setProductSuggestions(suggestions);
      } catch (error) {
        setProductSuggestions([]);
      } finally {
        setLoadingProductSuggestions(false);
      }
    } else {
      setProductSuggestions([]);
    }
  }, [productSearch]);

  // Auto-fetch product suggestions when typing
  useEffect(() => {
    fetchProductSuggestions();
  }, [fetchProductSuggestions]);

  // Search products (full search khi có 2+ ký tự)
  useEffect(() => {
    if (debouncedProductSearch.trim().length >= 2) {
      searchProducts(debouncedProductSearch);
    } else {
      setProductResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProductSearch]);

  const searchProducts = async (searchTerm = null) => {
    const term = searchTerm || debouncedProductSearch;
    if (!term || term.trim().length < 2) {
      setProductResults([]);
      return;
    }

    try {
      setLoadingProducts(true);
      const results = await orderService.searchProducts(term.trim(), 0, 20);
      setProductResults(results);
      // Clear suggestions khi có kết quả
      setProductSuggestions([]);
    } catch (error) {
      setProductResults([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setCustomerResults([]);
  };

  // Normalize phone number to standard format (0xxxxxxxxx)
  const normalizePhoneNumber = (phone) => {
    if (!phone) return "";
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");
    
    // If starts with 84 and has 11-12 digits, convert to 0 format
    if (digits.startsWith("84") && (digits.length === 11 || digits.length === 12)) {
      return "0" + digits.substring(2);
    }
    
    // If starts with 0 and has 10 digits, keep as is
    if (digits.startsWith("0") && digits.length === 10) {
      return digits;
    }
    
    // If has 9 digits, add 0 prefix
    if (digits.length === 9) {
      return "0" + digits;
    }
    
    // Return original if doesn't match any pattern
    return digits;
  };

  // Check duplicate phone or email
  const checkDuplicate = async (phoneNumber, email) => {
    setPhoneError("");
    setEmailError("");
    setIsCheckingDuplicate(true);

    try {
      // Check phone number duplicate
      if (phoneNumber && phoneNumber.trim()) {
        // Normalize input phone number
        const normalizedInput = normalizePhoneNumber(phoneNumber.trim());
        
        // Validate normalized format
        const phoneRegex = /^0\d{9}$/;
        if (!phoneRegex.test(normalizedInput)) {
          setPhoneError("Số điện thoại không hợp lệ! Phải bắt đầu bằng 0 và có 10 chữ số.");
          setIsCheckingDuplicate(false);
          return false;
        }

        // Search with original input (backend will handle different formats)
        const phoneResults = await orderService.searchCustomers(phoneNumber.trim(), 0, 10);
        if (phoneResults && phoneResults.length > 0) {
          // Normalize all phone numbers from results and compare
          const found = phoneResults.find((c) => {
            const dbPhone = c.phoneNumber || c.phone || "";
            const normalizedDbPhone = normalizePhoneNumber(dbPhone);
            return normalizedDbPhone === normalizedInput && normalizedDbPhone !== "";
          });
          
          if (found) {
            setPhoneError("Số điện thoại này đã được sử dụng bởi khách hàng khác!");
            setIsCheckingDuplicate(false);
            return false;
          }
        }
      }

      // Check email duplicate
      if (email && email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          setEmailError("Email không hợp lệ!");
          setIsCheckingDuplicate(false);
          return false;
        }

        const emailResults = await orderService.searchCustomers(email.trim(), 0, 10);
        if (emailResults && emailResults.length > 0) {
          const found = emailResults.find(
            (c) => c.email && c.email.toLowerCase() === email.trim().toLowerCase()
          );
          if (found) {
            setEmailError("Email này đã được sử dụng bởi khách hàng khác!");
            setIsCheckingDuplicate(false);
            return false;
          }
        }
      }

      setIsCheckingDuplicate(false);
      return true;
    } catch (error) {
      console.error("Check duplicate error:", error);
      setIsCheckingDuplicate(false);
      // Don't block creation if check fails, let backend handle it
      return true;
    }
  };

  const handleCreateCustomer = async () => {
    // Reset errors
    setPhoneError("");
    setEmailError("");

    // Validation: fullName và phoneNumber là bắt buộc
    if (!newCustomer.fullName || newCustomer.fullName.trim() === "") {
      setToast({
        message: "Vui lòng nhập họ và tên!",
        type: "error",
      });
      return;
    }

    // Số điện thoại là bắt buộc
    if (!newCustomer.phoneNumber || newCustomer.phoneNumber.trim() === "") {
      setPhoneError("Số điện thoại là bắt buộc!");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(newCustomer.phoneNumber.trim())) {
      setPhoneError("Số điện thoại không hợp lệ! Phải bắt đầu bằng 0 và có 10 chữ số.");
      return;
    }

    // Check duplicate
    const canProceed = await checkDuplicate(newCustomer.phoneNumber, newCustomer.email);
    if (!canProceed) {
      return; // Errors are already set in state
    }

    try {
      const customerData = {
        fullName: newCustomer.fullName.trim(),
        phoneNumber: newCustomer.phoneNumber.trim(), // Bắt buộc, không null
        email: newCustomer.email.trim() || null,
        address: newCustomer.address.trim() || null,
      };

      const response = await customerService.createCustomer(customerData);
      // axiosClient interceptor already returns response.data
      const createdCustomer = response?.result || response;
      
      if (createdCustomer) {
        setSelectedCustomer(createdCustomer);
        setShowCustomerModal(false);
        setNewCustomer({ fullName: "", phoneNumber: "", email: "", address: "" });
        setPhoneError("");
        setEmailError("");
        setToast({
          message: "Tạo khách hàng thành công!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Create customer error:", error);
      const errorMessage = 
          error.response?.data?.message ||
        error.response?.message ||
        error.message ||
        "Không thể tạo khách hàng. Vui lòng thử lại!";
      
      // Check if error is about duplicate
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes("phone") || errorLower.includes("số điện thoại") || errorLower.includes("phone number")) {
        setPhoneError(errorMessage);
      } else if (errorLower.includes("email")) {
        setEmailError(errorMessage);
      } else {
        setToast({
          message: errorMessage,
          type: "error",
        });
      }
    }
  };

  // Cart management
  const addToCart = (productVersion) => {
    if (!productVersion.idVersion) {
      setToast({
        message: "Sản phẩm không hợp lệ!",
        type: "error",
      });
      return;
    }

    const existingItem = cartItems.find(
      (item) => item.productVersionId === productVersion.idVersion
    );

    if (existingItem) {
      // Increase quantity if already in cart
      if (
        productVersion.stockQuantity &&
        existingItem.quantity >= productVersion.stockQuantity
      ) {
        setToast({
          message: `Sản phẩm chỉ còn ${productVersion.stockQuantity} sản phẩm trong kho!`,
          type: "error",
        });
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.productVersionId === productVersion.idVersion
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item
      const productName = productVersion.productName || "Sản phẩm";
      // ImageVersionResponse có field 'image', không phải 'imageUrl'
      const image =
        productVersion.images?.[0]?.image ||
        productVersion.images?.[0]?.imageUrl ||
        productVersion.image ||
        "";
      const price = productVersion.exportPrice || 0;
      const stockQuantity = productVersion.stockQuantity || 0;

      setCartItems((prev) => [
        ...prev,
        {
          productVersionId: productVersion.idVersion,
          productName,
          image,
          price,
          stockQuantity,
          quantity: 1,
          unitPriceBefore: price,
          unitPriceAfter: price,
        },
      ]);
    }

    setProductSearch("");
    setProductResults([]);
  };

  const updateQuantity = (productVersionId, delta) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productVersionId === productVersionId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return item;
          if (
            item.stockQuantity &&
            newQuantity > item.stockQuantity
          ) {
            setToast({
              message: `Sản phẩm chỉ còn ${item.stockQuantity} sản phẩm trong kho!`,
              type: "error",
            });
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productVersionId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productVersionId !== productVersionId)
    );
  };

  // Calculate totals
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.unitPriceAfter || 0) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  // Create order
  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      setToast({
        message: "Vui lòng chọn khách hàng!",
        type: "error",
      });
      return;
    }

    if (cartItems.length === 0) {
      setToast({
        message: "Vui lòng thêm sản phẩm vào giỏ hàng!",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // Get customerId - ensure it's a number (Long)
      const customerId = selectedCustomer.customerId || selectedCustomer.idCustomer || selectedCustomer.id;
      if (!customerId) {
        setToast({
          message: "Không tìm thấy ID khách hàng!",
          type: "error",
        });
        return;
      }

      const orderData = {
        customerId: Number(customerId),
        note: note || "Đơn hàng tại cửa hàng",
        totalAmount: Number(subtotal),
        status: "PENDING",
        isPaid: false,
        orderDetails: cartItems.map((item) => ({
          productVersionId: String(item.productVersionId),
          unitPriceBefore: Number(item.unitPriceBefore || item.price),
          unitPriceAfter: Number(item.unitPriceAfter || item.price),
          quantity: Number(item.quantity),
        })),
      };

      await orderService.createInStoreOrder(orderData);

      setToast({
        message: "Tạo đơn hàng thành công!",
        type: "success",
      });

      // Reset form
      setSelectedCustomer(null);
      setCartItems([]);
      setNote("");
      setCustomerSearch("");
      setProductSearch("");

      // Navigate to orders page after a delay
      setTimeout(() => {
        navigate("/admin/orders", { state: { refresh: true } });
      }, 1500);
    } catch (error) {
      setToast({
        message: error.message || "Không thể tạo đơn hàng. Vui lòng thử lại!",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          position="top-right"
        />
      )}

        {/* Header Section */}
      <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate("/admin/orders")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                title="Quay lại danh sách đơn hàng"
              >
                <ArrowLeft size={20} />
                <span>Quay lại</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
          Tạo đơn hàng tại cửa hàng
        </h1>
                <p className="text-gray-600 mt-2 text-base">
          Tạo đơn hàng cho khách hàng mua trực tiếp tại cửa hàng
        </p>
              </div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Product Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              Chọn khách hàng
            </h2>

            {selectedCustomer ? (
              <div className="border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900 mb-1">
                      {selectedCustomer.fullName || "N/A"}
                    </p>
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        📞 {selectedCustomer.phoneNumber || selectedCustomer.phone || "N/A"}
                    </p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-gray-600">
                          📧 {selectedCustomer.email}
                        </p>
                      )}
                      {selectedCustomer.customerId && (
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {selectedCustomer.customerId}
                      </p>
                    )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Bỏ chọn khách hàng"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search Input with Button */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                  <Search
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCustomerResults([]); // Clear results when typing
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchCustomers();
                        }
                      }}
                      placeholder="Nhập số điện thoại, email hoặc tên để tìm kiếm..."
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base shadow-sm hover:shadow-md"
                    />
                  </div>
                  <button
                    onClick={handleSearchCustomers}
                    disabled={loadingCustomers || !customerSearch.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loadingCustomers ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Search size={20} />
                    )}
                    Tìm kiếm
                  </button>
                </div>

                {/* Customer Suggestions khi gõ (hiển thị khi chưa có kết quả tìm kiếm) */}
                {!loadingCustomers && 
                 !loadingSuggestions &&
                 customerSuggestions.length > 0 && 
                 customerResults.length === 0 &&
                 customerSearch.trim().length >= 2 && (
                  <div className="border-2 border-yellow-200 rounded-xl max-h-64 overflow-y-auto bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md">
                    <div className="sticky top-0 p-3 text-sm font-semibold text-gray-700 bg-yellow-100 border-b-2 border-yellow-200 rounded-t-xl">
                      💡 Gợi ý (gõ để tìm kiếm):
                    </div>
                    {customerSuggestions.map((customer) => (
                      <button
                        key={customer.customerId || customer.idCustomer || customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full text-left p-4 hover:bg-yellow-100 border-b border-yellow-200 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                      >
                        <p className="font-semibold text-base text-gray-900 mb-1">{customer.fullName || "N/A"}</p>
                        <p className="text-sm text-gray-700 font-medium">
                          📞 {customer.phoneNumber || customer.phone || "N/A"}
                        </p>
                        {customer.email && (
                          <p className="text-sm text-gray-600 mt-1">📧 {customer.email}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Loading suggestions */}
                {loadingSuggestions && customerSearch.trim().length >= 2 && (
                  <div className="text-center py-2 text-xs text-gray-500">
                    Đang tìm gợi ý...
                  </div>
                )}

                {/* Loading state */}
                {loadingCustomers && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
                  </div>
                )}

                {/* Search Results */}
                {!loadingCustomers && customerResults.length > 0 && (
                  <div className="border-2 border-blue-200 rounded-xl max-h-64 overflow-y-auto bg-white shadow-md">
                    <div className="sticky top-0 p-3 text-sm font-semibold text-gray-700 bg-blue-50 border-b-2 border-blue-200 rounded-t-xl">
                      Kết quả tìm kiếm ({customerResults.length}):
                    </div>
                    {customerResults.map((customer) => (
                      <button
                        key={customer.customerId || customer.idCustomer || customer.id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full text-left p-4 hover:bg-blue-50 border-b border-blue-100 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                      >
                        <p className="font-semibold text-base text-gray-900 mb-1">{customer.fullName || "N/A"}</p>
                        <p className="text-sm text-gray-700 font-medium">
                          📞 {customer.phoneNumber || customer.phone || "N/A"}
                        </p>
                        {customer.email && (
                          <p className="text-sm text-gray-600 mt-1">📧 {customer.email}</p>
                        )}
                        {customer.customerId && (
                          <p className="text-xs text-gray-500 mt-1">ID: {customer.customerId}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {!loadingCustomers && 
                 customerSearch.trim().length > 0 && 
                 customerResults.length === 0 && 
                 customerSuggestions.length === 0 && (
                  <div className="text-center py-4 text-gray-500 border rounded-lg bg-gray-50">
                    <p>Không tìm thấy khách hàng</p>
                    <p className="text-xs mt-1">Nhấn "Tạo khách hàng mới" bên dưới để thêm khách hàng</p>
                  </div>
                )}

                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-semibold text-gray-700 shadow-sm hover:shadow-md"
                >
                  <UserPlus size={20} />
                  Tạo khách hàng mới
                </button>
              </div>
            )}
          </div>

          {/* Product Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              Tìm kiếm sản phẩm
            </h2>

            <div className="relative mb-4">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductResults([]); // Clear results when typing
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && productSearch.trim().length >= 2) {
                    searchProducts();
                  }
                }}
                placeholder="Gõ tên sản phẩm để xem gợi ý (ví dụ: iphone)..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-base shadow-sm hover:shadow-md"
              />
            </div>

            {/* Product Suggestions khi gõ (hiển thị khi chưa có kết quả tìm kiếm) */}
            {!loadingProducts && 
             !loadingProductSuggestions &&
             productSuggestions.length > 0 && 
             productResults.length === 0 &&
             productSearch.trim().length >= 1 && (
              <div className="border-2 border-green-200 rounded-xl max-h-64 overflow-y-auto bg-gradient-to-br from-green-50 to-emerald-50 shadow-md mb-4">
                <div className="sticky top-0 p-3 text-sm font-semibold text-gray-700 bg-green-100 border-b-2 border-green-200 rounded-t-xl">
                  💡 Gợi ý sản phẩm (gõ để tìm kiếm):
                </div>
                {productSuggestions.map((product) => {
                  const productName = product.productName || "Sản phẩm không tên";
                  const image = product.images?.[0]?.image || product.images?.[0]?.imageUrl || product.image || "";
                  const price = product.exportPrice || 0;
                  const stockQuantity = product.stockQuantity || 0;
                  const ram = product.ramName || "";
                  const rom = product.romName || "";
                  const color = product.colorName || "";

                  return (
                    <button
                      key={product.idVersion}
                      onClick={() => {
                        setProductSearch(productName); // Fill search với tên sản phẩm
                        setProductSuggestions([]); // Clear suggestions
                        // Trigger full search ngay lập tức
                        searchProducts(productName);
                      }}
                      className="w-full text-left p-4 hover:bg-green-100 border-b border-green-200 last:border-b-0 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {image && (
                          <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={image}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{productName}</p>
                          <p className="text-xs text-gray-600">
                            {[ram, rom, color].filter(Boolean).join(" • ") || "N/A"}
                          </p>
                          <p className="text-xs font-semibold text-blue-600 mt-1">
                            {vnd(price)} {stockQuantity > 0 && `• Còn ${stockQuantity}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading product suggestions */}
            {loadingProductSuggestions && productSearch.trim().length >= 1 && (
              <div className="text-center py-2 text-xs text-gray-500 mb-4">
                Đang tìm gợi ý sản phẩm...
              </div>
            )}

            {loadingProducts && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}

            {productResults.length > 0 && (
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <div className="p-2 text-xs text-gray-600 bg-blue-50 border-b">
                  Kết quả tìm kiếm ({productResults.length}):
                </div>
                {productResults.map((product) => {
                  const productName =
                    product.productName || "Sản phẩm không tên";
                  // ImageVersionResponse có field 'image', không phải 'imageUrl'
                  const image =
                    product.images?.[0]?.image ||
                    product.images?.[0]?.imageUrl ||
                    product.image ||
                    "";
                  const price = product.exportPrice || 0;
                  const stockQuantity = product.stockQuantity || 0;
                  const ram = product.ramName || "";
                  const rom = product.romName || "";
                  const color = product.colorName || "";

                  return (
                    <div
                      key={product.idVersion}
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {[ram, rom, color].filter(Boolean).join(" • ") ||
                              "N/A"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-blue-600">
                              {vnd(price)}
                            </span>
                            {stockQuantity > 0 ? (
                              <span className="text-xs text-gray-500">
                                • Còn {stockQuantity} sản phẩm
                              </span>
                            ) : (
                              <span className="text-xs text-red-600">
                                • Hết hàng
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={stockQuantity === 0}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Thêm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {productSearch &&
              !loadingProducts &&
              productResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Không tìm thấy sản phẩm
                </div>
              )}
          </div>
        </div>

        {/* Right Column - Cart & Order Summary */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-gray-800">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
              Giỏ hàng ({cartItems.length})
            </h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart size={40} className="text-gray-400" />
                  </div>
                  <p className="font-semibold text-lg mb-2 text-gray-700">Giỏ hàng trống</p>
                  <p className="text-sm text-gray-500">
                    {selectedCustomer 
                      ? "Tìm kiếm và thêm sản phẩm vào giỏ hàng để tạo đơn hàng"
                      : "Vui lòng chọn khách hàng trước"}
                  </p>
              </div>
            ) : (
                <div className="space-y-5">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div
                      key={item.productVersionId}
                        className="border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-base text-gray-900 truncate mb-1">
                            {item.productName}
                          </p>
                            <p className="text-sm text-gray-600 font-semibold mb-3">
                              {vnd(item.unitPriceAfter || item.price)} x {item.quantity}
                          </p>
                            <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQuantity(item.productVersionId, -1)
                              }
                              disabled={item.quantity <= 1}
                                className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Minus size={16} />
                            </button>
                              <span className="text-base font-bold w-10 text-center text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productVersionId, 1)
                              }
                              disabled={
                                item.stockQuantity &&
                                item.quantity >= item.stockQuantity
                              }
                                className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Plus size={16} />
                            </button>
                            <button
                              onClick={() =>
                                removeFromCart(item.productVersionId)
                              }
                                className="ml-auto p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                title="Xóa sản phẩm"
                            >
                                <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                  <div className="border-t-2 border-gray-200 pt-5 space-y-3 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold text-base">Tạm tính:</span>
                      <span className="font-bold text-lg text-gray-900">{vnd(subtotal)}</span>
                  </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                      <span className="text-xl font-bold text-gray-900">Tổng tiền:</span>
                      <span className="text-2xl font-bold text-blue-600">{vnd(subtotal)}</span>
                  </div>
                </div>

                  <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú cho đơn hàng..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm hover:shadow-md transition-all resize-none"
                      rows={3}
                    />
                  </div>

                    {/* Status info */}
                    {selectedCustomer && cartItems.length > 0 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-md">
                        <p className="text-sm text-green-700 font-bold mb-2 flex items-center gap-2">
                          <CheckCircle size={18} />
                          Sẵn sàng tạo đơn hàng
                        </p>
                        <p className="text-sm text-green-700 mb-1">
                          Khách hàng: <strong className="text-green-900">{selectedCustomer.fullName}</strong>
                        </p>
                        <p className="text-sm text-green-700">
                          Số sản phẩm: <strong className="text-green-900">{cartItems.length}</strong> | Tổng tiền: <strong className="text-green-900">{vnd(subtotal)}</strong>
                        </p>
                      </div>
                    )}

                  <button
                    onClick={handleCreateOrder}
                    disabled={loading || !selectedCustomer || cartItems.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
                      title={
                        !selectedCustomer 
                          ? "Vui lòng chọn khách hàng trước"
                          : cartItems.length === 0
                          ? "Vui lòng thêm sản phẩm vào giỏ hàng"
                          : "Click để tạo đơn hàng"
                      }
                  >
                    {loading ? (
                      <>
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                          <CheckCircle size={24} />
                          <span>
                            {!selectedCustomer 
                              ? "Chọn khách hàng trước"
                              : cartItems.length === 0
                              ? "Thêm sản phẩm vào giỏ hàng"
                              : "Tạo đơn hàng"}
                          </span>
                      </>
                    )}
                  </button>
                    
                    {(!selectedCustomer || cartItems.length === 0) && (
                      <p className="text-sm text-gray-500 text-center font-medium">
                        {!selectedCustomer 
                          ? "Bước 1: Chọn khách hàng ở bên trái"
                          : "Bước 2: Tìm kiếm và thêm sản phẩm vào giỏ hàng"}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Customer Modal */}
      {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                Tạo khách hàng mới
              </h3>
              <div className="space-y-5">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={newCustomer.fullName}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, fullName: e.target.value })
                  }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                  required
                />
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại * (Bắt đầu bằng 0, 10 chữ số)
                </label>
                <input
                  type="text"
                    value={newCustomer.phoneNumber}
                  onChange={(e) => {
                      setNewCustomer({ ...newCustomer, phoneNumber: e.target.value });
                      setPhoneError(""); // Clear error when typing
                  }}
                    placeholder="0123456789"
                    maxLength={10}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md ${
                      phoneError 
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                />
                {phoneError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {phoneError}
                  </p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (Tùy chọn)
                </label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => {
                    setNewCustomer({ ...newCustomer, email: e.target.value });
                    setEmailError(""); // Clear error when typing
                  }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md ${
                      emailError 
                        ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                />
                {emailError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {emailError}
                  </p>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>
            </div>
              <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setNewCustomer({
                    fullName: "",
                      phoneNumber: "",
                    email: "",
                    address: "",
                  });
                  setPhoneError("");
                  setEmailError("");
                }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateCustomer}
                disabled={isCheckingDuplicate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                  {isCheckingDuplicate ? "Đang kiểm tra..." : "Tạo khách hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

