import axios from "axios";
import { getApiBaseUrl } from "./index";

export const axiosUpload = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {},
});
