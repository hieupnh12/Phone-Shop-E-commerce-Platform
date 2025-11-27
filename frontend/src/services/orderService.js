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
            JSON.stringify(status), // backend yêu cầu body phải là chuỗi: "SHIPPING"
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.result;
    },
};

export default orderService;
