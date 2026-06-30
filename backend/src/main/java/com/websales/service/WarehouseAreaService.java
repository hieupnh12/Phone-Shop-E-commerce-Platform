package com.websales.service;


import com.websales.dto.request.WarehouseAreaRequest;
import com.websales.dto.request.WarehouseUpdateRequest;
import com.websales.dto.response.WarehouseAreaResponse;
import com.websales.entity.WarehouseArea;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.WarehouseAreaMapper;
import com.websales.repository.WarehouseAreaRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WarehouseAreaService {

    WarehouseAreaRepository warehouseAreaRepo;
    WarehouseAreaMapper warehouseAreaMapper;

    public WarehouseArea createWarehouseArea(WarehouseAreaRequest request) {

        log.info("➡️ [REQUEST] Create WarehouseArea: {}", request);

        WarehouseArea area = warehouseAreaMapper.toWarehouseArea(request);

        log.info("✅ [MAPPED ENTITY] Before save: {}", area);

        WarehouseArea saved = warehouseAreaRepo.save(area);

        log.info("💾 [SAVED ENTITY] After save: {}", saved);

        return saved;
    }

    public List<WarehouseAreaResponse> getAllWarehouseAreas() {
        return warehouseAreaRepo.findAll()
                .stream()
                .map(warehouseAreaMapper::toWarehouseAreaResponse)
                .collect(Collectors.toList());
    }

    public WarehouseArea getWarehouseAreaById(String id) {
        return warehouseAreaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse area not found"));
    }



    public void deleteWarehouseAreaById(String id) {
        boolean exists = warehouseAreaRepo.existsById(id);

        //Nếu không tồn tại thì báo lỗi ngay
        if(!exists) {
            throw new AppException(ErrorCode.WAREHOUSE_NOT_EXIST);
        }
        warehouseAreaRepo.deleteById(id);
    }




    public WarehouseAreaResponse UpdateWarehouseAreaAttribute (String id, WarehouseUpdateRequest request) {
        WarehouseArea area = warehouseAreaRepo.findById(id).orElse(null);
        warehouseAreaMapper.updateWarehouseArea(request,area);
        return warehouseAreaMapper.toWarehouseAreaResponse(warehouseAreaRepo.save(area));
    }




    // cac chuc nang khong phai CRUD o tren
















}
