import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/api';


const useCustomerInfo = () => {
    const [customerInfo, setCustomerInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInfo = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchInfo();
    }, [fetchInfo]);

    return { customerInfo, isLoading, error, refetch: fetchInfo };
};

export default useCustomerInfo;