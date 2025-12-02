import axios from "axios";
import queryString  from "query-string"
import Cookie from "js-cookie"

const env = process.env.NODE_ENV;
const BASE_URL = !env || env === "development" ? 
    (process.env.REACT_APP_API_URL_LOCAL || 'http://localhost:8080/phoneShop') : 
    (process.env.REACT_APP_API_URL || 'http://localhost:8080/phoneShop');

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"},
    paramsSerializer: (params) => queryString.stringify(params),
})

axiosClient.interceptors.request.use((config) => {
    const token = Cookie.get("token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
})

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        
        // Helper function to determine if admin or customer and redirect
        const handleUnauthorized = () => {
            Cookie.remove("token");
            Cookie.remove("refreshToken");
            
            // Check if this is an admin request
            const isAdminRequest = originalRequest?.url && originalRequest.url.includes('/admin');
            const isAdminPath = window.location.pathname.includes('/admin');
            
            if (isAdminRequest || isAdminPath) {
                // Admin: redirect to admin-login
                window.location.href = "/admin-login";
            } else {
                // Customer: redirect to login
                window.location.href = "/login";
            }
        };
        
        // Handle 401 Unauthorized
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookie.get("refreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${BASE_URL}/login/refresh_token`, { refresh_token: refreshToken });
                    Cookie.set("token", res.data.accessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
                    return axiosClient(originalRequest);
                } catch (err) {
                    // Refresh token failed - redirect based on admin/customer
                    handleUnauthorized();
                }
            } else {
                // No refresh token - redirect based on admin/customer
                handleUnauthorized();
            }
        }
        
        // Handle 500 Internal Server Error
        if (status === 500) {
            handleUnauthorized();
        }
        
        return Promise.reject(error);
    }
)

export default axiosClient;