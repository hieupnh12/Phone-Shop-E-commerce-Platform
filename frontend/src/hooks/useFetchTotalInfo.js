
import { useState, useEffect } from "react";
import { profileService } from "../services/api";

const useFetchTotalInfo = (customerId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!customerId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await profileService.getTotalOrders(customerId);
                setData(result);
            } catch (err) {
                setError(err);
                console.error("Lỗi khi fetch tổng quan:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [customerId]);

    return { data, loading, error };
};

export default useFetchTotalInfo;