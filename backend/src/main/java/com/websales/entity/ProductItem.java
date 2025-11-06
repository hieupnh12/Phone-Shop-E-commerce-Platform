package com.websales.entity;

import com.websales.enums.ItemStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "ProductItem")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductItem {

    @Id
    @Column(name = "imei", length = 255)
    String imei;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProductVersion")
    ProductVersion version;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    ItemStatus status; // IN_STOCK / SOLD / RETURNED
}
