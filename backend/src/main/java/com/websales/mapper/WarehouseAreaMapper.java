    package com.websales.mapper;


    import com.websales.dto.request.WarehouseAreaRequest;
    import com.websales.dto.request.WarehouseUpdateRequest;
    import com.websales.dto.response.WarehouseAreaResponse;
    import com.websales.entity.WarehouseArea;
    import org.mapstruct.Mapper;
    import org.mapstruct.MappingTarget;

    @Mapper(componentModel = "spring")
    public interface WarehouseAreaMapper {
        WarehouseArea toWarehouseArea(WarehouseAreaRequest request);

        WarehouseAreaResponse toWarehouseAreaResponse(WarehouseArea warehouseArea);
        void updateWarehouseArea(WarehouseUpdateRequest warehouseUpdateRequest, @MappingTarget WarehouseArea warehouseArea);
    }
