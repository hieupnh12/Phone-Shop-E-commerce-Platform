package com.websales.repository;

import com.websales.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepo extends JpaRepository<Permission, Integer> {
    Optional<Permission> findByModuleAndActionAndResource(String module, String action, String resource);
}
