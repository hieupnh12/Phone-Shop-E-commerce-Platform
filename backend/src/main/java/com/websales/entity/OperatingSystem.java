package com.websales.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "OperatingSystem" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperatingSystem {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       @Column(name ="idOperatingSystem")
       Long id;

       @Column(name="nameOperatingSystem")
       String name;

//       @Column(name="status")
//       boolean status;
//


}
