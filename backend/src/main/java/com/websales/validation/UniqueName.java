package com.websales.validation;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;


@Documented   //Giúp annotation này xuất hiện trong tài liệu Javadoc.
@Constraint(validatedBy = UniqueValidator.class)    //Cho biết đây là một annotation kiểm tra hợp lệ và validator xử lý là UniqueValidator.
@Target({ ElementType.FIELD })     //Chỉ dùng annotation này cho field (biến) trong class.
@Retention(RetentionPolicy.RUNTIME)   //Annotation sẽ được giữ lại ở runtime để có thể kiểm tra được.
public @interface UniqueName {

    String message() default "Name is already taken!";

    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};


    Class<?> entity();       // Entity class để kiểm tra
    String fieldName();      // Tên thuộc tính trong entity để so sánh
}
