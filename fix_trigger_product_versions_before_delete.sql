-- =====================================================
-- SỬA TRIGGER: tr_product_versions_before_delete
-- Vấn đề: Trigger dùng OLD.stock_quantity (giá trị cũ) 
--         thay vì giá trị hiện tại sau khi trigger product_items đã cập nhật
-- Giải pháp: SELECT giá trị stock_quantity hiện tại từ database
-- =====================================================

-- Xóa trigger cũ
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

DELIMITER $$

-- Tạo trigger mới với logic đúng
CREATE TRIGGER `tr_product_versions_before_delete` 
BEFORE DELETE ON `product_versions` 
FOR EACH ROW 
BEGIN
    DECLARE current_stock INT DEFAULT 0;
    
    -- Lấy stock_quantity hiện tại từ database 
    -- (đã được cập nhật bởi trigger tr_product_items_after_delete nếu có)
    SELECT COALESCE(stock_quantity, 0) INTO current_stock 
    FROM product_versions 
    WHERE product_version_id = OLD.product_version_id;
    
    -- Cập nhật stock_quantity của products
    UPDATE products 
    SET stock_quantity = stock_quantity - current_stock 
    WHERE product_id = OLD.product_id;
END$$

DELIMITER ;

-- =====================================================
-- KIỂM TRA TRIGGER
-- =====================================================
-- Sau khi chạy script này, test với scenario:
-- 1. Tạo Product với stock_quantity = 100
-- 2. Tạo ProductVersion với stock_quantity = 10
-- 3. Tạo 5 ProductItems với status = 'IN_STOCK' và order_detail_id IS NULL
-- 4. Xóa Product
-- 5. Kiểm tra: Product.stock_quantity cuối cùng phải = 90 (100 - 10)
--    Không phải 95 (100 - 5) như trước khi sửa

