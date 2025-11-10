package com.websales.service;



import com.websales.dto.request.OperatingSystemRequest;
import com.websales.dto.response.OperatingSystemResponse;
import com.websales.entity.OperatingSystem;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
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


    public OperatingSystem createOs(OperatingSystemRequest request) {
        OperatingSystem os= osMapper.ToOperatingSystem(request);
        return osRepo.save(os);
    }


    public List<OperatingSystemResponse> getALLOS(){
        List<OperatingSystem> list = osRepo.findAll();
        return list.stream()
                .map(osMapper::toOperatingSystemResponse)
                .collect(Collectors.toList());
    }


    public OperatingSystem  getOs(long id ){
        return osRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.OPERATING_SYSTEM_NOT_FOUND));
    }


    public OperatingSystemResponse UpdateOs(OperatingSystemRequest request, Long id ) {
        OperatingSystem os= getOs(id);
        osMapper.updateOperatingSystem(request,os);

        return osMapper.toOperatingSystemResponse(osRepo.save(os));

    }






//    public OperatingSystemResponse updateOS(Long id, OperatingSystemRequest request) {
//        OperatingSystem os = osRepo.findById(id).orElse(null);
//        os = osMapper.ToOperatingSystem(request);
//        os.setId(id); // đảm bảo giữ lại id cũ
//
//        return osMapper.toOperatingSystemResponse(osRepo.save(os));
//    }
}
