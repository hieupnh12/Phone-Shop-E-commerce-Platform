import axiosClient from "../api"
import { GET, POST } from "../constants/httpMethod"

const LOGIN_API_ENDPOINT = '/api/chats';

const chatsApi = {
    
    // send Message 
    sendMessage: (message) => {
        return axiosClient[POST](`${LOGIN_API_ENDPOINT}`, message)
    }

}

export default chatsApi;