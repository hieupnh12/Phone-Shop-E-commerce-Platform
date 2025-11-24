package com.websales.entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
@Entity // Đánh dấu class này là entity, ánh xạ tới bảng trong DB
@Data // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor // Tạo constructor không tham số (mặc định)
@AllArgsConstructor // Tạo constructor với tất cả các tham số
@Table(name = "version_image") // Đặt tên bảng trong DB là "product"
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class ProductVersionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    int imageId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_version_id")
    @JsonBackReference
    ProductVersion productVersionId;

    @Column(name = "image")
    String images;

}
