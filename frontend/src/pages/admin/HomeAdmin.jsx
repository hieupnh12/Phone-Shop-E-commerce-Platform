import { Award, Mail, Package, Phone, TrendingUp, Users } from 'lucide-react'
import React from 'react'

export default function HomeAdmin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Commitment Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Sản phẩm chính hãng 100%</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Cam kết bằng văn bản, hoàn tiền 200% nếu phát hiện hàng nhái. Có tem chống hàng giả điện tử.
            </p>
            <div className="text-sm text-blue-600 font-semibold">✓ Có hóa đơn VAT đầy đủ</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Giá niêm yết minh bạch</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Giá trên website = giá tại cửa hàng. Không phát sinh phí. Giảm thêm 2% khi thanh toán chuyển khoản.
            </p>
            <div className="text-sm text-purple-600 font-semibold">✓ Hoàn tiền chênh lệch nếu thấy rẻ hơn</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Nhân viên được đào tạo</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              100% nhân viên có chứng chỉ từ Apple, Samsung. Kinh nghiệm trung bình 3+ năm trong ngành.
            </p>
            <div className="text-sm text-green-600 font-semibold">✓ Không ép khách, không bán hàng kèm</div>
          </div>

        </div>


        {/* Contact Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thông tin liên hệ chính thức</h2>
            <p className="text-gray-600">Mọi giao dịch ngoài các kênh dưới đây không được PhoneStore chịu trách nhiệm</p>
          </div>
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border-2 border-teal-100">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Hotline chính thức</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                <strong className="text-lg text-teal-600">1900 2468</strong><br/>
                Hỗ trợ 24/7<br/>
                <span className="text-xs text-gray-500">Cước phí: 1,000đ/phút</span>
              </p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email chính thức</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                support@phonestore.vn<br/>
                Phản hồi trong 24h làm việc<br/>
                <span className="text-xs text-gray-500">(T2-T7, 8h-18h)</span>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <strong>⚠️ Lưu ý:</strong> PhoneStore không có đại lý, cộng tác viên hay bán hàng qua Facebook cá nhân. 
              Mọi giao dịch vui lòng thực hiện tại cửa hàng hoặc website chính thức <strong>phonestore.vn</strong>
            </p>
          </div>
        </div>
      </div>
  )
}
