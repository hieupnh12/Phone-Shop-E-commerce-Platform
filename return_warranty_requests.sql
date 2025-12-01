CREATE TABLE return_warranty_requests (
    `request_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `employee_id` BIGINT UNSIGNED NOT NULL,
    `product_version_id` VARCHAR(255) NOT NULL,
    `type` ENUM('warranty', 'exchange') NOT NULL COMMENT 'Loại yêu cầu: bảo hành hoặc đổi trả',
    `reason` TEXT COMMENT 'Lý do gửi yêu cầu',
    `status` ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed') DEFAULT 'pending' COMMENT 'Trạng thái xử lý',
    `admin_note` TEXT COMMENT 'Ghi chú của admin',
    `appointment_date` DATETIME COMMENT 'Ngày hẹn khách lên cửa hàng hoặc bảo hành',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_request_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_request_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_request_product` FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`product_version_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_employee_id` (`employee_id`),
    INDEX `idx_product_version_id` (`product_version_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu các yêu cầu bảo hành và đổi trả';



