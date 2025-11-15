package com.websales.controller;


import com.websales.dto.request.ApiResponse;
import com.websales.dto.request.WarehouseAreaRequest;
import com.websales.dto.request.WarehouseUpdateRequest;
import com.websales.dto.response.WarehouseAreaResponse;
import com.websales.entity.WarehouseArea;
import com.websales.repository.WarehouseAreaRepository;
import com.websales.service.WarehouseAreaService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouse_area")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class WarehouseAreaController {

    WarehouseAreaService warehouseAreaService;
    private final WarehouseAreaRepository warehouseAreaRepository;

    @PostMapping
    public ApiResponse<WarehouseArea> createWarehouseArea(@RequestBody @Valid WarehouseAreaRequest request) {
        ApiResponse<WarehouseArea> response = new ApiResponse<>();
        response.setResult(warehouseAreaService.createWarehouseArea(request));
        return response;
    }

    @GetMapping
    public List<WarehouseAreaResponse> getAllWarehouseAreas() {
        return warehouseAreaService.getAllWarehouseAreas();
    }

    @GetMapping("/{id}")
    public WarehouseArea getWarehouseAreaById(@PathVariable String id) {
        return warehouseAreaService.getWarehouseAreaById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteWarehouseArea(@PathVariable String id) {
        warehouseAreaService.deleteWarehouseAreaById(id);
        System.out.println("Successfully deleted warehouse area");
    }

    @PutMapping("/{id}")
    public WarehouseAreaResponse updateWarehouseArea(@PathVariable String id, @RequestBody WarehouseUpdateRequest request) {
        return warehouseAreaService.UpdateWarehouseAreaAttribute(id , request);
    }


////    @GetMapping("/debug")
////    public List<String> debug() {
////        List<WarehouseArea> list = warehouseAreaRepository.findAll();
////        for (WarehouseArea area : list) {
////            System.out.println("DEBUG name = " + area.getName());
////        }
////        return list.stream().map(WarehouseArea::getName).toList(); // chỉ in name
////    }
//



}
