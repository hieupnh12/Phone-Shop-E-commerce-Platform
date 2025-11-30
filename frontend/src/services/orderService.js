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
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        const res = await axiosClient.get(`/orders?${params.toString()}`);
        return res || { result: { content: [], totalElements: 0, totalPages: 0 } };
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
     * @returns {Promise<Array>} Danh sách sản phẩm
     */
    searchProducts: async (productName, page = 0, size = 20) => {
        if (!productName || productName.trim().length < 2) {
            return [];
        }

        try {
            const response = await axiosClient.get(
                "/productVersion/searchVersionFULLVIP",
                {
                    params: {
                        productName: productName.trim(),
                        page,
                        size,
                    },
                }
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
