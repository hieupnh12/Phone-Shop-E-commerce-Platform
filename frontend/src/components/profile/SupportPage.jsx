import React from 'react';
import { MessageCircle, Phone, Home, Mail, Clock } from 'lucide-react';

const SupportPage = () => {
    return (
        <div className="bg-white p-6 shadow-lg rounded-xl">
            <div className="flex items-center mb-6">
                <MessageCircle size={24} className="text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Góp ý - Hỗ trợ</h2>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">Thông tin liên hệ</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <Phone size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Số điện thoại</p>
                                <p className="text-gray-700 text-lg font-semibold">0909696999</p>
                                <p className="text-sm text-gray-500 mt-1">Hỗ trợ 24/7</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Home size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Địa chỉ cửa hàng</p>
                                <p className="text-gray-700">244 Nam Kì khởi Nghĩa, P. Hoà Quí, Q. Ngữ Hành Sơn, Đà Nẵng</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Clock size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-800">Thời gian làm việc</p>
                                <p className="text-gray-700">8:00 - 20:00 (Tất cả các ngày trong tuần)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">Dịch vụ hỗ trợ</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn với các dịch vụ:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Tư vấn sản phẩm và giải đáp thắc mắc</li>
                            <li>Hỗ trợ kỹ thuật và sửa chữa</li>
                            <li>Xử lý khiếu nại và phản hồi</li>
                            <li>Hướng dẫn sử dụng sản phẩm</li>
                            <li>Chăm sóc khách hàng sau bán hàng</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-3 text-lg">Góp ý của bạn</h3>
                    <div className="text-sm text-gray-700">
                        <p>Chúng tôi rất mong nhận được ý kiến đóng góp từ quý khách hàng để cải thiện chất lượng dịch vụ. 
                        Vui lòng liên hệ với chúng tôi qua số điện thoại hoặc đến trực tiếp cửa hàng.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;

