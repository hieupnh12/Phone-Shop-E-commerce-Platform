package com.websales.service;



import com.websales.mapper.OperatingSystemMapper;
import com.websales.repository.OperatingSystemRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor  // thay cho autowrid
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class OperatingSystemService {
    OperatingSystemRepository osRepo;
    OperatingSystemMapper osMapper;
//
//    public OperatingSystem createOS(OperatingSystemRequest request) {
//        OperatingSystem os = OperatingSystem.builder()
//                .name(request.getName())
//                .status(request.isStatus())
//                .build();
//
//        return osRepo.save(os);
//    }
//
//    public List<OperatingSystemResponse> getAllOS() {
//        return osRepo.findAll()
//                .stream()
//                .map(osMapper::toOperatingSystemResponse)
//                .collect(Collectors.toList());
//    }
//
//    public OperatingSystem getOSById(Long id) {
//        return osRepo.findById(id).orElseThrow(() -> new RuntimeException("Operating System not found"));
//    }
//
//    public void deleteOSById(Long id) {
//        osRepo.deleteById(id);
//    }
//
//    public OperatingSystemResponse updateOS(Long id, OperatingSystemRequest request) {
//        OperatingSystem os = osRepo.findById(id).orElse(null);
//        os = osMapper.ToOperatingSystem(request);
//        os.setId(id); // đảm bảo giữ lại id cũ
//
//        return osMapper.toOperatingSystemResponse(osRepo.save(os));
//    }
}
