import axios from "axios";
import queryString  from "query-string"
import Cookie from "js-cookie"

const env = process.env.NODE_ENV;
const BASE_URL = !env || env === "development" ? 
    process.env.REACT_APP_API_URL_LOCAL : process.env.REACT_APP_API_URL;

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"},
    // withCredentials: true,
    paramsSerializer: (params) => queryString.stringify(params),
})

// interceptors
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
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = Cookie.get("refreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post(`${BASE_URL}/login/refresh_token`, { refresh_token: refreshToken });
                    Cookie.set("token", res.data.accessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
                    return axiosClient(originalRequest); // retry request
                } catch (err) {
                    Cookie.remove("token");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
)

export default axiosClient;