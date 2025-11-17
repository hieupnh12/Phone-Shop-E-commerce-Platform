import axiosClient from "../api"
import { GET } from "../constants/httpMethod"

const LOGIN_API_ENDPOINT = '/api/statistic';

const statisticApi = {
    
    // get api info summary
    getInfoSummary: (days) => {
        return axiosClient[GET](`${LOGIN_API_ENDPOINT}?days=${days}`)
    }

    // get api order
}

export default statisticApi;