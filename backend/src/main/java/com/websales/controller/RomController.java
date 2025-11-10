package com.websales.controller;


import com.websales.dto.request.RomRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.RomResponse;
import com.websales.entity.Rom;
import com.websales.service.RomService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rom")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RomController {
    RomService romService;

    @PostMapping
    public ApiResponse<Rom> createRom(@RequestBody @Valid RomRequest request) {
        ApiResponse<Rom> response = new ApiResponse<>();
        response.setResult(romService.createRom(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<RomResponse>> getAllRoms() {
        ApiResponse<List<RomResponse>> response = new ApiResponse<>();
        response.setResult(romService.getAllRoms());
        return response;
    }

    @DeleteMapping("/{romId}")
    public ApiResponse<Void> deleteRom(@PathVariable Long romId) {
        romService.deleteRomById(romId);
        return new ApiResponse<>(1005, "Successfully deleted Rom", null);
    }

    @PutMapping("/{romId}")
    public ApiResponse<RomResponse> updateRom(@PathVariable @Valid Long romId, @RequestBody @Valid RomRequest request) {
        ApiResponse<RomResponse> response = new ApiResponse<>();
        response.setResult(romService.updateRom(romId, request));
        return response;
    }
}