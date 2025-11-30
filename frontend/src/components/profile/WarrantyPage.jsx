import React from 'react';
import { Shield } from 'lucide-react';

const WarrantyPage = () => {
    return (
        <div className="bg-white p-6 shadow-lg rounded-xl">
            <div className="flex items-center mb-6">
                <Shield size={24} className="text-red-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Thông tin bảo hành</h2>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3 text-lg">Chính sách bảo hành</h3>
                    <div className="text-sm text-gray-700 leading-relaxed space-y-3">
                        <p>
                            <strong>Thời gian bảo hành:</strong> Bảo hành sản phẩm trong vòng 1 năm kể từ khi mua hàng.
                        </p>
                        <p>
                            <strong>Điều kiện bảo hành:</strong> Trong thời gian bảo hành, sản phẩm sẽ được sửa chữa hoặc thay thế miễn phí nếu có lỗi do nhà sản xuất.
                        </p>
                        <p>
                            <strong>Yêu cầu:</strong> Khách hàng cần giữ hóa đơn mua hàng và không được tự ý tháo rời, sửa chữa sản phẩm.
                        </p>
                        <p>
                            <strong>Lưu ý:</strong> Bảo hành không áp dụng cho các trường hợp:
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Sản phẩm bị hư hỏng do sử dụng không đúng cách</li>
                            <li>Sản phẩm bị hư hỏng do thiên tai, hỏa hoạn, nước vào</li>
                            <li>Sản phẩm đã bị tháo rời hoặc sửa chữa bởi người không được ủy quyền</li>
                            <li>Sản phẩm bị mất tem bảo hành hoặc hóa đơn mua hàng</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 text-lg">Quy trình bảo hành</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Khách hàng mang sản phẩm và hóa đơn mua hàng đến cửa hàng</li>
                        <li>Nhân viên kiểm tra tình trạng sản phẩm và xác nhận điều kiện bảo hành</li>
                        <li>Tiến hành sửa chữa hoặc thay thế sản phẩm (nếu cần)</li>
                        <li>Giao lại sản phẩm cho khách hàng sau khi hoàn tất</li>
                    </ol>
                </div>

                <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-3 text-lg">Thông tin liên hệ</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Địa chỉ:</strong> 244 Nam Kì khởi Nghĩa, P. Hoà Quí, Q. Ngữ Hành Sơn, Đà Nẵng</p>
                        <p><strong>Số điện thoại:</strong> 0909696999</p>
                        <p><strong>Thời gian làm việc:</strong> 8:00 - 20:00 (Tất cả các ngày trong tuần)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarrantyPage;

