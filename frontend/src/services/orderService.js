import axiosClient from "../api";
// axiosClient = axios instance của mày

const orderService = {
    // --- Lấy tất cả đơn hàng ---
    getAll: async () => {
        const res = await axiosClient.get("/orders");
        return res || { result: [] };
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
};

export default orderService;
