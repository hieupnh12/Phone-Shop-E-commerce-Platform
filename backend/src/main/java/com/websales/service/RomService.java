package com.websales.service;


import com.websales.dto.request.RomRequest;
import com.websales.dto.response.RomResponse;
import com.websales.entity.Rom;
import com.websales.mapper.RomMapper;
import com.websales.repository.RomRepository;
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
public class RomService {
    RomRepository romRepo;
    RomMapper romMapper;

    public Rom createRom(RomRequest request) {
        Rom rom = Rom.builder()
                .nameRom(request.getNameRom())
//                .status(request.getStatus())
                .build();
        return romRepo.save(rom);
    }

    public List<RomResponse> getAllRoms() {
        List<Rom> roms = romRepo.findAll();
        return roms.stream()
                .map(romMapper::toRomResponse)
                .collect(Collectors.toList());
    }

    public Rom getRomById(Long id) {
        return romRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rom not found"));
    }

    public void deleteRomById(Long id) {
        romRepo.deleteById(id);
    }

    public RomResponse updateRom(Long id, RomRequest request) {
        Rom rom = romRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rom not found"));
        romMapper.updateRomFromRequest(request, rom);
        return romMapper.toRomResponse(romRepo.save(rom));
    }
}