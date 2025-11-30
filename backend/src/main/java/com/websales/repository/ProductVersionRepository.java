package com.websales.repository;


import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.Product;
import com.websales.entity.ProductVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProductVersionRepository extends JpaRepository<ProductVersion, String> {

    @Query("SELECT pv FROM ProductVersion pv " +
            "JOIN pv.product p " +
            "JOIN pv.rom r " +
            "JOIN pv.ram ra " +
            "JOIN pv.color c " +
            "WHERE p.nameProduct = :productName " + // Giả sử Product có trường 'name'
            "AND r.nameRom = :romName " +
            "AND ra.nameRam = :ramName " +
            "AND c.nameColor = :colorName")
    ProductVersion findByProductVersionByTT(
            @Param("productName") String productName,
            @Param("romName") String romName,
            @Param("ramName") String ramName,
            @Param("colorName") String colorName);


    /// //////////////////////////////////////////////////////////////////////////



    @Query("SELECT pv FROM ProductVersion pv " +
            "LEFT JOIN FETCH pv.product p " +
            "LEFT JOIN FETCH p.origin o " +
            "LEFT JOIN FETCH p.brand b " +
            "LEFT JOIN FETCH p.operatingSystem os " +
            "LEFT JOIN FETCH p.warehouseArea w " +
//        "LEFT JOIN FETCH p.category c " +
            "LEFT JOIN FETCH pv.rom r " +
            "LEFT JOIN FETCH pv.ram ra " +
            "LEFT JOIN FETCH pv.color col " +
//        "LEFT JOIN FETCH pv.images i " +
            "WHERE (:brandName IS NULL OR LOWER(b.nameBrand) LIKE LOWER(CONCAT('%', :brandName, '%')))  " +
            "AND (:warehouseAreaName IS NULL OR LOWER(w.nameWarehouseArea) LIKE LOWER(CONCAT('%', :warehouseAreaName, '%'))) " +
            "AND (:originName IS NULL OR LOWER(o.nameOrigin) LIKE LOWER(CONCAT('%', :originName, '%')))" +
            "AND (:operatingSystemName IS NULL OR LOWER(os.nameOS) LIKE LOWER(CONCAT('%', :operatingSystemName, '%'))) " +
            "AND (:productName IS NULL OR LOWER(p.nameProduct) LIKE LOWER(CONCAT('%', :productName, '%')))"  +
//        "AND (:categoryName IS NULL OR LOWER(c.nameCategory) LIKE LOWER(CONCAT('%', :categoryName, '%')))" +
            "AND (:battery IS NULL OR LOWER(p.battery) LIKE LOWER(CONCAT('%', :battery, '%')))" +  // Giữ LIKE cho exact search, thêm range bên dưới
            "AND (:scanFrequency IS NULL OR LOWER(p.scanFrequency) LIKE LOWER(CONCAT('%', :scanFrequency, '%')))" +
            "AND (:screenSize IS NULL OR LOWER(p.screenSize) LIKE LOWER(CONCAT('%', :screenSize, '%')))" +  // Giữ LIKE, thêm range
            "AND (:screenResolution IS NULL OR LOWER(p.screenResolution) LIKE LOWER(CONCAT('%', :screenResolution, '%')))" +
            "AND (:screenTech IS NULL OR LOWER(p.screenTech) LIKE LOWER(CONCAT('%', :screenTech, '%')))" +
            "AND (:chipset IS NULL OR LOWER(p.chipset) LIKE LOWER(CONCAT('%', :chipset, '%')))" +
            "AND (:rearCamera IS NULL OR LOWER(p.rearCamera) LIKE LOWER(CONCAT('%', :rearCamera, '%')))" +
            "AND (:frontCamera IS NULL OR LOWER(p.frontCamera) LIKE LOWER(CONCAT('%', :frontCamera, '%')))" +
//        "AND (:image IS NULL OR LOWER(p.image) LIKE LOWER(CONCAT('%', :image, '%')) OR LOWER(pv.image) LIKE LOWER(CONCAT('%', :image, '%')))" +
            "AND (:warrantyPeriod IS NULL OR p.warrantyPeriod = :warrantyPeriod)" +
//        "AND (:stockQuantity IS NULL OR p.stockQuantity = :stockQuantity OR pv.stockQuantity = :stockQuantity)" +
//        "AND (:status IS NULL OR p.status = :status OR pv.status = :status)" +
            "AND (:romName IS NULL OR LOWER(r.nameRom) LIKE LOWER(CONCAT('%', :romName, '%')))" +
            "AND (:ramName IS NULL OR LOWER(ra.nameRam) LIKE LOWER(CONCAT('%', :ramName, '%')))" +
            "AND (:colorName IS NULL OR LOWER(col.nameColor) LIKE LOWER(CONCAT('%', :colorName, '%')))" +
            "AND (:importPrice IS NULL OR pv.importPrice = :importPrice)" +
            "AND (:exportPrice IS NULL OR pv.exportPrice = :exportPrice)" +
            // Thêm range conditions cho price (exportPrice)
            "AND (:minExportPrice IS NULL OR pv.exportPrice >= :minExportPrice)" +
            "AND (:maxExportPrice IS NULL OR pv.exportPrice <= :maxExportPrice)" +
            // Thêm range cho battery (extract số từ String "3500 mAh" → CAST(SUBSTRING(p.battery, 1, LOCATE(' ', p.battery)-1) AS INTEGER))
            "AND (:minBattery IS NULL OR CAST(SUBSTRING(p.battery, 1, LOCATE(' ', p.battery) - 1) AS INTEGER) >= :minBattery)" +
            "AND (:maxBattery IS NULL OR CAST(SUBSTRING(p.battery, 1, LOCATE(' ', p.battery) - 1) AS INTEGER) <= :maxBattery)" +
            // Thêm range cho screenSize (extract số từ "6.2 inch" → CAST(REPLACE(SUBSTRING(p.screenSize, 1, LOCATE(' ', p.screenSize) - 1), '.', '.') AS DOUBLE) – adjust nếu cần
            "AND (:minScreenSize IS NULL OR CAST(REPLACE(SUBSTRING(p.screenSize, 1, LOCATE(' ', p.screenSize) - 1), ',', '.') AS DOUBLE) >= :minScreenSize)" +
            "AND (:maxScreenSize IS NULL OR CAST(REPLACE(SUBSTRING(p.screenSize, 1, LOCATE(' ', p.screenSize) - 1), ',', '.') AS DOUBLE) <= :maxScreenSize)" +
            "ORDER BY p.idProduct DESC ")
    Page<ProductVersion> findProductVersionsWithCombinedFilters(
            // Params cũ giữ nguyên
            @Param("brandName") String brandName,
            @Param("warehouseAreaName") String warehouseAreaName,
            @Param("originName") String originName,
            @Param("operatingSystemName") String operatingSystemName,
            @Param("productName") String productName,
//        @Param("categoryName") String categoryName,
            @Param("battery") String battery,
            @Param("scanFrequency") String scanFrequency,
            @Param("screenSize") String screenSize,
            @Param("screenResolution") String screenResolution,
            @Param("screenTech") String screenTech,
            @Param("chipset") String chipset,
            @Param("rearCamera") String rearCamera,
            @Param("frontCamera") String frontCamera,
//        @Param("image") String image,
            @Param("warrantyPeriod") Integer warrantyPeriod,
//        @Param("stockQuantity") Integer stockQuantity,
//        @Param("status") Boolean status,
            @Param("romName") String romName,
            @Param("ramName") String ramName,
            @Param("colorName") String colorName,
            @Param("importPrice") BigDecimal importPrice,
            @Param("exportPrice") BigDecimal exportPrice,
            // Params mới cho ranges
            @Param("minExportPrice") BigDecimal minExportPrice,
            @Param("maxExportPrice") BigDecimal maxExportPrice,
            @Param("minBattery") Integer minBattery,
            @Param("maxBattery") Integer maxBattery,
            @Param("minScreenSize") Double minScreenSize,
            @Param("maxScreenSize") Double maxScreenSize,
            Pageable pageable
    );







    /**
     * Lấy top 5 sản phẩm có số lượng đã bán nhiều nhất
     * Tính tổng số lượng từ order_details (SUM quantity)
     *
     * @return List<Object[]> với [0]: Product, [1]: Long (tổng số lượng đã bán)
     */
    @Query("SELECT p, COALESCE(SUM(od.quantity), 0) as soldQuantity " +
            "FROM Product p " +
            "JOIN p.productVersion pv " +
            "JOIN OrderDetail od ON od.productVersion = pv " +
            "JOIN od.order o " +
            "WHERE o.status = :status " +
            "GROUP BY p.idProduct " +
            "ORDER BY soldQuantity DESC")
    List<Object[]> findTop5ProductsByOrderDetailCount(@Param("status") com.websales.enums.OrderStatus status);




}