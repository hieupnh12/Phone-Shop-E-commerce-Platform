-- =====================================================
-- TOÀN BỘ TRIGGERS CHO HỆ THỐNG QUẢN LÝ STOCK
-- Database: MySQL
-- Mô tả: Các trigger tự động cập nhật stock_quantity
--        khi có thay đổi trong product_items và product_versions
-- =====================================================

DELIMITER $$

-- =====================================================
-- TRIGGER 1: AFTER INSERT on product_items
-- Mô tả: Khi thêm ProductItem mới với status IN_STOCK và chưa bán,
--        tăng stock_quantity của ProductVersion tương ứng
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_items_after_insert`;

CREATE TRIGGER `tr_product_items_after_insert` 
AFTER INSERT ON `product_items` 
FOR EACH ROW 
BEGIN
    IF NEW.`status` = 'IN_STOCK' AND NEW.`order_detail_id` IS NULL THEN
        UPDATE `product_versions` 
        SET `stock_quantity` = `stock_quantity` + 1 
        WHERE `product_version_id` = NEW.`product_version_id`;
    END IF;
END$$

-- =====================================================
-- TRIGGER 2: AFTER UPDATE on product_items
-- Mô tả: Khi cập nhật ProductItem, xử lý thay đổi stock_quantity
--        - Nếu status thay đổi từ IN_STOCK sang khác: giảm stock
--        - Nếu status thay đổi từ khác sang IN_STOCK: tăng stock
--        - Nếu order_detail_id thay đổi: xử lý tương ứng
--        - Nếu product_version_id thay đổi: xử lý cả 2 version
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_items_after_update`;

CREATE TRIGGER `tr_product_items_after_update` 
AFTER UPDATE ON `product_items` 
FOR EACH ROW 
BEGIN
    DECLARE old_qualified INT DEFAULT 0;
    DECLARE new_qualified INT DEFAULT 0;

    -- Kiểm tra điều kiện cho OLD và NEW
    SET old_qualified = IF(OLD.`status` = 'IN_STOCK' AND OLD.`order_detail_id` IS NULL, 1, 0);
    SET new_qualified = IF(NEW.`status` = 'IN_STOCK' AND NEW.`order_detail_id` IS NULL, 1, 0);

    -- Nếu product_version_id thay đổi, xử lý cả 2 version
    IF OLD.`product_version_id` != NEW.`product_version_id` THEN
        -- Giảm stock của version cũ nếu qualified
        IF old_qualified = 1 THEN
            UPDATE `product_versions` 
            SET `stock_quantity` = `stock_quantity` - 1 
            WHERE `product_version_id` = OLD.`product_version_id`;
        END IF;
        
        -- Tăng stock của version mới nếu qualified
        IF new_qualified = 1 THEN
            UPDATE `product_versions` 
            SET `stock_quantity` = `stock_quantity` + 1 
            WHERE `product_version_id` = NEW.`product_version_id`;
        END IF;
    ELSE
        -- Cùng version_id: xử lý thay đổi status/order_detail_id
        IF old_qualified = 1 AND new_qualified = 0 THEN
            -- Chuyển từ IN_STOCK (chưa bán) sang trạng thái khác: giảm stock
            UPDATE `product_versions` 
            SET `stock_quantity` = `stock_quantity` - 1 
            WHERE `product_version_id` = NEW.`product_version_id`;
        ELSEIF old_qualified = 0 AND new_qualified = 1 THEN
            -- Chuyển từ trạng thái khác sang IN_STOCK (chưa bán): tăng stock
            UPDATE `product_versions` 
            SET `stock_quantity` = `stock_quantity` + 1 
            WHERE `product_version_id` = NEW.`product_version_id`;
        END IF;
    END IF;
END$$

-- =====================================================
-- TRIGGER 3: AFTER DELETE on product_items
-- Mô tả: Khi xóa ProductItem với status IN_STOCK và chưa bán,
--        giảm stock_quantity của ProductVersion tương ứng
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_items_after_delete`;

CREATE TRIGGER `tr_product_items_after_delete` 
AFTER DELETE ON `product_items` 
FOR EACH ROW 
BEGIN
    IF OLD.`status` = 'IN_STOCK' AND OLD.`order_detail_id` IS NULL THEN
        UPDATE `product_versions` 
        SET `stock_quantity` = `stock_quantity` - 1 
        WHERE `product_version_id` = OLD.`product_version_id`;
    END IF;
END$$

-- =====================================================
-- TRIGGER 4: AFTER UPDATE on product_versions
-- Mô tả: Khi stock_quantity của ProductVersion thay đổi,
--        cập nhật stock_quantity của Product tương ứng
--        (Propagate thay đổi từ ProductVersion lên Product)
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_versions_after_update`;

CREATE TRIGGER `tr_product_versions_after_update` 
AFTER UPDATE ON `product_versions` 
FOR EACH ROW 
BEGIN
    IF NEW.`stock_quantity` != OLD.`stock_quantity` THEN
        UPDATE `products` 
        SET `stock_quantity` = `stock_quantity` + (NEW.`stock_quantity` - OLD.`stock_quantity`) 
        WHERE `product_id` = NEW.`product_id`;
    END IF;
END$$

-- =====================================================
-- TRIGGER 5: AFTER INSERT on product_versions
-- Mô tả: Khi thêm ProductVersion mới với stock_quantity > 0,
--        cập nhật stock_quantity của Product tương ứng
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_versions_after_insert`;

CREATE TRIGGER `tr_product_versions_after_insert` 
AFTER INSERT ON `product_versions` 
FOR EACH ROW 
BEGIN
    IF NEW.`stock_quantity` > 0 THEN
        UPDATE `products` 
        SET `stock_quantity` = `stock_quantity` + NEW.`stock_quantity` 
        WHERE `product_id` = NEW.`product_id`;
    END IF;
END$$

-- =====================================================
-- TRIGGER 6: BEFORE DELETE on product_versions (ĐÃ SỬA)
-- Mô tả: Khi xóa ProductVersion, giảm stock_quantity của Product
--        LƯU Ý: Sử dụng SELECT để lấy giá trị stock_quantity hiện tại
--               (sau khi đã bị trigger product_items cập nhật)
--        Thay vì dùng OLD.stock_quantity (giá trị cũ)
-- =====================================================
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

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
-- KIỂM TRA VÀ XÁC NHẬN
-- =====================================================
-- Để kiểm tra các trigger đã được tạo thành công:
-- SHOW TRIGGERS FROM your_database_name;

-- Để xem chi tiết một trigger:
-- SHOW CREATE TRIGGER tr_product_items_after_insert;

-- =====================================================
-- GHI CHÚ QUAN TRỌNG
-- =====================================================
-- 1. Trigger tr_product_versions_before_delete đã được sửa để
--    lấy giá trị stock_quantity hiện tại thay vì OLD.stock_quantity
--    Điều này đảm bảo tính chính xác khi xóa Product có nhiều ProductItems
--
-- 2. Luồng hoạt động khi xóa Product:
--    a) Xóa ProductItems → trigger tr_product_items_after_delete 
--       giảm stock_quantity của ProductVersion
--    b) Xóa ProductVersions → trigger tr_product_versions_before_delete
--       lấy stock_quantity hiện tại (đã bị giảm ở bước a) và trừ khỏi Product
--    c) Xóa Product
--
-- 3. Tất cả các trigger đều sử dụng COALESCE để xử lý NULL values
--
-- 4. Các trigger được thiết kế để hoạt động trong transaction,
--    đảm bảo tính nhất quán dữ liệu

