package com.websales.repository;

import com.websales.entity.ProductVersionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageVersionRepository extends JpaRepository<ProductVersionImage, Integer> {
}
