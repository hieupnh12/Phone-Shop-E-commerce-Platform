package com.websales.repository;

import com.websales.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    //JPA tự động general code cho các interface trong này , trừ các yêu cầu đặt biệt ra thì các tạo mới , thêm , xóa, .... có code sẵn hết



    @Query(value ="SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.origin " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.operatingSystem " +
            "LEFT JOIN FETCH p.warehouseArea " +
            "LEFT JOIN FETCH p.productVersion pv " +
            "LEFT JOIN FETCH p.category " +
            "WHERE p.status = true " +  // Chỉ load products có status = true (bật)
            "AND (pv.status = true OR pv IS NULL) " +  // Chỉ load versions có status = true hoặc không có version
            "ORDER BY p.idProduct DESC",
            countQuery = "SELECT count(DISTINCT p) FROM Product p " +  // Tùy chỉnh: loại join productVersion
                    "LEFT JOIN p.origin " +
                    "LEFT JOIN p.brand " +
                    "LEFT JOIN p.operatingSystem " +
                    "LEFT JOIN p.warehouseArea " +
                    "LEFT JOIN p.category " +
                    "WHERE p.status = true")  // Không có productVersion = đếm sản phẩm duy nhất)
    Page<Product> findProductsWithRelations(Pageable pageable);


    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.origin " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.operatingSystem " +
            "LEFT JOIN FETCH p.warehouseArea " +
            "LEFT JOIN FETCH p.productVersion " +
            "LEFT JOIN FETCH p.category " +
            "WHERE p.idProduct = :id")
    Product findByIdProduct(@Param("id") Long id);

    @Query(value = "SELECT DISTINCT p FROM Product p " +
            "LEFT JOIN FETCH p.origin " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.operatingSystem " +
            "LEFT JOIN FETCH p.warehouseArea " +
            "LEFT JOIN FETCH p.productVersion pv " +
            "LEFT JOIN FETCH p.category " +
            "ORDER BY p.idProduct DESC",
            countQuery = "SELECT count(DISTINCT p) FROM Product p " +
                    "LEFT JOIN p.origin " +
                    "LEFT JOIN p.brand " +
                    "LEFT JOIN p.operatingSystem " +
                    "LEFT JOIN p.warehouseArea " +
                    "LEFT JOIN p.category ")
    Page<Product> findAllProductsForAdmin(Pageable pageable);


    @Query("SELECT COALESCE(SUM(pv.stockQuantity), 0) FROM ProductVersion pv WHERE pv.product = :product")
    int calculateStockQuantity(@Param("product") Product product);


    @Modifying
    @Transactional
    @Query(value = """
                DELETE FROM ProductItem pi
                WHERE pi.versionId.idVersion IN (
                    SELECT pv.idVersion
                    FROM ProductVersion pv
                    WHERE pv.product.idProduct = :productId
                )
            """)
    void deleteSafeProductItems(Long productId);

    // Query 2: Xóa PV không có orderDetail (sau khi xóa PI)
    @Modifying
    @Transactional
    @Query(value = """
            DELETE FROM ProductVersion pv
            WHERE pv.product.idProduct = :productId
        """)
    void deleteSafeProductVersions(Long productId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Product p WHERE p.idProduct = :productId")
    void deleteProductById(Long productId);

    @Query("""
            SELECT COUNT(pi) > 0
            FROM ProductItem pi
            WHERE pi.orderDetail IS NOT NULL AND pi.versionId.idVersion IN (
                SELECT pv.idVersion FROM ProductVersion pv
                WHERE pv.product.idProduct = :productId
            )
        """)
    boolean hasOrderDetails(Long productId);







    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.origin o " +
            "LEFT JOIN FETCH p.brand  b " +
            "LEFT JOIN FETCH p.operatingSystem os " +
            "LEFT JOIN FETCH p.warehouseArea  w " +
            "LEFT JOIN FETCH p.category c " +
            "LEFT JOIN FETCH p.productVersion  pv " +
            "WHERE (:brandName IS NULL OR LOWER( b.nameBrand) LIKE LOWER(CONCAT('%', :brandName, '%')))  " +
            "AND (:warehouseAreaName IS NULL OR LOWER(w.nameWarehouseArea) LIKE LOWER(CONCAT('%', :warehouseAreaName, '%'))) " +
            "AND (:originName IS NULL OR LOWER(o.nameOrigin) LIKE LOWER(CONCAT('%', :originName, '%')))" +
            "AND (:operatingSystemName IS NULL OR LOWER(os.nameOS) LIKE LOWER(CONCAT('%', :operatingSystemName, '%'))) " +
            "AND (:productName IS NULL OR LOWER(p.nameProduct) LIKE LOWER(CONCAT('%', :productName, '%')))"  +
//            "AND (:categoryName IS NULL OR LOWER(c.nameCategory) LIKE LOWER(CONCAT('%', :categoryName, '%')))" +
            "AND (:battery IS NULL OR LOWER(p.battery) LIKE LOWER(CONCAT('%', :battery, '%')))" +
            "AND (:scanFrequency IS NULL OR LOWER(p.scanFrequency) LIKE LOWER(CONCAT('%', :scanFrequency, '%')))" +
            "AND (:screenSize IS NULL OR LOWER(p.screenSize) LIKE LOWER(CONCAT('%', :screenSize, '%')))" +
            "AND (:screenResolution IS NULL OR LOWER(p.screenResolution) LIKE LOWER(CONCAT('%', :screenResolution, '%')))" +
            "AND (:screenTech IS NULL OR LOWER(p.screenTech) LIKE LOWER(CONCAT('%', :screenTech, '%')))" +
            "AND (:chipset IS NULL OR LOWER(p.chipset) LIKE LOWER(CONCAT('%', :chipset, '%')))" +
            "AND (:rearCamera IS NULL OR LOWER(p.rearCamera) LIKE LOWER(CONCAT('%', :rearCamera, '%')))" +
            "AND (:frontCamera IS NULL OR LOWER(p.frontCamera) LIKE LOWER(CONCAT('%', :frontCamera, '%')))" +
//            "AND (:image IS NULL OR LOWER(p.image) LIKE LOWER(CONCAT('%', :image, '%')))" +
            "AND (:warrantyPeriod IS NULL OR p.warrantyPeriod = :warrantyPeriod)" +
//            "AND (:stockQuantity IS NULL OR p.stockQuantity = :stockQuantity)" +
            "AND (:status IS NULL OR p.status = :status)" +
            "ORDER BY p.idProduct DESC ")
    Page<Product> findProductsWithFilters(
            @Param("brandName")String brandName ,
            @Param("warehouseAreaName") String warehouseAreaName ,
            @Param("originName") String originName ,
            @Param("operatingSystemName") String operatingSystemName ,
            @Param("productName") String productName,
//            @Param("categoryName") String categoryName,
            @Param("battery") String battery,
            @Param("scanFrequency") String scanFrequency,
            @Param("screenSize") String screenSize,
            @Param("screenResolution") String screenResolution,
            @Param("screenTech") String screenTech,
            @Param("chipset") String chipset,
            @Param("rearCamera") String rearCamera,
            @Param("frontCamera") String frontCamera,
//            @Param("image") String image,
            @Param("warrantyPeriod") Integer warrantyPeriod,
//            @Param("stockQuantity") Integer stockQuantity,
            @Param("status") Boolean status,
            Pageable pageable
    );


//    @Query("SELECT DISTINCT p FROM Product p " +
//            "LEFT JOIN FETCH p.origin " +
//            "LEFT JOIN FETCH p.brand " +
//            "LEFT JOIN FETCH p.operatingSystem " +
//            "LEFT JOIN FETCH p.warehouseArea " +
//            "LEFT JOIN FETCH p.productVersion pv " +
//            "WHERE EXISTS (SELECT pi FROM ProductItem pi " +
//            "WHERE pi.versionId = pv AND pi.imei = :imei AND pi.export_id IS NULL)")
//    Optional<Product> findByImei(String imei);



}
