# Phân tích Trigger và Hàm Xóa Sản Phẩm

## Tóm tắt

### Hàm `deleteProduct` trong ProductService.java:
```java
@Transactional
public void deleteProduct(Long productId) {
    // 1. Kiểm tra có ProductItem đã bán không
    if (productRepository.hasOrderDetails(productId)) {
        throw new IllegalStateException("Không thể xóa sản phẩm...");
    }
    // 2. Xóa tất cả ProductItems
    productRepository.deleteSafeProductItems(productId);
    // 3. Xóa tất cả ProductVersions
    productRepository.deleteSafeProductVersions(productId);
    // 4. Xóa Product
    productRepository.deleteProductById(productId);
}
```

## Phân tích Luồng Xóa và Trigger

### Bước 1: Xóa ProductItems
**Query:** `DELETE FROM ProductItem WHERE versionId IN (SELECT idVersion FROM ProductVersion WHERE product.idProduct = :productId)`

**Trigger chạy:** `tr_product_items_after_delete`
- Điều kiện: `status = 'IN_STOCK' AND order_detail_id IS NULL`
- Hành động: Giảm `stock_quantity` của `product_versions`

**Phân tích:**
- ✅ Hàm đã check `hasOrderDetails()` nên chỉ xóa ProductItems không có orderDetail
- ✅ Trigger chỉ giảm stock cho ProductItems có `status = 'IN_STOCK'` và `order_detail_id IS NULL`
- ✅ Logic này **ĐÚNG** - chỉ giảm stock cho items thực sự đang trong kho

### Bước 2: Xóa ProductVersions
**Query:** `DELETE FROM ProductVersion WHERE product.idProduct = :productId`

**Trigger chạy:** `tr_product_versions_before_delete`
- Hành động: Giảm `stock_quantity` của `products` bằng cách trừ đi `OLD.stock_quantity`

**⚠️ VẤN ĐỀ TIỀM ẨN:**

Khi xóa ProductVersions, trigger sử dụng `OLD.stock_quantity` - đây là giá trị **TRƯỚC KHI** trigger ở bước 1 chạy.

**Ví dụ:**
1. ProductVersion có `stock_quantity = 10` (ban đầu)
2. Có 5 ProductItems với `status = 'IN_STOCK'` và `order_detail_id IS NULL`
3. Bước 1: Xóa ProductItems → Trigger giảm `stock_quantity` của ProductVersion từ 10 xuống 5
4. Bước 2: Xóa ProductVersion → Trigger giảm `stock_quantity` của Product bằng cách trừ đi `OLD.stock_quantity = 10` (giá trị cũ, không phải 5)

**Kết quả:** Product.stock_quantity bị giảm quá nhiều!

## Vấn đề Cụ thể

### Vấn đề 1: Double Counting
- ProductVersion.stock_quantity đã bị giảm bởi trigger `tr_product_items_after_delete`
- Nhưng trigger `tr_product_versions_before_delete` vẫn dùng giá trị cũ `OLD.stock_quantity`
- → Product.stock_quantity bị giảm sai

### Vấn đề 2: Thứ tự Trigger
- Trigger `tr_product_items_after_delete` chạy SAU khi xóa ProductItems
- Trigger `tr_product_versions_before_delete` chạy TRƯỚC khi xóa ProductVersions
- Nhưng trong cùng một transaction, thứ tự này có thể gây ra vấn đề

## Giải pháp Đề xuất (MySQL)

### ⚠️ Lưu ý: Trong MySQL trigger BEFORE DELETE
- `OLD.stock_quantity` là giá trị **tại thời điểm trigger được kích hoạt**
- Nếu trigger `tr_product_items_after_delete` đã cập nhật `stock_quantity` trước đó, `OLD.stock_quantity` vẫn là giá trị **CŨ** (chưa được cập nhật)
- Cần SELECT để lấy giá trị **hiện tại** từ database

### Giải pháp 1: Sửa Trigger `tr_product_versions_before_delete` (MySQL)
Lấy giá trị stock_quantity hiện tại từ database:

```sql
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

DELIMITER $$

CREATE TRIGGER `tr_product_versions_before_delete` 
BEFORE DELETE ON `product_versions` 
FOR EACH ROW 
BEGIN
    -- Lấy stock_quantity hiện tại từ database (sau khi đã bị trigger product_items cập nhật)
    DECLARE current_stock INT DEFAULT 0;
    
    SELECT COALESCE(stock_quantity, 0) INTO current_stock 
    FROM product_versions 
    WHERE product_version_id = OLD.product_version_id;
    
    -- Cập nhật stock_quantity của products
    UPDATE products 
    SET stock_quantity = stock_quantity - current_stock 
    WHERE product_id = OLD.product_id;
END$$

DELIMITER ;
```

### Giải pháp 2: Bỏ qua cập nhật stock khi xóa Product (MySQL)
Vì Product sẽ bị xóa hoàn toàn, có thể thêm điều kiện để không cập nhật:

```sql
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

DELIMITER $$

CREATE TRIGGER `tr_product_versions_before_delete` 
BEFORE DELETE ON `product_versions` 
FOR EACH ROW 
BEGIN
    -- Chỉ cập nhật nếu product vẫn còn tồn tại (không bị xóa)
    -- Kiểm tra xem product có đang bị xóa không bằng cách đếm số ProductVersion còn lại
    DECLARE remaining_versions INT DEFAULT 0;
    DECLARE current_stock INT DEFAULT 0;
    
    -- Đếm số ProductVersion còn lại của product này
    SELECT COUNT(*) INTO remaining_versions
    FROM product_versions
    WHERE product_id = OLD.product_id;
    
    -- Nếu còn nhiều hơn 1 version (version hiện tại chưa bị xóa trong query), thì cập nhật
    -- Nếu chỉ còn 1 version (đang xóa version cuối cùng), thì không cần cập nhật vì product sẽ bị xóa
    IF remaining_versions > 1 THEN
        SELECT COALESCE(stock_quantity, 0) INTO current_stock 
        FROM product_versions 
        WHERE product_version_id = OLD.product_version_id;
        
        UPDATE products 
        SET stock_quantity = stock_quantity - current_stock 
        WHERE product_id = OLD.product_id;
    END IF;
END$$

DELIMITER ;
```

**Lưu ý:** Giải pháp này phức tạp và có thể không chính xác 100% vì COUNT(*) có thể không phản ánh đúng trong transaction.

### Giải pháp 3: Sửa hàm deleteProduct trong Java (Khuyến nghị nhất)
Cập nhật stock_quantity về 0 trước khi xóa để trigger không chạy sai:

```java
@Transactional
public void deleteProduct(Long productId) {
    if (productRepository.hasOrderDetails(productId)) {
        throw new IllegalStateException("Không thể xóa sản phẩm...");
    }
    
    // Cập nhật stock_quantity về 0 trước khi xóa (để trigger không chạy sai)
    Product product = getProductById(productId);
    product.setStockQuantity(0);
    productRepository.save(product);
    
    // Xóa ProductItems (trigger sẽ giảm stock của ProductVersion, nhưng không ảnh hưởng Product)
    productRepository.deleteSafeProductItems(productId);
    
    // Xóa ProductVersions (trigger sẽ trừ 0 từ Product.stock_quantity = 0, không ảnh hưởng)
    productRepository.deleteSafeProductVersions(productId);
    
    // Xóa Product
    productRepository.deleteProductById(productId);
}
```

**Hoặc tốt hơn:** Tắt trigger tạm thời trong transaction (MySQL không hỗ trợ trực tiếp, cần dùng session variable)

## Kết luận

**CÓ XUNG ĐỘT** giữa trigger `tr_product_versions_before_delete` và quá trình xóa ProductItems.

## Khuyến nghị cho MySQL

**Giải pháp tốt nhất:** **Giải pháp 1** - Sửa trigger để SELECT giá trị hiện tại

**Lý do:**
- ✅ Đảm bảo tính nhất quán dữ liệu
- ✅ Không cần thay đổi code Java
- ✅ Trigger tự động xử lý đúng trong mọi trường hợp
- ✅ Phù hợp với MySQL syntax

**Code MySQL đầy đủ để sửa:**

```sql
-- Xóa trigger cũ
DROP TRIGGER IF EXISTS `tr_product_versions_before_delete`;

DELIMITER $$

-- Tạo trigger mới với logic đúng
CREATE TRIGGER `tr_product_versions_before_delete` 
BEFORE DELETE ON `product_versions` 
FOR EACH ROW 
BEGIN
    DECLARE current_stock INT DEFAULT 0;
    
    -- Lấy stock_quantity hiện tại từ database (đã được cập nhật bởi trigger product_items nếu có)
    SELECT COALESCE(stock_quantity, 0) INTO current_stock 
    FROM product_versions 
    WHERE product_version_id = OLD.product_version_id;
    
    -- Cập nhật stock_quantity của products
    UPDATE products 
    SET stock_quantity = stock_quantity - current_stock 
    WHERE product_id = OLD.product_id;
END$$

DELIMITER ;
```

**Kiểm tra:**
Sau khi sửa, test với scenario:
1. Product có stock_quantity = 100
2. ProductVersion có stock_quantity = 10
3. Có 5 ProductItems IN_STOCK
4. Xóa Product → Kiểm tra Product.stock_quantity cuối cùng phải = 90 (100 - 10), không phải 95

