package com.websales.entity;

import com.websales.enums.ItemStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
@Entity                  // Đánh dấu class này là entity, ánh xạ tới bảng trong DB
@Getter
@Setter// Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@Table(name = "product_items") // Đặt tên bảng trong DB là "product"
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class ProductItem {

    @Id
    @Column(name = "imei", length = 255)
    String imei;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProductVersion")
    ProductVersion version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="product_version_id")
    @ToString.Exclude
    ProductVersion versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="order_detail_id")
    @ToString.Exclude
    OrderDetail orderDetail;


    @Enumerated(EnumType.STRING)
    @Column(name ="status")
    ItemStatus status = ItemStatus.IN_STOCK;



}
