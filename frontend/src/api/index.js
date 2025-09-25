import axios from "axios";
import queryString  from "query-string"
import Cookie from "js-cookie"

const env = process.env.NODE_ENV;
const BASE_URL = !env || env === "development" ? 
    process.env.REACT_APP_API_URL_LOCAL : process.env.REACT_APP_API_URL;

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json"},
    withCredentials: true,
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
    (error) => {
        if (error.response.status === 401) {
             // Token hết hạn → logout hoặc refresh
            Cookie.remove("token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
)

export default axiosClient;