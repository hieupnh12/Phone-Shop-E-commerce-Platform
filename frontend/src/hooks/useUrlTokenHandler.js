import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import constants from "../constants/index.js";

export const useUrlTokenHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            console.log("Tìm thấy JWT trong URL. Đang lưu trữ vào Cookie và dọn dẹp URL.");

            Cookies.set(constants.ACCESS_TOKEN_KEY, token);
            console.log(token + "")
            navigate(location.pathname, { replace: true });

        }

    }, [location, navigate]);
};