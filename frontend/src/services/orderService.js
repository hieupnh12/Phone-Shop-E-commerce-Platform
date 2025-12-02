import axiosClient from "../api";
import customerService from "./customerService";

// Helper function để parse response data
const parseResponseData = (response) => {
    if (!response) return [];
    
    if (response?.result) {
        if (response.result.content && Array.isArray(response.result.content)) {
            return response.result.content;
        } else if (Array.isArray(response.result)) {
            return response.result;
        }
    } else if (response?.content && Array.isArray(response.content)) {
        return response.content;
    } else if (Array.isArray(response)) {
        return response;
    }
    
    return [];
};

// Helper function để parse product response
const parseProductResponse = (response) => {
    const result = response?.result || response;
    return result?.content || result?.versions || result || [];
};

const orderService = {
    // --- Lấy tất cả đơn hàng với pagination ---
    getAll: async (page = 0, size = 20, sort = "createDatetime,desc") => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sort: sort
            });
            const res = await axiosClient.get(`/orders?${params.toString()}`);
            return res || { result: { content: [], totalElements: 0, totalPages: 0 } };
        } catch (error) {
            console.error("Get all orders error:", error);
            // Nếu là lỗi 403 (Forbidden), throw error với message từ backend
            if (error.response?.status === 403) {
                const errorMessage = error.response?.data?.message || "Bạn không có quyền xem đơn hàng";
                throw new Error(errorMessage);
            }
            // Nếu là lỗi khác, throw error với message từ backend hoặc message mặc định
            const errorMessage = 
                error.response?.data?.message ||
                error.response?.message ||
                error.message ||
                "Không thể tải danh sách đơn hàng";
            throw new Error(errorMessage);
        }
    },

    // --- Lấy chi tiết đơn ---
    getById: async (orderId) => {
        const res = await axiosClient.get(`/orders/${orderId}`);
        console.log("Order detail response:", res);
        // Response structure: { result: OrderResponse } hoặc trực tiếp là OrderResponse
        return res?.result || res;
    },

    // --- Update trạng thái đơn hàng ---
    updateStatus: async (orderId, status) => {
        const res = await axiosClient.put(
            `/orders/${orderId}/status`,
            { status }, // backend yêu cầu body phải là object: { status: "COMPLETED" }
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.result;
    },


    getCompletedOrders: async () => {
        try {
            // Lấy tất cả orders của khách hàng hiện tại
            const res = await axiosClient.get("/orders/me");
            // Filter chỉ các đơn DELIVERED hoặc PAID (đã hoàn thành)
            const allOrders = Array.isArray(res?.result) ? res.result : res || [];
            return allOrders.filter(order => 
                order.status === 'DELIVERED' || order.status === 'PAID'
            );
        } catch (error) {
            console.error('Error fetching completed orders:', error);
            return [];
        }
    },

    // --- Lấy đơn hàng của khách hàng (tất cả trạng thái) ---
    getMyOrders: async () => {
        try {
            const res = await axiosClient.get("/api/orders/my-orders");
            return res?.result || res || [];
        } catch (error) {
            console.error('Error fetching my orders:', error);
            return [];
        }
    },

    // ============================================
    // IN-STORE ORDER METHODS
    // ============================================

    /**
     * Tìm kiếm khách hàng theo số điện thoại hoặc email (full search)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @param {number} page - Trang (mặc định 0)
     * @param {number} size - Số lượng kết quả (mặc định 20)
     * @returns {Promise<Array>} Danh sách khách hàng
     */
    searchCustomers: async (keyword, page = 0, size = 20) => {
        if (!keyword || !keyword.trim()) {
            throw new Error("Vui lòng nhập số điện thoại hoặc email để tìm kiếm!");
        }

        try {
            const response = await customerService.searchByPhoneOrEmail(
                keyword.trim(),
                page,
                size
            );
            return parseResponseData(response);
        } catch (error) {
            console.error("Search customers error:", error);
            const errorMessage = 
                error.response?.data?.message ||
                error.response?.message ||
                error.message ||
                "Không thể tìm kiếm khách hàng. Vui lòng thử lại!";
            throw new Error(errorMessage);
        }
    },

    /**
     * Lấy gợi ý khách hàng khi gõ (suggestions)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @returns {Promise<Array>} Danh sách gợi ý (tối đa 5)
     */
    getCustomerSuggestions: async (keyword) => {
        if (!keyword || keyword.trim().length < 2) {
            return [];
        }

        try {
            const response = await customerService.searchByPhoneOrEmail(
                keyword.trim(),
                0,
                5 // Chỉ lấy 5 suggestions
            );
            return parseResponseData(response);
        } catch (error) {
            console.error("Fetch customer suggestions error:", error);
            return []; // Không throw error cho suggestions để tránh spam
        }
    },

    /**
     * Tìm kiếm sản phẩm (full search)
     * @param {string} productName - Tên sản phẩm
     * @param {number} page - Trang (mặc định 0)
     * @param {number} size - Số lượng kết quả (mặc định 20)
     * @param {Object} filters - Các bộ lọc (ramName, romName, colorName)
     * @returns {Promise<Array>} Danh sách sản phẩm
     */
    searchProducts: async (productName, page = 0, size = 20, filters = {}) => {
        // Cho phép search với productName rỗng nếu có filters
        const hasProductName = productName && productName.trim().length > 0;
        const hasBasicFilters = filters && (
            (filters.ramName && filters.ramName.trim()) ||
            (filters.romName && filters.romName.trim()) ||
            (filters.colorName && filters.colorName.trim()) ||
            (filters.brandName && filters.brandName.trim())
        );
        const hasPriceFilter = filters && (
            (filters.priceRange && filters.priceRange !== "all") ||
            (filters.customMinPrice && filters.customMinPrice.trim()) ||
            (filters.customMaxPrice && filters.customMaxPrice.trim())
        );
        const hasFilters = hasBasicFilters || hasPriceFilter;
        
        if (!hasProductName && !hasFilters) {
            return [];
        }

        try {
            const params = {
                page,
                size,
            };

            // Chỉ thêm productName nếu có giá trị
            if (hasProductName) {
                params.productName = productName.trim();
            }

            // Thêm các filters nếu có
            if (filters.ramName && filters.ramName.trim()) {
                params.ramName = filters.ramName.trim();
            }
            if (filters.romName && filters.romName.trim()) {
                // Backend query: r.nameRom LIKE CONCAT(:romName, 'GB') OR r.nameRom LIKE CONCAT(:romName, ' GB')
                // Backend tự thêm "GB" vào, nên cần extract chỉ số từ ROM name
                // VD: "128GB" -> "128", "128 GB" -> "128", "128" -> "128"
                let romValue = filters.romName.trim();
                // Loại bỏ "GB" hoặc " GB" ở cuối (case-insensitive)
                romValue = romValue.replace(/\s*GB\s*$/i, '').trim();
                // Chỉ gửi số, loại bỏ mọi ký tự không phải số
                const numberOnly = romValue.replace(/\D/g, '');
                if (numberOnly) {
                    params.romName = numberOnly;
                }
            }
            if (filters.colorName && filters.colorName.trim()) {
                params.colorName = filters.colorName.trim();
            }
            if (filters.brandName && filters.brandName.trim()) {
                params.brandName = filters.brandName.trim();
            }

            // Thêm price range filters
            if (filters.priceRange && filters.priceRange !== "all") {
                params.priceRange = filters.priceRange;
            }
            // Chỉ gửi custom price khi priceRange là "custom"
            if (filters.priceRange === "custom") {
                if (filters.customMinPrice && filters.customMinPrice.trim()) {
                    params.customMinPrice = filters.customMinPrice.trim();
                }
                if (filters.customMaxPrice && filters.customMaxPrice.trim()) {
                    params.customMaxPrice = filters.customMaxPrice.trim();
                }
            }

            const response = await axiosClient.get(
                "/productVersion/searchVersionFULLVIP",
                { params }
            );
            return parseProductResponse(response);
        } catch (error) {
            console.error("Search products error:", error);
            return [];
        }
    },

    /**
     * Lấy gợi ý sản phẩm khi gõ (suggestions)
     * @param {string} productName - Tên sản phẩm
     * @returns {Promise<Array>} Danh sách gợi ý (tối đa 5)
     */
    getProductSuggestions: async (productName) => {
        if (!productName || productName.trim().length < 1) {
            return [];
        }

        try {
            const response = await axiosClient.get(
                "/productVersion/searchVersionFULLVIP",
                {
                    params: {
                        productName: productName.trim(),
                        page: 0,
                        size: 5, // Chỉ lấy 5 suggestions
                    },
                }
            );
            return parseProductResponse(response);
        } catch (error) {
            console.error("Fetch product suggestions error:", error);
            return []; // Không throw error cho suggestions
        }
    },

    /**
     * Tạo đơn hàng tại cửa hàng
     * @param {Object} orderData - Dữ liệu đơn hàng
     * @param {number} orderData.customerId - ID khách hàng
     * @param {string} orderData.note - Ghi chú
     * @param {number} orderData.totalAmount - Tổng tiền
     * @param {string} orderData.status - Trạng thái (mặc định "PENDING")
     * @param {boolean} orderData.isPaid - Đã thanh toán (mặc định false)
     * @param {Array} orderData.orderDetails - Chi tiết đơn hàng
     * @returns {Promise<Object>} Đơn hàng đã tạo
     */
    createInStoreOrder: async (orderData) => {
        if (!orderData.customerId) {
            throw new Error("Vui lòng chọn khách hàng!");
        }

        if (!orderData.orderDetails || orderData.orderDetails.length === 0) {
            throw new Error("Vui lòng thêm sản phẩm vào giỏ hàng!");
        }

        try {
            const orderRequest = {
                customerId: Number(orderData.customerId),
                note: orderData.note || "Đơn hàng tại cửa hàng",
                totalAmount: Number(orderData.totalAmount),
                status: orderData.status || "PENDING",
                isPaid: orderData.isPaid !== undefined ? orderData.isPaid : false,
                orderDetails: orderData.orderDetails.map((item) => ({
                    productVersionId: String(item.productVersionId),
                    unitPriceBefore: Number(item.unitPriceBefore || item.price),
                    unitPriceAfter: Number(item.unitPriceAfter || item.price),
                    quantity: Number(item.quantity),
                })),
            };

            const response = await axiosClient.post("/orders", orderRequest);
            const createdOrder = response?.result || response;

            // Dispatch event để trang orders tự động refresh
            window.dispatchEvent(new CustomEvent('orderCreated', { 
                detail: { orderId: createdOrder?.orderId } 
            }));

            return createdOrder;
        } catch (error) {
            console.error("Create order error:", error);
            const errorMessage = 
                error.response?.data?.message ||
                error.response?.message ||
                error.message ||
                "Không thể tạo đơn hàng. Vui lòng thử lại!";
            throw new Error(errorMessage);
        }
    },
};

export default orderService;
