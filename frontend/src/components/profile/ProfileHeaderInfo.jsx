import React, { useEffect, useState } from "react";
import { Clock, ShoppingCart, DollarSign } from 'lucide-react';
import useFetchTotalInfo from "../../hooks/useFetchTotalInfo";

const MOCK_CUSTOMER_ID = 11;

const ProfileHeaderInfo = ({ customer }) => {


    const { data: customerStats, loading } = useFetchTotalInfo(customer?.customerId || MOCK_CUSTOMER_ID)

    const defaultData = {
        name: 'Nguyễn Nhất Sinh',
        phone: '098******94',
        rank: 'S-MEM',
        lastUpdate: '01/01/2026',
        totalOrders: 0,
        totalSavings: 0,
    };
    const data = {
        ...defaultData,
        fullName: customer?.fullName || defaultData.fullName,
        phoneNumber: customer?.phoneNumber || defaultData.phoneNumber,
        totalOrders: customerStats?.totalOrders || defaultData.totalOrders,
        totalSavings: customerStats?.totalAmount || defaultData.totalSavings, // totalAmount từ API sẽ là totalSavings
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const renderRankTag = (rank) => {
        let baseClasses = "px-3 py-1 text-xs font-semibold rounded-full mr-2";
        if (rank === 'S-MEM') {
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{rank}</span>;
        }
        if (rank === 'S-Student') {
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>{rank}</span>;
        }
        return null;
    };

    const StatItem = ({ icon: Icon, value, label, iconBgColor, valueColor }) => (
        <div className="flex flex-col items-center justify-center p-2">
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor} mr-3`}>
                    <Icon size={20} className={valueColor} />
                </div>
                <div>
                    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 mt-16">
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch">

                {/* Cột 1: Thông tin cá nhân và Thẻ thành viên */}
                <div className="flex-shrink-0 flex items-center w-full lg:w-1/3 pb-4 lg:pb-0">
                    <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mr-4">
                        <img src="/image/loginbg.png" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-gray-800">{data.fullName}</h3>
                        <p className="text-sm text-gray-500 my-1">
                            {data.phoneNumber}
                        </p>
                        <div className="flex items-center mt-1">
                            {renderRankTag(data.rank)}
                            {renderRankTag('S-Student')} {/* Giả định tag thứ 2 luôn là S-Student */}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 flex items-center">
                            <Clock size={14} className="mr-1.5" />
                            Cập nhật lại sau {data.lastUpdate}
                        </p>
                    </div>
                </div>

                {/* Đường phân cách dọc (chỉ hiển thị trên desktop) */}
                <div className="hidden lg:block w-px bg-red-300 mx-4"></div>

                {/* Cột 2 & 3: Số liệu thống kê */}
                <div className="flex flex-grow mt-4 lg:mt-0 items-center justify-around lg:justify-start">

                    {/* Số đơn hàng */}
                    <div className="flex items-center w-full lg:w-1/2 p-2 border-r border-red-300">
                        <StatItem
                            icon={ShoppingCart}
                            value={data.totalOrders}
                            label="Tổng số đơn hàng đã mua"
                            iconBgColor="bg-red-100"
                            valueColor="text-gray-800"
                        />
                    </div>

                    <div className="flex items-center w-full lg:w-1/2 p-2">
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center mb-1">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 mr-3">
                                    <DollarSign size={20} className="text-red-500" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{formatCurrency(data.totalSavings)}</p>
                                    <p className="text-sm text-gray-500">Tổng tiền tích lũy</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 ml-12">
                                Từ 01/01/2024
                                <br/>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeaderInfo;