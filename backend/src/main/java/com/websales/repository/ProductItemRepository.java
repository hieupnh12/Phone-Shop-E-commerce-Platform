package com.websales.repository;

import com.websales.entity.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, String> {

//    // New query to find all imei by productVersionId
//    @Query("SELECT p.imei FROM ProductItem p WHERE p.versionId.versionId = :productVersionId")
//    List<String> findImeiByProductVersionId(@Param("productVersionId") String productVersionId);
//
//    // Cập nhật exportId trong ProductItem dựa trên danh sách IMEI
//    @Modifying
//    @Query("UPDATE ProductItem pi SET pi.export_id = (SELECT er FROM ExportReceipt er WHERE er.export_id = :exportId), pi.status = TRUE WHERE pi.imei IN :imeis AND (pi.export_id IS NULL OR pi.export_id.export_id != :exportId)")
//    void updateExportIdByImei(@Param("exportId") String exportId, @Param("imeis") List<String> imeis);
//
//
//
//    long countByStatus(Boolean status);
//
//    Optional<ProductItem> findByImei(String imei);
//
//    @Query(value = """
//    select * from product_item where imei = ?
//    """,nativeQuery = true)
//    Optional<ProductItem> getProductItemByImei(String imei);
//
//
//    @Query("SELECT COUNT(p) FROM ProductItem p WHERE p.export_id IS NOT NULL AND p.status = true")
//    long countVerifiedAndActive();
//
//
//    // Đếm tổng số sản phẩm
//    @Query("SELECT COUNT(p) FROM ProductItem p")
//    long countTotal();
//
//
//
//    @Query("SELECT COUNT(p) FROM ProductItem p WHERE p.status = false")
//    Long countActiveProducts();

}