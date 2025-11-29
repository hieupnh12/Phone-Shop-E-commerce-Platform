//file ProfilePageLayout
import React from 'react';
import ProfileSidebar from './ProfileSidebar';
import ProfileHeaderInfo from './ProfileHeaderInfo';
import useCustomerInfo from "../../hooks/useCustomerInfo";

import { Outlet } from 'react-router-dom';


const ProfilePageLayout = () => {
    const { customerInfo, isLoading, error } = useCustomerInfo();

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải ...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Lỗi tải dữ liệu: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Header Tóm tắt (phần luôn cố định ở đầu trang Profile) */}
                <ProfileHeaderInfo customer={customerInfo} />

                {/* Bố cục Chính: Sidebar và Nội dung */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">

                    {/* Cột 1: Sidebar (Dùng 1 cột trên di động, 1/4 hoặc 1/5 trên desktop) */}
                    <div className="md:col-span-1 lg:col-span-1">
                        {/* Truyền activePath để Sidebar biết mục nào đang được chọn */}
                        <ProfileSidebar />
                    </div>

                    {/* Cột 2: Nội dung Chính - CHÍNH LÀ children */}
                    <div className="md:col-span-3 lg:col-span-4">
                        <Outlet context={{ customerInfo }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePageLayout;