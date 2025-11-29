-- Migration: Add COMPLETED status to orders table ENUM
-- Run this SQL script to update the orders table schema

ALTER TABLE `orders` 
MODIFY COLUMN `status` ENUM('PENDING','PAID','SHIPPED','DELIVERED','CANCELED','RETURNED','COMPLETED') DEFAULT 'PENDING';

