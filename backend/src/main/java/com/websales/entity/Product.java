package com.websales.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;
@Builder                 // Tạo builder pattern giúp tạo đối tượng dễ dàng, linh hoạt
@Entity                  // Đánh dấu class này là entity, ánh xạ tới bảng trong DB
@Data                    // Tự sinh getter, setter, toString, equals, hashCode
@NoArgsConstructor       // Tạo constructor không tham số (mặc định)
@AllArgsConstructor      // Tạo constructor với tất cả các tham số
@Table(name = "products") // Đặt tên bảng trong DB là "product"
@FieldDefaults(level = AccessLevel.PRIVATE) // Mặc định các biến thành private, không cần khai báo riêng
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id", length = 255)
     Long idProduct;

    @Column(name = "product_name", length = 255)
    String nameProduct;

    @Column(name = "picture", length = 255)
     String image;

          @ManyToOne
          @JoinColumn(name = "origin_id") // 👈 ánh xạ cột origin (kiểu String chứa ID)
           Origin origin;


    @Column(name = "battery")
     String battery;

    @Column(name ="scanFrequency")
     String scanFrequency;


    @Column(name = "screenSize")
     String screenSize;

          @ManyToOne(fetch = FetchType.LAZY)
          @JoinColumn(name = "operating_system_id")
           OperatingSystem operatingSystem;


    @Column(name  ="screenResolution")
    String screenResolution;

    @Column(name="screenTech")
    String screenTech;

    @Column(name = "chipset")
     String chipset;

    @Column(name = "rearCamera", length = 255)
     String rearCamera;

    @Column(name = "frontCamera", length = 255)
    String frontCamera;

    @Column(name = "warranty_period")
    Integer warrantyPeriod;

          @ManyToOne(fetch = FetchType.LAZY)
          @JoinColumn(name = "brand_id")
           Brand brand;

          @ManyToOne(fetch = FetchType.LAZY)
          @JoinColumn(name = "warehouse_area_id")
           WarehouseArea warehouseArea;

    @Column(name = "stockQuantity")
     Integer stockQuantity;

    @Column(name = "status")
        Boolean status;


           @ManyToOne(fetch = FetchType.LAZY)
           @JoinColumn(name ="category_id")
           Category category;

          @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
          @JsonManagedReference
          List<ProductVersion> productVersion;
}
