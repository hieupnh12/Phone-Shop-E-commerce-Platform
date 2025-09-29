package com.websales.service;


import com.websales.mapper.ColorMapper;
import com.websales.repository.ColorRepository;
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
public class ColorService {
    ColorRepository colorRepo;
    ColorMapper colorMapper;

//    public Color createColor(ColorRequest request) {
//        Color color = Color.builder()
//                .name(request.getName())
//                .status(request.getStatus())
//                .build();
//        return colorRepo.save(color);
//    }
//
//    public List<ColorResponse> getAllColors() {
//        List<Color> colors = colorRepo.findAll();
//        return colors.stream()
//                .map(colorMapper::toColorResponse)
//                .collect(Collectors.toList());
//    }
//
//    public Color getColorById(Long id) {
//        return colorRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Color not found"));
//    }
//
//    public void deleteColorById(Long id) {
//        colorRepo.deleteById(id);
//    }
//
//    public ColorResponse updateColor(Long id, ColorRequest request) {
//        Color color = colorRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Color not found"));
//        color.setName(request.getName());
//        color.setStatus(request.getStatus());
//        return colorMapper.toColorResponse(colorRepo.save(color));
//    }
}