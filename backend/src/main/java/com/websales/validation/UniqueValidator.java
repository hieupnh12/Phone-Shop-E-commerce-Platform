package com.websales.validation;


import com.websales.exception.AppException;
import com.websales.exception.ErrorCode;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

@Component
public class UniqueValidator implements ConstraintValidator<UniqueName, Object> {

     Class<?> entityClass;     //Lưu class Entity được truyền từ annotation.
     String fieldName;        //Tên thuộc tính (field) trong entity cần kiểm tra.

    @PersistenceContext
    EntityManager entityManager;     //Công cụ truy vấn dữ liệu từ DB trong JPA (tương đương @Autowired repository nhưng linh hoạt hơn).

    @Override
    public void initialize(UniqueName constraintAnnotation) {
        this.entityClass = constraintAnnotation.entity();
        this.fieldName = constraintAnnotation.fieldName();
    }

    @Override
    public boolean isValid(Object fieldValue, ConstraintValidatorContext context) {
        if (fieldValue == null) return true;

        String jpql = "SELECT COUNT(e) FROM " + entityClass.getSimpleName() + " e WHERE e." + fieldName + " = :value";
        Long count = entityManager.createQuery(jpql, Long.class)
                .setParameter("value", fieldValue)
                .getSingleResult();
        if(count > 0){
            throw new AppException(ErrorCode.NAME_ALREADY_EXIST);
        }


        return true;
    }

}
