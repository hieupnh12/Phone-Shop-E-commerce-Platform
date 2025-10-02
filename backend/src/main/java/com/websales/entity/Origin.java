package com.websales.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Origin" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Origin {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      @Column(name ="idOrigin")
      Long id;

      @Column(name ="nameOrigin")
      String name;

//      @Column(name ="status")
//      boolean status;



}
