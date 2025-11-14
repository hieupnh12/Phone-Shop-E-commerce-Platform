import axiosClient from "../api"
import { GET } from "../constants/httpMethod"

export const getInfoCommon = ((days) => {
    const response = axiosClient[GET](`/api/statistic?days=${days}`);
    return response;
})