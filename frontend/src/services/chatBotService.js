import axiosClient from "../api"
import { axiosUpload } from "../api/apiUpload";
import { GET, POST } from "../constants/httpMethod"

const API = '/api/chats';

const chatsApi = {
    
    // send Message 
    sendMessage: (message) => {
        return axiosClient[POST](`${API}`, {message})
    },

 // Gửi IMAGE (FormData)
    sendImage: async (formData) => {
        const res = await axiosUpload[POST](`${API}/chat-image`, formData);
         return res?.data;
    }
}

export default chatsApi;