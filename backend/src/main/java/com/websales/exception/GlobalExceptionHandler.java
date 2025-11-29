package com.websales.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.websales.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.Map;
import java.util.Objects;


@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {
    private static final String MIN_ATTRIBUTE = "min";
    private static final String MAX_ATTRIBUTE = "max";

//    @ExceptionHandler(value = Exception.class)
//    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception) {
//        ApiResponse apiResponse = new ApiResponse();
//        apiResponse.setCode(ErrorCode.UNCATEGORIZE_EXCEPTION.getCode());
//        apiResponse.setMessage(ErrorCode.UNCATEGORIZE_EXCEPTION.getMessage());
//        return ResponseEntity.badRequest().body(apiResponse);
//    }

    // 1. Xử lý AppException (ngoại lệ tự định nghĩa)
    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }


    // 4. Xử lý các RuntimeException chưa được phân loại
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntimeException(RuntimeException e) {
        log.error("Lỗi không xác định: ", e);
        ErrorCode errorCode = ErrorCode.UNCATEGORIZE_EXCEPTION;
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }



    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDenidedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }




    // Xử lý lỗi JSON mapping sai
    @ExceptionHandler(value = JsonMappingException.class)
    ResponseEntity<ApiResponse> handlingJsonMappingException(JsonMappingException ex) {
        ErrorCode errorCode = ErrorCode.JSON_MAPPING_ERROR;
        ApiResponse response =  ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();


        return ResponseEntity.status(errorCode.getStatusCode()).body(response);
    }






    // 2. Xử lý lỗi validation (Spring Validator)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(MethodArgumentNotValidException exception) {

        String enumkey = exception.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;
        try{
            errorCode = ErrorCode.valueOf(enumkey);
            var constraintViolations = exception.getBindingResult()
                    .getAllErrors()
                    .getFirst()
                    .unwrap(ConstraintViolation.class);

            attributes =  constraintViolations.getConstraintDescriptor().getAttributes();
            log.info(attributes.toString());
        } catch (IllegalArgumentException e) {

        }

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(attributes) ?
                mapAttribute(errorCode.getMessage(),attributes)
                : errorCode.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }





    private String mapAttribute(String message, Map<String,Object> attributes) {
        String minvalue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        String maxvalue = String.valueOf(attributes.get(MAX_ATTRIBUTE));
        return message
                    .replace("{"+ MIN_ATTRIBUTE +"}", minvalue)
                    .replace("{"+ MAX_ATTRIBUTE +"}", maxvalue);

    }





    // Xử lý Content-Type không hỗ trợ
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse> handleHttpMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        log.error("Unsupported Media Type Error: ", ex);

        ErrorCode errorCode = ErrorCode.FORM_ERROR;

        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message("Content-Type '" + (ex.getContentType() != null ? ex.getContentType() : "unknown") + "' is not supported. Supported types: " + ex.getSupportedMediaTypes())
                .build();

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }



    // Xử lý thiếu part trong multipart/form-data
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiResponse> handleMissingServletRequestPart(MissingServletRequestPartException ex) {
        ErrorCode errorCode = ErrorCode.MISSING_REQUEST_PART;
        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message("Missing required part: " + ex.getRequestPartName())
                .build();
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }




    // Xử lý lỗi truyền sai kiểu dữ liệu
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ErrorCode errorCode = ErrorCode.INVALID_PARAMETER_TYPE;
        String name = ex.getName();
        String type = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String value = ex.getValue() != null ? ex.getValue().toString() : "null";

        String message = String.format("Parameter '%s' should be of type '%s' but got '%s'.", name, type, value);

        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .build();
        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }




// Xử lý lỗi truyền sai kiểu dữ liệu trong request (ví dụ: sai kiểu số, boolean, v.v.)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        ErrorCode errorCode = ErrorCode.INVALID_JSON_FORMAT;

        String message = ex.getMessage();

        // Check lỗi encoding UTF-8
        if (message != null && message.contains("Invalid UTF-8")) {
            message = "Invalid encoding: The request body is not properly encoded in UTF-8 or the data is not valid JSON.";
        } else {
            message = "Malformed JSON request: " + ex.getMostSpecificCause().getMessage();
        }

        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .build();

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }


}
