package com.websales.service;


import com.websales.mapper.RamMapper;
import com.websales.repository.RamRepository;
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
public class RamService {
    RamRepository ramRepo;
    RamMapper ramMapper;

//    public Ram createRam(RamRequest request) {
//        Ram ram = Ram.builder()
//                .name(request.getName())
//                .status(request.getStatus())
//                .build();
//        return ramRepo.save(ram);
//    }
//
//    public List<RamResponse> getAllRams() {
//        List<Ram> rams = ramRepo.findAll();
//        return rams.stream()
//                .map(ramMapper::toRamResponse)
//                .collect(Collectors.toList());
//    }
//
//    public Ram getRamById(Long id) {
//        return ramRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Ram not found"));
//    }
//
//    public void deleteRamById(Long id) {
//        ramRepo.deleteById(id);
//    }
//
//    public RamResponse updateRam(Long id, RamRequest request) {
//        Ram ram = ramRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Ram not found"));
//        ram.setName(request.getName());
//        ram.setStatus(request.getStatus());
//        return ramMapper.toRamResponse(ramRepo.save(ram));
//    }
}