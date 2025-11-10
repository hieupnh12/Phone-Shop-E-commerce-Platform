package com.websales.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "origins" )
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Origin {
      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      @Column(name ="origin_id")
      Long idOrigin;

      @Column(name ="origin_name")
      String nameOrigin;

      @Column
      boolean status;



}
