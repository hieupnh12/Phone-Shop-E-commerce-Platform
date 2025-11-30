# Hướng Dẫn Cài Đặt Triggers

## 📋 Tổng Quan

File `complete_triggers.sql` chứa **6 triggers** để tự động quản lý `stock_quantity` trong hệ thống:

1. **tr_product_items_after_insert** - Tăng stock khi thêm ProductItem IN_STOCK
2. **tr_product_items_after_update** - Xử lý thay đổi stock khi update ProductItem
3. **tr_product_items_after_delete** - Giảm stock khi xóa ProductItem IN_STOCK
4. **tr_product_versions_after_update** - Propagate thay đổi stock từ ProductVersion lên Product
5. **tr_product_versions_after_insert** - Tăng stock Product khi thêm ProductVersion
6. **tr_product_versions_before_delete** - Giảm stock Product khi xóa ProductVersion (ĐÃ SỬA)

## 🚀 Cách Cài Đặt

### Bước 1: Backup Database
```sql
-- Backup database trước khi chạy script
mysqldump -u username -p database_name > backup_before_triggers.sql
```

### Bước 2: Xóa Triggers Cũ (Nếu Có)
```sql
-- Kết nối MySQL và chạy:
DROP TRIGGER IF EXISTS `tr_product_items_after_insert`;
DROP TRIGGER IF EXISTS `tr_product_items_after_update`;
DROP TRIGGER IF EXISTS `tr_product_items_after_delete`;
DROP TRIGGER IF EXISTS `tr_product_versions_after_update`;
DROP TRIGGER IF EXISTS `tr_product_versions_after_insert`;
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;
```

### Bước 3: Chạy Script
```bash
# Cách 1: Sử dụng MySQL command line
mysql -u username -p database_name < complete_triggers.sql

# Cách 2: Copy và paste vào MySQL client (MySQL Workbench, phpMyAdmin, etc.)
# Mở file complete_triggers.sql và chạy toàn bộ
```

### Bước 4: Kiểm Tra Triggers Đã Tạo
```sql
-- Xem tất cả triggers
SHOW TRIGGERS FROM your_database_name;

-- Xem chi tiết một trigger
SHOW CREATE TRIGGER tr_product_items_after_insert;
```

## ✅ Kiểm Tra Hoạt Động

### Test Case 1: Thêm ProductItem IN_STOCK
```sql
-- Tạo ProductVersion với stock_quantity = 0
INSERT INTO product_versions (product_version_id, product_id, stock_quantity) 
VALUES ('TEST-V1', 1, 0);

-- Thêm ProductItem IN_STOCK
INSERT INTO product_items (imei, product_version_id, status, order_detail_id) 
VALUES ('IMEI-001', 'TEST-V1', 'IN_STOCK', NULL);

-- Kiểm tra: product_versions.stock_quantity phải = 1
SELECT stock_quantity FROM product_versions WHERE product_version_id = 'TEST-V1';
-- Kết quả mong đợi: 1
```

### Test Case 2: Xóa ProductItem IN_STOCK
```sql
-- Xóa ProductItem vừa tạo
DELETE FROM product_items WHERE imei = 'IMEI-001';

-- Kiểm tra: product_versions.stock_quantity phải = 0
SELECT stock_quantity FROM product_versions WHERE product_version_id = 'TEST-V1';
-- Kết quả mong đợi: 0
```

### Test Case 3: Xóa Product (Test Trigger Đã Sửa)
```sql
-- Tạo Product với stock_quantity = 100
INSERT INTO products (product_id, product_name, stock_quantity) 
VALUES (999, 'Test Product', 100);

-- Tạo ProductVersion với stock_quantity = 10
INSERT INTO product_versions (product_version_id, product_id, stock_quantity) 
VALUES ('TEST-V2', 999, 10);

-- Thêm 5 ProductItems IN_STOCK
INSERT INTO product_items (imei, product_version_id, status, order_detail_id) 
VALUES 
    ('IMEI-002', 'TEST-V2', 'IN_STOCK', NULL),
    ('IMEI-003', 'TEST-V2', 'IN_STOCK', NULL),
    ('IMEI-004', 'TEST-V2', 'IN_STOCK', NULL),
    ('IMEI-005', 'TEST-V2', 'IN_STOCK', NULL),
    ('IMEI-006', 'TEST-V2', 'IN_STOCK', NULL);

-- Kiểm tra stock trước khi xóa
SELECT stock_quantity FROM product_versions WHERE product_version_id = 'TEST-V2';
-- Kết quả: 15 (10 ban đầu + 5 items)

-- Xóa ProductItems (trigger sẽ giảm stock của ProductVersion)
DELETE FROM product_items WHERE product_version_id = 'TEST-V2';
-- Sau khi xóa: product_versions.stock_quantity = 10

-- Xóa ProductVersion (trigger sẽ lấy stock_quantity hiện tại = 10)
DELETE FROM product_versions WHERE product_version_id = 'TEST-V2';

-- Kiểm tra: products.stock_quantity phải = 90 (100 - 10)
SELECT stock_quantity FROM products WHERE product_id = 999;
-- Kết quả mong đợi: 90 (KHÔNG phải 85 như trước khi sửa)

-- Cleanup
DELETE FROM products WHERE product_id = 999;
```

## 🔧 Troubleshooting

### Lỗi: "Trigger already exists"
```sql
-- Xóa trigger cũ trước
DROP TRIGGER IF EXISTS `trigger_name`;
-- Sau đó chạy lại CREATE TRIGGER
```

### Lỗi: "Access denied"
```sql
-- Đảm bảo user có quyền CREATE TRIGGER
GRANT TRIGGER ON database_name.* TO 'username'@'localhost';
FLUSH PRIVILEGES;
```

### Kiểm tra Trigger Có Chạy Không
```sql
-- Bật general log (tạm thời)
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';

-- Thực hiện thao tác test
-- Sau đó xem log
SELECT * FROM mysql.general_log 
WHERE command_type = 'Query' 
ORDER BY event_time DESC 
LIMIT 20;
```

## 📝 Lưu Ý Quan Trọng

1. **Trigger đã được sửa:** `tr_product_versions_before_delete` sử dụng SELECT để lấy giá trị hiện tại thay vì OLD.stock_quantity
2. **Transaction Safety:** Tất cả triggers hoạt động trong transaction, đảm bảo tính nhất quán
3. **Performance:** Triggers có thể ảnh hưởng performance khi xử lý số lượng lớn. Cân nhắc batch operations
4. **Testing:** Luôn test kỹ trên môi trường dev trước khi deploy production

## 🔄 Rollback (Nếu Cần)

```sql
-- Xóa tất cả triggers
DROP TRIGGER IF EXISTS `tr_product_items_after_insert`;
DROP TRIGGER IF EXISTS `tr_product_items_after_update`;
DROP TRIGGER IF EXISTS `tr_product_items_after_delete`;
DROP TRIGGER IF EXISTS `tr_product_versions_after_update`;
DROP TRIGGER IF EXISTS `tr_product_versions_after_insert`;
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

-- Restore từ backup
mysql -u username -p database_name < backup_before_triggers.sql
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. MySQL version (yêu cầu >= 5.7)
2. User permissions
3. Table structure (đảm bảo các cột tồn tại)
4. Foreign key constraints

