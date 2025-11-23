package com.websales.repository;


import com.websales.entity.ProductVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductVersionRepository extends JpaRepository<ProductVersion, String> {



}