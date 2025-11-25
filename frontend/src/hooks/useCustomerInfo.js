import { useState, useEffect } from 'react';
import { profileService } from '../services/api';


const useCustomerInfo = () => {
    const [customerInfo, setCustomerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                setIsLoading(true);
                // Gọi API lấy thông tin người dùng
                const result = await profileService.getCustomerInfo();
                setCustomerInfo(result);
                setError(null);
            } catch (err) {
                console.error("Lỗi khi fetch thông tin khách hàng:", err);
                setError("Không thể tải thông tin khách hàng.");
                setCustomerInfo(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInfo();
    }, []);

    return { customerInfo, isLoading, error };
};

export default useCustomerInfo;