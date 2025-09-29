package com.websales.service;


import com.websales.mapper.OriginMapper;
import com.websales.repository.OriginRepository;
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
public class OriginService {

    OriginRepository originRepo;
    OriginMapper originMapper;

//    public Origin createOrigin(OriginRequest request) {
//        Origin origin = Origin.builder()
//                .name(request.getName())
//                .status(request.isStatus())
//                .build();
//
//        return originRepo.save(origin);
//    }
//
//    public List<OriginResponse> getAllOrigins() {
//        return originRepo.findAll()
//                .stream()
//                .map(originMapper::toOriginResponse)
//                .collect(Collectors.toList());
//    }
//
//    public Origin getOriginById(Long id) {
//        return originRepo.findById(id).orElseThrow(() -> new RuntimeException("Origin not found"));
//    }
//
//    public void deleteOriginById(Long id) {
//        originRepo.deleteById(id);
//    }
//
//    public OriginResponse updateOrigin(Long id, OriginRequest request) {
//        Origin origin = originRepo.findById(id).orElse(null);
//        origin = originMapper.toOrigin(request);
//        origin.setId(id); // giữ lại id cũ
//
//        return originMapper.toOriginResponse(originRepo.save(origin));
//    }
}
