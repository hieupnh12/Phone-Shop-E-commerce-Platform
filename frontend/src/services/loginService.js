import axiosClient from "../api";
import constants from "../constants";
import { GET, POST } from "../constants/httpMethod";
import Cookies from 'js-cookie'

const LOGIN_API_ENDPOINT = '/login';

const loginApi = {

  // login thông thường
  postLogin: (account) => {
    return axiosClient[POST](LOGIN_API_ENDPOINT, account);
  },

  // login với Google
  postLoginWithGoogle: (accessToken) => {
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/gg`, accessToken);
  },

  // kiểm tra auth
  getAuth: () => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}/auth`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },

  // refresh token
  postRefreshToken: (refreshToken) => {
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/refresh_token`, { refresh_token: refreshToken });
  },

  // logout
  postLogout: () => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/logout`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
}

export default loginApi;