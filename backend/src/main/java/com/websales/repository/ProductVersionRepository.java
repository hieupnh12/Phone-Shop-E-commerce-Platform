package com.websales.repository;


import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.ProductVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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

}