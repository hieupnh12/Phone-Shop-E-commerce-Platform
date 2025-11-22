import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


export const useTokenExtractor = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            console.log("Tìm thấy JWT từ URL. Đang lưu trữ và dọn dẹp URL.");

            localStorage.setItem('jwtToken', token);


            navigate(location.pathname, { replace: true });
        }

    }, [location, navigate]);

};