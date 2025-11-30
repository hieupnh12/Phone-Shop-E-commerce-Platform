import axios from "axios";

const BASE_URL = "http://localhost:8080/phoneShop";
export const axiosUpload = axios.create({
    baseURL: BASE_URL,
    headers: {}, // KHÔNG để multipart ở đây
});