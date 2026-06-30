package  com.websales.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL) // cai nao trong json null thi khong hien
public class ApiResponse<T>{
    @Builder.Default
    int code = 1000;
    String message;
    T result;


}