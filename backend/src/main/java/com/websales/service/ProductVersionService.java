package com.websales.service;

import com.websales.dto.request.ProductVersionRequest;
import com.websales.dto.request.ProductVersionUpdateRequest;
import com.websales.dto.response.ProductVersionResponse;
import com.websales.entity.*;
import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import com.websales.mapper.ProductVersionMapper;
import com.websales.repository.ProductVersionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor  // thay cho autowrid

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) //bo private final
@Slf4j
public class ProductVersionService {

    ProductVersionRepository pvr;
    ProductVersionMapper pvm;


    RamService ramservice;
    RomService romservice;
    ColorService colorservice;
    ProductService productservice;
    private final ProductService productService;
//   ProductService productService;




       public ProductVersionResponse UpdateProductVersion(ProductVersionUpdateRequest request, String id) {
           ProductVersion pr = pvr.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_VERSION_NOT_FOUND));

           Ram ram = ramservice.getRamById(request.getIdRam());
           Rom rom = romservice.getRomById(request.getIdRom());
           Color color = colorservice.getColorById(request.getIdColor());

           ProductVersion productVersion = pvm.ToUpdateProductVersion(request,pr,ram,rom,color);

           pvr.save(productVersion);
           return pvm.ToProductVersionResponse(productVersion);
       }

//       // cac method khong phai la CRUD
//
//
//

}
