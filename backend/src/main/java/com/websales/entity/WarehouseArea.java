package com.websales.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "WarehouseArea" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idArea")
    Long id;


    @Column(name ="nameArea")
    String name;

    @Column(name ="note")
    String note;

    @Column(name ="status")
    boolean  status;

}
