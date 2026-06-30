package com.websales.entity;

import com.websales.configuration.AuditLogListener;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;


@MappedSuperclass
@EntityListeners(AuditLogListener.class)
public abstract class AuditableEntity {
}

