package com.websales.service;


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

//    public WarehouseArea createWarehouseArea(WarehouseAreaRequest request) {
//        WarehouseArea area = WarehouseArea.builder()
//                .name(request.getName())
//                .note(request.getNote())
//                .status(request.isStatus())
//                .build();
//
//        return warehouseAreaRepo.save(area);
//    }
//
//    public List<WarehouseAreaResponse> getAllWarehouseAreas() {
//        return warehouseAreaRepo.findAll()
//                .stream()
//                .map(warehouseAreaMapper::toWarehouseAreaResponse)
//                .collect(Collectors.toList());
//    }
//
//    public WarehouseArea getWarehouseAreaById(Long id) {
//        return warehouseAreaRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Warehouse area not found"));
//    }
//
//
//
//    public void deleteWarehouseAreaById(Long id) {
//        boolean exists = warehouseAreaRepo.existsById(id);
//
//        //Nếu không tồn tại thì báo lỗi ngay
//        if(!exists) {
//            throw new AppException(ErrorCode.WAREHOUSE_NOT_EXIST);
//        }
//        warehouseAreaRepo.deleteById(id);
//    }
//
//
//
//
//    public WarehouseAreaResponse UpdateWarehouseAreaAttribute (Long id, WarehouseUpdateRequest request) {
//        WarehouseArea area = warehouseAreaRepo.findById(id).orElse(null);
//        area.setNote(request.getNote());
//        area.setStatus(request.isStatus());
//
//        return warehouseAreaMapper.toWarehouseAreaResponse(warehouseAreaRepo.save(area));
//    }
//



    // cac chuc nang khong phai CRUD o tren
















}
