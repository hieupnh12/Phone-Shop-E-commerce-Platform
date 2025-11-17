import axiosClient from "../api"
import { GET } from "../constants/httpMethod"

export const sendMessage = ((text) => {
    const response = axiosClient[GET]("/api/chats", text);
    return response;
})