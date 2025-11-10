package com.websales.controller;


import com.websales.dto.request.ColorRequest;
import com.websales.dto.response.ApiResponse;
import com.websales.dto.response.ColorResponse;
import com.websales.entity.Color;
import com.websales.service.ColorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/color")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ColorController {
    ColorService colorService;

    @PostMapping
    public ApiResponse<Color> createColor(@RequestBody @Valid ColorRequest request) {
        ApiResponse<Color> response = new ApiResponse<>();
        response.setResult(colorService.createColor(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<ColorResponse>> getAllColors() {
        ApiResponse<List<ColorResponse>> response = new ApiResponse<>();
        response.setResult(colorService.getAllColors());
        return response;
    }

    @DeleteMapping("/{colorId}")
    public ApiResponse<Void> deleteColor(@PathVariable Long colorId) {
        colorService.deleteColorById(colorId);
        return new ApiResponse<>(1005, "Successfully deleted Color", null);
    }

    @PutMapping("/{colorId}")
    public ApiResponse<ColorResponse> updateColor(@PathVariable @Valid Long colorId, @RequestBody @Valid ColorRequest request) {
        ApiResponse<ColorResponse> response = new ApiResponse<>();
        response.setResult(colorService.updateColor(colorId, request));
        return response;
    }
}