package com.websales.repository;


 import com.websales.entity.WarehouseArea;
 import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseAreaRepository extends JpaRepository<WarehouseArea, String> {

//    List<WarehouseArea> findByStatusTrue();
//    @Query(value = "SELECT COUNT(DISTINCT w.area_name) AS mountArea " +
//            "FROM product p " +
//            "LEFT JOIN warehouse_area w ON p.warehouse_area = w.area_id",
//            nativeQuery = true)
//    long countDistinctAreaName();


}
