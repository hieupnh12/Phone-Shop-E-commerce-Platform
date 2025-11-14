import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import constants from '../constants/index.js';

export const getUserRole = () => {
  const token = Cookies.get(constants.ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.roles?.[0] || null; // giả sử roles là array
  } catch (e) {
    return null;
  }
};