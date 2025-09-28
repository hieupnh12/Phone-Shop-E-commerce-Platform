import axiosClient from "../api"
import { GET } from "../constants/httpMethod"

export const getCall = (() => {
    const response = axiosClient[GET]("objects");
    return response;
})