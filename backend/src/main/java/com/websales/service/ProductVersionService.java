package com.websales.service;



import com.websales.mapper.ProductVersionMapper;
import com.websales.repository.ProductVersionRepository;
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
public class ProductVersionService {
      ProductVersionRepository pvr;
      ProductVersionMapper pvm;


      RamService ramservice;
      RomService romservice;
      ColorService colorservice;
      ProductService productservice;
//    private final ProductService productService;
//
////      public ProductVersionResponse  CreateProductVersion(Long id,ProductVersionRequest request) {
////
////          Product product = productservice.getProductById(id);
////          if(product == null) {
////              throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
////          }
////          Ram ram = ramservice.getRamById(request.getRamId());
////          Rom rom = romservice.getRomById(request.getRomId());
////          Color color = colorservice.getColorById(request.getColorId());
////
////          ProductVersion productVersion = pvm.ToProducVersionMakeName(request, ram, rom, color,product);
////
////          pvr.save(productVersion);
////          return pvm.ToProductVersionResponse(productVersion);
////
////      }
//
//    public ProductVersionResponse  CreateProductVersion(ProductVersionRequest request) {
//
//        Product product = productservice.getProductById(request.getProductId());
//        if(product == null) {
//            throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
//        }
//        Ram ram = ramservice.getRamById(request.getRamId());
//        Rom rom = romservice.getRomById(request.getRomId());
//        Color color = colorservice.getColorById(request.getColorId());
//
//        ProductVersion productVersion = pvm.ToProducVersionMakeName(request, ram, rom, color,product);
//
////        // Cập nhật stock_quantity của Product
////        productService.updateProductStockQuantity(request.getProductId());
//
//        pvr.save(productVersion);
//        return pvm.ToProductVersionResponse(productVersion);
//
//    }
//
//
//    public List<ProductVersionResponse> listAll() {
//        return pvr.findAll()
//                .stream()
//                .map(pvm::ToProductVersionResponse)
//                .collect(Collectors.toList());
//    }
//
//
//
//    public List<ProductVersionResponse> ListProductVersion(Product product) {
//        long start = System.nanoTime();
//        List<ProductVersion> pr = pvr.findByProduct(product);
//        long end = System.nanoTime();
//        log.info("findByProduct took {} ms for productId={}", (end - start) / 1_000_000, product.getProductId());
//        return pr.stream()
//                .map(pvm::ToProductVersionResponse)
//                .collect(Collectors.toList());
//    }
//
//
//
//       public ProductVersion GetProductVersionById(String id) {
//           return pvr.findById(id).orElseThrow(()-> new RuntimeException("not found id Product Version"));
//       }
//
//
//       public ProductVersionResponse UpdateProductVersion(ProductVersionRequest request, String id) {
//           ProductVersion pr = GetProductVersionById(id);
//
//           Product product = productservice.getProductById(request.getProductId());
//           if(product == null) {
//               throw new AppException(ErrorCode.PRODUCT_NOT_EXIST);
//           }
//           Ram ram = ramservice.getRamById(request.getRamId());
//           Rom rom = romservice.getRomById(request.getRomId());
//           Color color = colorservice.getColorById(request.getColorId());
//
//           ProductVersion productVersion = pvm.ToUpdateProductVersion(request,pr,ram,rom,color,product);
//
//           // Cập nhật stock_quantity của Product
//           productService.updateProductStockQuantity(request.getProductId());
//
//           pvr.save(productVersion);
//           return pvm.ToProductVersionResponse(productVersion);
//       }
//
//
//       public void DeleteProductVersion(String id) {
//          pvr.deleteById(id);
//       }
//
//
//
//       // cac method khong phai la CRUD
//
//
//


}
