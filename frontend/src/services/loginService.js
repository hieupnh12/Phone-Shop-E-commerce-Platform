import axiosClient from "../api";
import constants from "../constants";
import { GET, POST } from "../constants/httpMethod";
import Cookies from 'js-cookie'

const LOGIN_API_ENDPOINT = '/employee';

const loginApi = {

  // admin/ staff và manager login thông thường
  postLogin: (account) => {
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/auth`, account);
  },

  // login với Google
  postLoginWithGoogle: (accessToken) => {
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/gg`, accessToken);
  },

  // Customer login với SDT
  postLoginWithSDT: (sdt) => {
    return axiosClient[POST](`customer/auth`, sdt);
  },

  verifySDT: (otp) => {
    return axiosClient[POST](`customer/auth_verify_otp`, otp);
  },

  // kiểm tra auth
  getAuth: () => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/auth_check_valid`, token);
  },

  getInfo: () => {
    return axiosClient[GET](`${LOGIN_API_ENDPOINT}/get_infor`);
  },

  // refresh token
  postRefreshToken: (refreshToken) => {
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/refresh_token`, { refresh_token: refreshToken });
  },

  // logout
  postLogout: () => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
    return axiosClient[POST](`${LOGIN_API_ENDPOINT}/auth_logout`, token);
  },
}

export default loginApi;