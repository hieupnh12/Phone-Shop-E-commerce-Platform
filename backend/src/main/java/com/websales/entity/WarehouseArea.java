package com.websales.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "warehouse_areas" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseArea {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "area_id")
    String idWarehouseArea;


    @Column(name = "area_name")
    String nameWarehouseArea;

    @Column(name = "note")
    String note;

    @Column(name = "status")
    boolean status;

}

