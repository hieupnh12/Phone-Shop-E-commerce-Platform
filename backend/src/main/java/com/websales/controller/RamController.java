package com.websales.controller;


import com.websales.service.RamService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ram")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RamController {
    RamService ramService;

//    @PostMapping
//    public ApiResponse<Ram> createRam(@RequestBody @Valid RamRequest request) {
//        ApiResponse<Ram> response = new ApiResponse<>();
//        response.setResult(ramService.createRam(request));
//        return response;
//    }
//
//    @GetMapping
//    public ApiResponse<List<RamResponse>> getAllRams() {
//        ApiResponse<List<RamResponse>> response = new ApiResponse<>();
//        response.setResult(ramService.getAllRams());
//        return response;
//    }
//
//    @DeleteMapping("/{ramId}")
//    public ApiResponse<Void> deleteRam(@PathVariable Long ramId) {
//        ramService.deleteRamById(ramId);
//      return new ApiResponse<>(1005,"successfully deleted Ram ",null);
//     }
//
//    @PutMapping("/{ramId}")
//    public ApiResponse<RamResponse> updateRam(@PathVariable @Valid Long ramId, @RequestBody RamRequest request) {
//        ApiResponse<RamResponse> response = new ApiResponse<>();
//        response.setResult(ramService.updateRam(ramId, request));
//        return response;
//    }
}