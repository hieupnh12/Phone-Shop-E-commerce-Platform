package com.websales.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "operating_systems" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperatingSystem extends AuditableEntity {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       @Column(name ="operating_system_id")
       Long idOS;

       @Column(name="operating_system_name",unique=true)
       String nameOS;
//
//       @Column
//       boolean status;



}
