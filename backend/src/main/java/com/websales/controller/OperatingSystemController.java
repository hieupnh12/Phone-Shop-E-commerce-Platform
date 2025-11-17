package com.websales.controller;


import com.websales.dto.request.OperatingSystemRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.OperatingSystemResponse;
import com.websales.entity.OperatingSystem;
import com.websales.service.OperatingSystemService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/os")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class OperatingSystemController {
     OperatingSystemService operatingSystemService;


    @PostMapping
    public ApiResponse<OperatingSystem> createOs(@RequestBody OperatingSystemRequest request) {
        return ApiResponse.<OperatingSystem>builder()
                .result(operatingSystemService.createOs(request))
                .build();
    }


    @GetMapping
    public ApiResponse<List<OperatingSystemResponse>> getAllOs() {
        return ApiResponse.<List<OperatingSystemResponse>>builder()
                .result(operatingSystemService.getALLOS())
                .build();
    }


    @GetMapping("/{id}")
    public ApiResponse<OperatingSystem> getOs(@PathVariable Long id) {
        return ApiResponse.<OperatingSystem>builder()
                .result(operatingSystemService.getOs(id))
                .build();
    }


    @PatchMapping("/{id}")
    public ApiResponse<OperatingSystemResponse> updateOs(@PathVariable Long id, OperatingSystemRequest request) {
        return ApiResponse.<OperatingSystemResponse>builder()
                .result(operatingSystemService.UpdateOs(request,id))
                .build();
    }

}
