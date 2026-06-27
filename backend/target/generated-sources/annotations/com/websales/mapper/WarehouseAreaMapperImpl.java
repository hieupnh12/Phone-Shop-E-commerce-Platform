package com.websales.mapper;

import com.websales.dto.request.WarehouseAreaRequest;
import com.websales.dto.request.WarehouseUpdateRequest;
import com.websales.dto.response.WarehouseAreaResponse;
import com.websales.entity.WarehouseArea;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class WarehouseAreaMapperImpl implements WarehouseAreaMapper {

    @Override
    public WarehouseArea toWarehouseArea(WarehouseAreaRequest request) {
        if ( request == null ) {
            return null;
        }

        WarehouseArea.WarehouseAreaBuilder warehouseArea = WarehouseArea.builder();

        warehouseArea.nameWarehouseArea( request.getNameWarehouseArea() );
        warehouseArea.note( request.getNote() );
        warehouseArea.status( request.isStatus() );

        return warehouseArea.build();
    }

    @Override
    public WarehouseAreaResponse toWarehouseAreaResponse(WarehouseArea warehouseArea) {
        if ( warehouseArea == null ) {
            return null;
        }

        WarehouseAreaResponse.WarehouseAreaResponseBuilder warehouseAreaResponse = WarehouseAreaResponse.builder();

        warehouseAreaResponse.idWarehouseArea( warehouseArea.getIdWarehouseArea() );
        warehouseAreaResponse.nameWarehouseArea( warehouseArea.getNameWarehouseArea() );
        warehouseAreaResponse.note( warehouseArea.getNote() );

        return warehouseAreaResponse.build();
    }

    @Override
    public void updateWarehouseArea(WarehouseUpdateRequest warehouseUpdateRequest, WarehouseArea warehouseArea) {
        if ( warehouseUpdateRequest == null ) {
            return;
        }

        warehouseArea.setNote( warehouseUpdateRequest.getNote() );
        warehouseArea.setStatus( warehouseUpdateRequest.isStatus() );
    }
}
