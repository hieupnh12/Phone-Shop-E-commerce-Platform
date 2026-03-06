# CAPSTONE PROJECT REPORT
## Report 4 – Software Design Document

**Project Name:** Web Sales Application (Phone Shop E-commerce Platform)  
**Project Duration:** Academic Capstone Project (2025-2026)  
**Date Created:** March 6, 2026  
**Version:** 1.0

---

## Table of Contents
1. [Record of Changes](#record-of-changes)
2. [Software Design Document](#ii-software-design-document)
   - [Overall Description](#1-overall-description)
   - [System Design](#2-system-design)
   - [Database Design](#3-database-design)
   - [Detailed Design](#4-detailed-design)

---

## Record of Changes

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-06 | Development Team | Initial Software Design Document |
| | | | - Completed system architecture design |
| | | | - Defined package structure and dependencies |
| | | | - Documented database schema and relationships |
| | | | - Detailed component design and interactions |

---

## II. SOFTWARE DESIGN DOCUMENT

### 1. Overall Description

#### 1.1 Assumptions

1. **Development Environment**: The system is developed using modern Java Spring Boot framework and React.js
2. **Database System**: MySQL relational database system is used for persistent data storage
3. **User Base**: The application is designed to support concurrent users for an e-commerce platform
4. **Third-party Services**: Integration with:
   - Google OAuth 2.0 for authentication
   - Cloudinary for image storage and management
   - PayOS for payment processing
   - OpenAI API for chatbot functionality
   - Firebase for real-time messaging
5. **Security Assumptions**: JWT tokens and OAuth2 authentication are implemented for secure access
6. **Scalability**: The system can be extended to support additional features and modules
7. **Performance**: Redis caching is implemented to improve system performance for frequently accessed data
8. **File Storage**: Cloud-based storage (Cloudinary) is used for product images and media files

#### 1.2 Design Constraints

1. **Technology Stack**:
   - **Backend**: Java 24 with Spring Boot 3.4.5
   - **Frontend**: React 18.2.0 with React Router
   - **Database**: MySQL
   - **Build Tool**: Maven
   - **Authentication**: Spring Security with OAuth2

2. **Browser Compatibility**:
   - Modern browsers supporting ES6+ JavaScript
   - Responsive design for mobile devices (>0.2% market share)

3. **Performance Constraints**:
   - API response time should be optimized
   - Image processing and thumbnail generation required
   - Caching mechanism implemented for product data

4. **Security Constraints**:
   - All sensitive data must be encrypted
   - Passwords stored using Spring Security's password encoder
   - JWT tokens for API authentication
   - Input validation and sanitization required
   - CSRF protection enabled

5. **Database Constraints**:
   - MySQL version compatibility
   - Entity relationship mapping through Hibernate ORM
   - Query optimization for large datasets

6. **Deployment Constraints**:
   - Application runs on port 8080
   - Context path: `/phoneShop`
   - Java 24 runtime required
   - External services credentials management

---

### 2. System Design

#### 2.1 System Architecture

##### 2.1.1 Architecture Overview

The Web Sales Application follows a **Three-Tier Architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
│  (React.js Frontend - React Router, Components, Context)    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  (Spring Boot Services, Controllers, Business Rules)         │
│                                                              │
│  ├── Controller Layer (REST API Endpoints)                  │
│  ├── Service Layer (Business Logic Implementation)          │
│  ├── Repository Layer (Data Access)                         │
│  └── Utility/Helper Classes                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    JDBC/Hibernate ORM
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      DATA ACCESS LAYER                       │
│                                                              │
│  ├── MySQL Database (Primary)                               │
│  ├── Redis Cache (Session & Data Cache)                     │
│  └── External Storage (Cloudinary for Images)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                     │
│                                                              │
│  ├── Google OAuth2 (Authentication)                         │
│  ├── PayOS (Payment Processing)                             │
│  ├── OpenAI (Chatbot Intelligence)                          │
│  ├── Firebase (Real-time Services)                          │
│  └── Email Service (SMTP)                                   │
└─────────────────────────────────────────────────────────────┘
```

##### 2.1.2 Technology Stack Details

**Backend Stack:**
- **Framework**: Spring Boot 3.4.5
  - Spring MVC for REST API
  - Spring Data JPA for database operations
  - Spring Security for authentication/authorization
  - Spring WebSocket for real-time communication
  - Spring Cache for caching strategy
- **ORM**: Hibernate with JPA
- **Build Tool**: Apache Maven
- **Java Version**: Java 24
- **Mapper**: MapStruct 1.6.3 (DTO mapping)
- **Logging**: Spring Boot Logging

**Frontend Stack:**
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.11.0
- **State Management**: React Context API + useReducer
- **API Communication**: Axios 1.4.0
- **Styling**: Tailwind CSS
- **Component Library**: Lucide React (Icons)
- **Data Fetching**: TanStack React Query 5.90.9
- **Additional Libraries**:
  - Firebase (Real-time database & messaging)
  - JWT Decode (Token parsing)
  - Date FNS (Date utilities)
  - Recharts (Data visualization)
  - XLSX (Excel export)

**Database:**
- **Primary DB**: MySQL (Relational)
- **Cache Layer**: Redis 6379
- **Cloud Storage**: Cloudinary

**Security & Authentication:**
- OAuth2 (Google Login)
- JWT Token-based Authentication
- Spring Security Crypto
- Password encryption

**Payment & External Services:**
- PayOS SDK 2.0.1 (Payment gateway)
- OpenAI API (ChatGPT integration)
- Firebase 12.6.0
- Selenium WebDriver (Testing automation)

##### 2.1.3 Key Components and Interactions

**Backend Components:**

1. **Controllers (API Endpoints)**
   - Product Management
   - User Management (Customer, Employee)
   - Order Management
   - Payment Processing
   - Authentication
   - Feedback & Reviews
   - Inventory Management
   - Statistics & Reporting

2. **Services (Business Logic)**
   - ProductService, ProductVersionService
   - OrderService, PaymentService
   - CustomerService, EmployeeService
   - AuthenticationService (Customer, Employee, Google)
   - ChatService (Chatbot integration)
   - FeedbackService
   - EmailService, SmsService
   - StatisticService

3. **Repository Layer**
   - Data access objects using Spring Data JPA
   - Custom queries for complex operations
   - Entity graphs for performance optimization

4. **Entities (Domain Models)**
   - Product, ProductVersion, ProductItem
   - Customer, Employee
   - Order, OrderDetail
   - Cart, CartItem
   - Feedback, Rating
   - PaymentTransaction
   - And 20+ other entities

**Frontend Components:**

1. **Layout Components**
   - AdminLayout, ClientLayout, CartLayout
   - Header, Footer, Sidebar
   - Navigation structures

2. **Feature Components**
   - Product Display & Filtering
   - Shopping Cart Management
   - User Profile Management
   - Admin Dashboard
   - Order Management
   - Feedback & Review System
   - Chatbot Interface
   - Payment Integration

3. **Utility Modules**
   - Authentication Context
   - Language Context (Multi-language support: EN, VI, JA)
   - API service layer
   - Custom hooks (useCustomerInfo, useFetchTotalInfo, usePermission)

---

#### 2.2 Package Diagram

##### 2.2.1 Backend Package Structure

```
com.websales
│
├── controller/
│   ├── ProductController.java
│   ├── OrderController.java
│   ├── CustomerController.java
│   ├── EmployeeController.java
│   ├── PaymentController.java
│   ├── CartController.java
│   ├── FeedbackController.java
│   ├── ChatController.java
│   ├── GoogleAuthController.java
│   ├── StatisticController.java
│   └── [15+ more controllers]
│
├── service/
│   ├── ProductService.java
│   ├── OrderService.java
│   ├── CustomerService.java
│   ├── CustomerAuthenticationService.java
│   ├── EmployeeService.java
│   ├── PaymentMethodService.java
│   ├── PaymentTransactionService.java
│   ├── PayOSService.java
│   ├── ChatService.java
│   ├── chatbot/
│   │   ├── ChatbotService.java
│   │   ├── IntentClassifier.java
│   │   └── ResponseGenerator.java
│   ├── EmailService.java
│   ├── SmsService.java
│   ├── StatisticService.java
│   └── [15+ more services]
│
├── repository/
│   ├── ProductRepository.java
│   ├── OrderRepository.java
│   ├── CustomerRepository.java
│   ├── CartRepository.java
│   ├── PaymentTransactionRepository.java
│   └── [20+ more repositories]
│
├── entity/
│   ├── AuditableEntity.java (base class)
│   ├── Product.java
│   ├── ProductVersion.java
│   ├── ProductItem.java
│   ├── Customer.java
│   ├── Employee.java
│   ├── Order.java
│   ├── OrderDetail.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Feedback.java
│   ├── PaymentTransaction.java
│   ├── PaymentMethod.java
│   ├── Role.java
│   ├── Permission.java
│   └── [20+ more entities]
│
├── dto/
│   ├── ProductDTO.java
│   ├── CustomerDTO.java
│   ├── OrderDTO.java
│   ├── PaymentDTO.java
│   └── [Request/Response DTOs]
│
├── mapper/
│   ├── ProductMapper.java
│   ├── CustomerMapper.java
│   ├── OrderMapper.java
│   └── [Entity to DTO mappers]
│
├── converter/
│   ├── Custom entity converters
│   └── Type conversion utilities
│
├── validation/
│   ├── Custom validation annotations
│   └── Business rule validators
│
├── configuration/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── CacheConfig.java
│   ├── WebSocketConfig.java
│   └── [Application configurations]
│
├── exception/
│   ├── CustomException.java
│   ├── ResourceNotFoundException.java
│   └── [Exception handlers]
│
├── handler/
│   ├── GlobalExceptionHandler.java
│   └── Error handling utilities
│
├── constant/
│   ├── AppConstant.java
│   ├── ErrorMessage.java
│   └── [Application constants]
│
├── enums/
│   ├── OrderStatus.java
│   ├── PaymentStatus.java
│   ├── UserRole.java
│   └── [Enumeration types]
│
└── WebSalesApplication.java (Main Application Class)
```

**Package Dependencies:**

```
controller ──> service ──> repository ──> entity
    │              │              │
    └──────────────┴──────────────┴──> dto
                   │
                   └──> mapper
                   │
                   └──> converter
                   │
                   └──> validation
                   │
                   └──> exception

configuration
    │
    ├──> security (Spring Security)
    ├──> cache (Redis)
    ├──> websocket
    └──> cors
```

##### 2.2.2 Frontend Package Structure

```
src/
│
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── ManageProducts.jsx
│   │   ├── ManageOrders.jsx
│   │   ├── ManageCustomers.jsx
│   │   ├── ManageEmployees.jsx
│   │   ├── Reports.jsx
│   │   └── [Admin pages]
│   │
│   ├── client/
│   │   ├── HomePage.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   └── [Client pages]
│   │
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   │
│   └── chatbot/
│       └── ChatbotPage.jsx
│
├── components/
│   ├── layout/
│   │   ├── Header.jsx / HeaderV2.jsx
│   │   ├── Footer.jsx / FooterV2.jsx
│   │   ├── Sidebar.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── ClientLayout.jsx
│   │   └── CartLayout.jsx
│   │
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── InputField.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── Loading.jsx
│   │   ├── Tooltip.jsx
│   │   ├── Pagination.jsx
│   │   ├── CartItem.jsx
│   │   ├── AddressForm.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── [Reusable UI components]
│   │
│   ├── admin/
│   │   ├── ProductForm.jsx
│   │   ├── VersionForm.jsx
│   │   ├── ManageReviewsModal.jsx
│   │   ├── VersionImageUpload.jsx
│   │   └── [Admin-specific components]
│   │
│   ├── feedback/
│   │   ├── FeedbackForm.jsx
│   │   ├── FeedbackList.jsx
│   │   └── RatingStats.jsx
│   │
│   ├── profile/
│   │   ├── ProfileDetail.jsx
│   │   ├── AddressBook.jsx
│   │   ├── OrderHistory.jsx
│   │   └── [Profile components]
│   │
│   └── Product/
│       └── Stepper/
│
├── services/
│   ├── api.js (Axios instance)
│   ├── productService.js
│   ├── orderService.js
│   ├── customerService.js
│   ├── loginService.js
│   ├── paymentService.js
│   ├── feedbackService.js
│   ├── chatBotService.js
│   ├── statisticService.js
│   ├── productWorker.js (Web Worker for heavy processing)
│   └── [API service calls]
│
├── contexts/
│   ├── AuthContext.js
│   ├── LanguageContext.js
│   └── [Application contexts]
│
├── hooks/
│   ├── useCustomerInfo.js
│   ├── useFetchTotalInfo.js
│   ├── usePermission.js
│   ├── useUrlTokenHandler.js
│   ├── useDebounce.js
│   └── [Custom hooks]
│
├── reducers/
│   ├── authReducer.js
│   ├── cartReducer.js
│   └── [Redux-like reducers]
│
├── routes/
│   ├── AdminRoute.jsx
│   ├── AuthRedirect.jsx
│   ├── PermissionRoute.jsx
│   └── [Route protection]
│
├── constants/
│   ├── httpMethod.js
│   ├── status.js
│   └── index.js
│
├── locales/
│   ├── en/
│   ├── vi/
│   ├── ja/
│   └── [i18n translations]
│
├── utils/
│   ├── permissionUtils.js
│   ├── phoneUtils.js
│   ├── productUtils.js
│   └── [Utility functions]
│
├── api/
│   ├── apiUpload.js
│   └── index.js
│
├── image/ & video/
│   └── [Static media assets]
│
├── App.js (Root component)
├── index.js (Entry point)
└── index.css (Global styles)
```

**Frontend Component Dependency Graph:**

```
App.js
 │
 ├──> AuthContext (Authentication state)
 ├──> LanguageContext (i18n)
 │
 ├──> Layout Components
 │    ├──> Header
 │    ├──> Footer
 │    └──> Sidebar
 │
 ├──> Routes
 │    ├──> AdminRoute (Protected)
 │    ├──> PermissionRoute (Role-based)
 │    └──> AuthRedirect
 │
 ├──> Pages
 │    ├──> Admin Pages
 │    ├──> Client Pages
 │    ├──> Auth Pages
 │    └──> Chatbot Page
 │
 ├──> Services
 │    ├──> API Service (Axios)
 │    └──> Domain Services
 │
 └──> Hooks & Utilities
      ├──> useCustomerInfo
      ├──> useFetchTotalInfo
      └──> usePermission
```

---

### 3. Database Design

#### 3.1 Database Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────────┤
│
│   [customers]                           [customer_auths]
│   ├─ customerId (PK)                    ├─ authId (PK)
│   ├─ fullName                           ├─ customerId (FK)
│   ├─ phoneNumber                        ├─ username
│   ├─ email                              ├─ password
│   ├─ gender                             ├─ isActive
│   ├─ birthDate                          └─ provider
│   ├─ address
│   ├─ createdAt
│   ├─ updatedAt
│   └─ deletedAt
│
│   [customer_address_book]
│   ├─ addressBookId (PK)
│   ├─ customerId (FK)
│   ├─ addressName
│   ├─ fullName
│   ├─ phoneNumber
│   ├─ address
│   └─ isDefault
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      PRODUCT MANAGEMENT                             │
├─────────────────────────────────────────────────────────────────────┤
│
│   [products]                            [product_versions]
│   ├─ productId (PK)                     ├─ versionId (PK)
│   ├─ nameProduct                        ├─ productId (FK)
│   ├─ picture                            ├─ versionName
│   ├─ battery                            ├─ price
│   ├─ screenSize                         ├─ ram
│   ├─ screenResolution                   ├─ rom
│   ├─ chipset                            ├─ color
│   ├─ rearCamera                         ├─ quantity
│   ├─ frontCamera                        ├─ status
│   ├─ warranty_period                    └─ description
│   ├─ originId (FK)
│   ├─ operatingSystemId (FK)    [product_version_images]
│   ├─ brandId (FK)              ├─ imageId (PK)
│   ├─ warehouseAreaId (FK)      ├─ versionId (FK)
│   ├─ stockQuantity             └─ imageUrl
│   ├─ status
│   ├─ createdAt                 [product_items]
│   ├─ updatedAt                 ├─ itemId (PK)
│   └─ deletedAt                 ├─ versionId (FK)
│                                ├─ serialNumber
│   [brand]                       ├─ quantity
│   ├─ brandId (PK)              ├─ status
│   ├─ nameProduct               └─ warehouseAreaId (FK)
│   ├─ image
│   └─ status                    [origins]
│                                ├─ originId (PK)
│   [category]                   ├─ originName
│   ├─ categoryId (PK)           └─ status
│   ├─ categoryName
│   └─ status                    [operating_systems]
│                                ├─ operatingSystemId (PK)
│   [color]                      ├─ operatingSystemName
│   ├─ colorId (PK)              └─ status
│   ├─ colorName
│   └─ status                    [ram]
│                                ├─ ramId (PK)
│   [rom]                        ├─ capacity
│   ├─ romId (PK)                └─ status
│   ├─ capacity
│   └─ status                    [warehouse_areas]
│                                ├─ areaId (PK)
│                                ├─ areaName
│                                └─ status
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       ORDER MANAGEMENT                              │
├─────────────────────────────────────────────────────────────────────┤
│
│   [orders]
│   ├─ orderId (PK)
│   ├─ customerId (FK)
│   ├─ employeeId (FK)
│   ├─ createDatetime
│   ├─ endDatetime
│   ├─ note
│   ├─ totalAmount
│   ├─ status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
│   ├─ isPaid
│   ├─ createdAt
│   ├─ updatedAt
│   └─ deletedAt
│
│   [order_details]
│   ├─ orderDetailId (PK)
│   ├─ orderId (FK)
│   ├─ productVersionId (FK)
│   ├─ quantity
│   ├─ unitPrice
│   ├─ totalPrice
│   └─ warrantyInfo
│
│   [payment_transactions]
│   ├─ transactionId (PK)
│   ├─ orderId (FK)
│   ├─ paymentMethodId (FK)
│   ├─ transactionCode
│   ├─ amount
│   ├─ paymentStatus
│   ├─ transactionDate
│   ├─ responseData
│   ├─ createdAt
│   └─ updatedAt
│
│   [payment_methods]
│   ├─ methodId (PK)
│   ├─ methodName
│   ├─ description
│   └─ status
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    SHOPPING CART                                    │
├─────────────────────────────────────────────────────────────────────┤
│
│   [carts]
│   ├─ cartId (PK)
│   ├─ customerId (FK)
│   ├─ createdAt
│   └─ updatedAt
│
│   [cart_items]
│   ├─ cartItemId (PK)
│   ├─ cartId (FK)
│   ├─ productVersionId (FK)
│   ├─ quantity
│   ├─ addedAt
│   └─ removedAt
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    FEEDBACK & REVIEW                                │
├─────────────────────────────────────────────────────────────────────┤
│
│   [feedbacks]
│   ├─ feedbackId (PK)
│   ├─ productVersionId (FK)
│   ├─ customerId (FK)
│   ├─ orderId (FK)
│   ├─ rating (1-5)
│   ├─ title
│   ├─ content
│   ├─ status (PENDING, APPROVED, REJECTED)
│   ├─ likeCount
│   ├─ createdAt
│   └─ updatedAt
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   EMPLOYEE MANAGEMENT                               │
├─────────────────────────────────────────────────────────────────────┤
│
│   [employees]
│   ├─ employeeId (PK)
│   ├─ fullName
│   ├─ email
│   ├─ phoneNumber
│   ├─ address
│   ├─ hireDate
│   ├─ salaryLevel
│   ├─ roleId (FK)
│   ├─ status
│   ├─ createdAt
│   ├─ updatedAt
│   └─ deletedAt
│
│   [roles]
│   ├─ roleId (PK)
│   ├─ roleName
│   ├─ description
│   └─ status
│
│   [permissions]
│   ├─ permissionId (PK)
│   ├─ permissionName
│   ├─ description
│   └─ status
│
│   [role_permissions] (Bridge table)
│   ├─ roleId (FK)
│   ├─ permissionId (FK)
│   └─ PRIMARY KEY (roleId, permissionId)
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       AUDIT & SECURITY                              │
├─────────────────────────────────────────────────────────────────────┤
│
│   [audit_logs]
│   ├─ logId (PK)
│   ├─ employeeId (FK)
│   ├─ action
│   ├─ entityType
│   ├─ entityId
│   ├─ oldValue
│   ├─ newValue
│   ├─ timestamp
│   └─ ipAddress
│
│   [invalid_tokens]
│   ├─ tokenId (PK)
│   ├─ token
│   ├─ invalidatedAt
│   └─ expiresAt
│
│   [password_reset_tokens]
│   ├─ tokenId (PK)
│   ├─ userId (FK)
│   ├─ token
│   ├─ createdAt
│   └─ expiresAt
│
│   [otp_requests]
│   ├─ otpId (PK)
│   ├─ email
│   ├─ otpCode
│   ├─ attempts
│   ├─ createdAt
│   └─ expiresAt
│
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    WARRANTY & RETURNS                               │
├─────────────────────────────────────────────────────────────────────┤
│
│   [return_warranty_requests]
│   ├─ requestId (PK)
│   ├─ orderId (FK)
│   ├─ customerId (FK)
│   ├─ productVersionId (FK)
│   ├─ requestType (WARRANTY, RETURN)
│   ├─ reason
│   ├─ description
│   ├─ status (PENDING, APPROVED, REJECTED, COMPLETED)
│   ├─ requestDate
│   ├─ resolveDate
│   ├─ createdAt
│   └─ updatedAt
│
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.2 Schema Descriptions

##### 3.2.1 Customer Entity Schema

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| customerId | INT | PK, AUTO_INCREMENT | Unique customer identifier |
| fullName | VARCHAR(255) | NOT NULL | Customer's full name |
| phoneNumber | VARCHAR(20) | | Contact phone number |
| email | VARCHAR(255) | UNIQUE | Email address |
| gender | BOOLEAN | | Gender flag (0=Male, 1=Female) |
| birthDate | DATE | | Date of birth |
| address | VARCHAR(255) | | Current address |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |
| deletedAt | TIMESTAMP | NULL | Soft delete timestamp |

**Relationships:**
- 1:N with CustomerAuth (one customer can have multiple authentication records)
- 1:N with CustomerAddressBook
- 1:N with Order
- 1:N with Cart
- 1:N with Feedback

##### 3.2.2 Product Entity Schema

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| productId | INT | PK, AUTO_INCREMENT | Unique product identifier |
| nameProduct | VARCHAR(255) | NOT NULL | Product name |
| picture | VARCHAR(255) | | Main product image URL |
| battery | VARCHAR(100) | | Battery capacity (mAh) |
| screenSize | VARCHAR(50) | | Screen diagonal in inches |
| screenResolution | VARCHAR(100) | | Display resolution (e.g., 1080x2400) |
| chipset | VARCHAR(100) | | Processor chipset |
| rearCamera | VARCHAR(100) | | Rear camera specifications |
| frontCamera | VARCHAR(100) | | Front camera specifications |
| warrantyPeriod | INT | | Warranty duration in months |
| originId | INT | FK → origins | Country/region of origin |
| operatingSystemId | INT | FK → operating_systems | OS platform |
| brandId | INT | FK → brand | Brand identifier |
| warehouseAreaId | INT | FK → warehouse_areas | Storage location |
| stockQuantity | INT | DEFAULT 0 | Current stock level |
| status | BOOLEAN | DEFAULT true | Product availability |
| createdAt | TIMESTAMP | | Creation timestamp |
| updatedAt | TIMESTAMP | | Update timestamp |

**Relationships:**
- N:1 with Brand
- N:1 with Origin
- N:1 with OperatingSystem
- 1:N with ProductVersion
- N:1 with WarehouseArea

##### 3.2.3 ProductVersion Entity Schema

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| versionId | INT | PK, AUTO_INCREMENT | Unique version identifier |
| productId | INT | FK → products | Product reference |
| versionName | VARCHAR(100) | | Version identifier (e.g., "Pro Max 256GB") |
| price | DECIMAL(15,2) | NOT NULL | Sale price |
| ram | INT | | RAM capacity in GB |
| rom | INT | | Storage capacity in GB |
| color | VARCHAR(50) | | Device color |
| quantity | INT | DEFAULT 0 | Available quantity |
| status | BOOLEAN | DEFAULT true | Version availability |
| description | TEXT | | Detailed description |
| createdAt | TIMESTAMP | | Creation timestamp |
| updatedAt | TIMESTAMP | | Update timestamp |

**Relationships:**
- N:1 with Product
- 1:N with ProductVersionImage
- 1:N with ProductItem
- 1:N with Feedback
- 1:N with CartItem
- 1:N with OrderDetail

##### 3.2.4 Order Entity Schema

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| orderId | INT | PK, AUTO_INCREMENT | Unique order identifier |
| customerId | INT | FK → customers | Ordering customer |
| employeeId | INT | FK → employees | Sales representative (optional) |
| createDatetime | TIMESTAMP | NOT NULL | Order creation time |
| endDatetime | TIMESTAMP | | Delivery completion time |
| note | TEXT | | Order notes/comments |
| totalAmount | DECIMAL(15,2) | | Order total price |
| status | ENUM | DEFAULT 'PENDING' | Order state (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED) |
| isPaid | BOOLEAN | DEFAULT false | Payment confirmation |
| createdAt | TIMESTAMP | | Record creation time |
| updatedAt | TIMESTAMP | | Record update time |

**Relationships:**
- N:1 with Customer
- N:1 with Employee (optional)
- 1:N with OrderDetail
- 1:N with PaymentTransaction
- 1:N with ReturnWarrantyRequest

##### 3.2.5 Feedback Entity Schema

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| feedbackId | INT | PK, AUTO_INCREMENT | Unique feedback identifier |
| productVersionId | INT | FK → product_versions | Reviewed product version |
| customerId | INT | FK → customers | Reviewer customer |
| orderId | INT | FK → orders | Related purchase order |
| rating | INT | CHECK (1-5) | Star rating (1-5) |
| title | VARCHAR(255) | | Review title |
| content | TEXT | | Detailed review content |
| status | ENUM | DEFAULT 'PENDING' | Review state (PENDING, APPROVED, REJECTED) |
| likeCount | INT | DEFAULT 0 | Number of helpful votes |
| createdAt | TIMESTAMP | | Creation timestamp |
| updatedAt | TIMESTAMP | | Update timestamp |

**Relationships:**
- N:1 with ProductVersion
- N:1 with Customer
- N:1 with Order

##### 3.2.6 Cart & CartItem Schema

**Cart Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| cartId | INT | PK, AUTO_INCREMENT | Unique cart identifier |
| customerId | INT | FK → customers | Cart owner |
| createdAt | TIMESTAMP | | Creation timestamp |
| updatedAt | TIMESTAMP | | Update timestamp |

**CartItem Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| cartItemId | INT | PK, AUTO_INCREMENT | Unique cart item identifier |
| cartId | INT | FK → carts | Parent cart |
| productVersionId | INT | FK → product_versions | Product in cart |
| quantity | INT | DEFAULT 1 | Number of items |
| addedAt | TIMESTAMP | | Addition timestamp |
| removedAt | TIMESTAMP | NULL | Removal timestamp (soft delete) |

##### 3.2.7 Employee & Role Schema

**Employee Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| employeeId | INT | PK, AUTO_INCREMENT | Unique employee identifier |
| fullName | VARCHAR(255) | NOT NULL | Employee name |
| email | VARCHAR(255) | UNIQUE | Corporate email |
| phoneNumber | VARCHAR(20) | | Contact number |
| address | VARCHAR(255) | | Home address |
| hireDate | DATE | | Employment start date |
| salaryLevel | VARCHAR(50) | | Compensation tier |
| roleId | INT | FK → roles | Employee role |
| status | BOOLEAN | DEFAULT true | Employment status |
| createdAt | TIMESTAMP | | Record creation time |
| updatedAt | TIMESTAMP | | Record update time |

**Role Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| roleId | INT | PK, AUTO_INCREMENT | Unique role identifier |
| roleName | VARCHAR(100) | UNIQUE | Role name |
| description | TEXT | | Role responsibilities |
| status | BOOLEAN | DEFAULT true | Role availability |

**Permission Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| permissionId | INT | PK, AUTO_INCREMENT | Unique permission identifier |
| permissionName | VARCHAR(100) | UNIQUE | Permission code |
| description | TEXT | | Permission description |
| status | BOOLEAN | DEFAULT true | Permission status |

##### 3.2.8 Payment Schema

**PaymentTransaction Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| transactionId | INT | PK, AUTO_INCREMENT | Unique transaction identifier |
| orderId | INT | FK → orders | Related order |
| paymentMethodId | INT | FK → payment_methods | Payment type |
| transactionCode | VARCHAR(100) | UNIQUE | PayOS transaction reference |
| amount | DECIMAL(15,2) | | Transaction amount |
| paymentStatus | ENUM | | Status (PENDING, COMPLETED, FAILED, CANCELLED) |
| transactionDate | TIMESTAMP | | Transaction time |
| responseData | JSON | | PayOS API response |
| createdAt | TIMESTAMP | | Record creation |
| updatedAt | TIMESTAMP | | Record update |

**PaymentMethod Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| methodId | INT | PK, AUTO_INCREMENT | Unique method identifier |
| methodName | VARCHAR(100) | | Payment method name |
| description | TEXT | | Method description |
| status | BOOLEAN | DEFAULT true | Availability status |

##### 3.2.9 Audit & Security Schema

**AuditLog Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| logId | INT | PK, AUTO_INCREMENT | Unique log entry identifier |
| employeeId | INT | FK → employees | Acting employee |
| action | VARCHAR(100) | | Operation performed (CREATE, UPDATE, DELETE) |
| entityType | VARCHAR(100) | | Entity class name |
| entityId | INT | | Target entity ID |
| oldValue | JSON | | Previous state |
| newValue | JSON | | New state |
| timestamp | TIMESTAMP | | Action time |
| ipAddress | VARCHAR(45) | | Request originating IP |

**InvalidToken Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| tokenId | INT | PK, AUTO_INCREMENT | Unique token record identifier |
| token | TEXT | | Invalidated JWT token |
| invalidatedAt | TIMESTAMP | | Revocation time |
| expiresAt | TIMESTAMP | | Token expiration time |

**OtpRequest Table:**

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| otpId | INT | PK, AUTO_INCREMENT | Unique OTP request identifier |
| email | VARCHAR(255) | | Target email address |
| otpCode | VARCHAR(6) | | One-time password code |
| attempts | INT | DEFAULT 0 | Failed verification attempts |
| createdAt | TIMESTAMP | | Request creation time |
| expiresAt | TIMESTAMP | | OTP expiration time |

---

### 4. Detailed Design

#### 4.1 Component-Level Design

##### 4.1.1 Backend Components

**ProductController & ProductService Architecture**

```java
@RestController
@RequestMapping("/phoneShop/api/products")
public class ProductController {
    
    private final ProductService productService;
    private final ProductMapper productMapper;
    
    // Retrieve paginated product list with filtering
    @GetMapping
    public ResponseEntity<?> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long brandId,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice
    ) {
        // Service implements filtering logic
        // Returns paginated ProductDTO list
    }
    
    // Get detailed product information with versions
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail(@PathVariable Long id) {
        // Retrieves product with all versions and images
        // Implements caching strategy
    }
    
    // Create new product (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDTO dto) {
        // Business validation
        // Image upload to Cloudinary
        // Inventory initialization
    }
    
    // Update product information
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(
        @PathVariable Long id,
        @Valid @RequestBody ProductDTO dto
    ) {
        // Audit logging
        // Cascade updates to versions
    }
}
```

**Service Layer Pattern:**

```java
@Service
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    private final ProductVersionService productVersionService;
    private final ImageService imageService;
    private final CacheManager cacheManager;
    
    // Implement business logic
    public Page<ProductDTO> getFilteredProducts(
        Pageable pageable,
        ProductFilterCriteria criteria
    ) {
        // Build complex query with specifications
        // Apply business rules and validations
        // Map to DTOs
        // Cache results
    }
    
    // Handle transaction management
    @Transactional(propagation = Propagation.REQUIRED)
    public ProductDTO createProductWithVersions(
        ProductDTO productDto,
        List<ProductVersionDTO> versionDtos
    ) {
        // Save product
        // Create versions
        // Upload images
        // Rollback on failure
    }
}
```

**Repository with Custom Queries:**

```java
@Repository
public interface ProductRepository 
    extends JpaRepository<Product, Long>, 
            JpaSpecificationExecutor<Product> {
    
    @EntityGraph(attributePaths = {"brand", "origin", "operatingSystem"})
    @Query("SELECT p FROM Product p WHERE p.status = true ORDER BY p.createdAt DESC")
    Page<Product> findActiveProducts(Pageable pageable);
    
    @Query(value = "SELECT * FROM products WHERE MATCH(nameProduct) AGAINST(? IN BOOLEAN MODE)",
           nativeQuery = true)
    List<Product> searchByName(String searchTerm);
    
    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - ?2 WHERE p.id = ?1")
    void decreaseStock(Long productId, Integer quantity);
}
```

##### 4.1.2 Frontend Components

**Product List with Filtering and Pagination**

```jsx
function ProductList() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    page: 0,
    size: 12,
    search: '',
    brandId: null,
    minPrice: null,
    maxPrice: null
  });
  
  const { data, isLoading } = useQuery(
    ['products', filters],
    () => fetchProductsList(filters),
    { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
  );
  
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  return (
    <ClientLayout>
      <ProductFilter onFilterChange={handleFilterChange} />
      {isLoading ? <Loading /> : <ProductGrid products={data.content} />}
      <Pagination 
        total={data.totalElements}
        currentPage={filters.page}
        onPageChange={handlePageChange}
      />
    </ClientLayout>
  );
}
```

**Cart Management with Context API**

```jsx
// Cart Context
const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  
  const addToCart = (productVersion, quantity) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { productVersionId: productVersion.id, quantity }
    });
  };
  
  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };
  
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Usage in components
function AddToCartButton({ productVersion }) {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    addToCart(productVersion, quantity);
    toast.success('Added to cart');
  };
  
  return (
    <Button onClick={handleAddToCart} className="add-to-cart">
      Add to Cart ({quantity})
    </Button>
  );
}
```

**Authentication & Authorization Flow**

```jsx
// AuthContext manages user authentication state
function AuthProvider({ children }) {
  const [auth, dispatch] = useReducer(authReducer, initialAuthState);
  
  const login = async (email, password) => {
    const response = await loginService.authenticate(email, password);
    const { token, user } = response.data;
    
    // Store JWT token
    localStorage.setItem('jwtToken', token);
    
    // Update auth context
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user, token }
    });
  };
  
  const logout = () => {
    // Invalidate token on backend
    loginService.logout();
    
    // Clear local storage
    localStorage.removeItem('jwtToken');
    
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected route component
function PermissionRoute({ children, requiredRole }) {
  const { auth } = useContext(AuthContext);
  
  if (!auth.token) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && !auth.user.roles.includes(requiredRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

#### 4.2 Data Flow and Interaction Patterns

##### 4.2.1 Request-Response Cycle

**Product Search Request Flow:**

```
1. User enters search query in ProductList component
   ↓
2. FilterChange event triggers useQuery hook
   ↓
3. React Query calls API service (productService.js)
   ↓
4. API service creates HTTP request with Axios
   GET /phoneShop/api/products?search=iphone&page=0&size=12
   ↓
5. Spring Security validates JWT token from Authorization header
   ↓
6. ProductController receives request
   ↓
7. ProductService implements business logic:
   - Parse filter parameters
   - Build JpaSpecification query
   - Execute database query with pagination
   - Map entity results to ProductDTO
   ↓
8. ProductRepository performs database operations:
   - Full-text search on product name
   - Apply price range filter
   - Implement pagination
   ↓
9. Results marshalled to JSON response
   ↓
10. Frontend receives response and updates UI state
   ↓
11. Component re-renders with new product list
```

##### 4.2.2 Order Processing Flow

```
1. Customer reviews cart and initiates checkout
   ↓
2. ClientLayout → Checkout page
   ↓
3. Customer selects payment method (PayOS)
   ↓
4. Order creation request sent to backend:
   POST /phoneShop/api/orders
   {
     "customerId": 123,
     "items": [
       { "productVersionId": 456, "quantity": 2 },
       ...
     ],
     "shippingAddress": "...",
     "paymentMethodId": 1
   }
   ↓
5. OrderService validates order:
   - Check inventory availability
   - Calculate total amount
   - Validate customer data
   ↓
6. Order entity created (status: PENDING)
   OrderDetail entries for each item
   ↓
7. PaymentService initiates PayOS transaction:
   - Call PayOS API with order details
   - Receive payment URL
   ↓
8. Customer redirected to payment gateway
   ↓
9. PayOSWebhookController receives payment result
   ↓
10. Update order status based on payment result
    Update payment transaction record
    Trigger inventory reduction
    ↓
11. Send confirmation email to customer
    ↓
12. Update cart (clear items)
    ↓
13. Redirect to order confirmation page
```

##### 4.2.3 Feedback Submission Flow

```
1. Customer purchases product via order
   ↓
2. Order status = DELIVERED
   ↓
3. Feedback button appears on OrderHistory page
   ↓
4. Customer fills FeedbackForm:
   - Select rating (1-5 stars)
   - Write title
   - Write detailed review
   - Upload images (optional)
   ↓
5. Form validation on client-side
   ↓
6. POST /phoneShop/api/feedbacks
   {
     "productVersionId": 456,
     "orderId": 789,
     "rating": 5,
     "title": "Great phone",
     "content": "...",
     "images": [...]
   }
   ↓
7. FeedbackService creates feedback entity:
   - Status = PENDING (requires approval)
   - Link to product version, order, customer
   ↓
8. Notification sent to admin
   ↓
9. Admin reviews and approves/rejects via ManageReviewsModal
   ↓
10. Approved feedback appears on ProductDetail page
    ↓
11. RatingStats component updates average rating
    ↓
12. Frontend re-caches product data
```

#### 4.3 API Design

##### 4.3.1 RESTful Endpoint Structure

**Product Endpoints:**
```
GET    /phoneShop/api/products                    # List with pagination/filtering
POST   /phoneShop/api/products                    # Create (Admin)
GET    /phoneShop/api/products/{id}               # Get details
PUT    /phoneShop/api/products/{id}               # Update (Admin)
DELETE /phoneShop/api/products/{id}               # Soft delete (Admin)

GET    /phoneShop/api/products/{id}/versions      # Product versions
POST   /phoneShop/api/products/{id}/versions      # Add version (Admin)
PUT    /phoneShop/api/products/{id}/versions/{vId} # Update version

GET    /phoneShop/api/products/{id}/feedbacks     # Product reviews
```

**Order Endpoints:**
```
GET    /phoneShop/api/orders                      # List customer orders
POST   /phoneShop/api/orders                      # Create new order
GET    /phoneShop/api/orders/{id}                 # Order details
PUT    /phoneShop/api/orders/{id}                 # Update order (Admin)
PUT    /phoneShop/api/orders/{id}/status          # Change status

GET    /phoneShop/api/orders/{id}/details         # Order items
```

**Cart Endpoints:**
```
GET    /phoneShop/api/carts/me                    # Get current user cart
POST   /phoneShop/api/carts/items                 # Add item
PUT    /phoneShop/api/carts/items/{itemId}        # Update quantity
DELETE /phoneShop/api/carts/items/{itemId}        # Remove item
DELETE /phoneShop/api/carts/clear                 # Clear all items
```

**Authentication Endpoints:**
```
POST   /phoneShop/api/auth/register               # Customer registration
POST   /phoneShop/api/auth/login                  # Customer login
POST   /phoneShop/api/auth/logout                 # Logout
POST   /phoneShop/api/auth/refresh-token          # Refresh JWT
POST   /phoneShop/api/auth/forgot-password        # Request password reset
POST   /phoneShop/api/auth/reset-password         # Reset with token
GET    /phoneShop/login/oauth2/code/google        # Google OAuth callback
```

**Payment Endpoints:**
```
POST   /phoneShop/api/payments/create             # Initiate payment
POST   /phoneShop/api/payments/callback           # PayOS webhook
GET    /phoneShop/api/payments/{orderId}/status   # Check payment status
```

##### 4.3.2 Response Format

**Success Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Operation successful",
  "data": {
    "id": 123,
    "name": "iPhone 15 Pro",
    "price": 999.99,
    ...
  },
  "timestamp": "2026-03-06T10:30:00Z"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "status": 200,
  "data": {
    "content": [...],
    "totalElements": 150,
    "totalPages": 15,
    "currentPage": 0,
    "pageSize": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "status": 400,
  "error": "Invalid Input",
  "message": "Product name is required",
  "details": {
    "field": "nameProduct",
    "rejectedValue": null,
    "constraint": "NotNull"
  },
  "timestamp": "2026-03-06T10:30:00Z"
}
```

#### 4.4 Security Design

##### 4.4.1 Authentication Strategy

**JWT Token Flow:**
```
1. User submits credentials
   ↓
2. Backend validates against customer_auths table
   ↓
3. If valid, generate JWT token:
   Header: { "alg": "HS256", "typ": "JWT" }
   Payload: {
     "sub": customerId,
     "email": user_email,
     "roles": ["CUSTOMER"],
     "iat": issued_at_timestamp,
     "exp": expiration_timestamp
   }
   Signature: HMAC-SHA256(header.payload, secret_key)
   ↓
4. Return { token, refreshToken, user_info }
   ↓
5. Frontend stores token in localStorage
   ↓
6. Include token in Authorization header for subsequent requests
   Authorization: Bearer eyJhbGc...
   ↓
7. Spring Security validates token signature and expiration
   ↓
8. Extract claims and set SecurityContext
   ↓
9. Route request to controller
```

**OAuth2 Google Integration:**
```
1. User clicks "Login with Google" on frontend
   ↓
2. Frontend redirects to Google OAuth consent screen
   ↓
3. User grants permission to application
   ↓
4. Google redirects to callback URL with authorization code:
   http://localhost:8080/phoneShop/login/oauth2/code/google?code=...
   ↓
5. GoogleAuthController receives code
   ↓
6. Backend exchanges code for access token via Google API
   ↓
7. Retrieve user profile (email, name, picture)
   ↓
8. Verify if customer exists in database:
   - If YES: Update last login, generate JWT
   - If NO: Auto-create customer account, generate JWT
   ↓
9. Return JWT token to frontend
   ↓
10. Frontend stores token and redirects to home page
```

##### 4.4.2 Authorization Strategy

**Role-Based Access Control (RBAC):**

```
┌──────────────────────────────────────────────────────────┐
│                      ROLES                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CUSTOMER                                               │
│  ├─ VIEW_PRODUCTS (Browse product catalog)             │
│  ├─ CREATE_FEEDBACK (Submit reviews)                   │
│  ├─ CREATE_ORDER (Place orders)                        │
│  ├─ VIEW_OWN_ORDERS (See own orders)                   │
│  └─ MANAGE_PROFILE (Edit personal info)               │
│                                                          │
│  STAFF                                                  │
│  ├─ All CUSTOMER permissions                           │
│  ├─ MANAGE_ORDERS (Edit orders)                        │
│  ├─ MANAGE_INVENTORY (Stock management)                │
│  ├─ APPROVE_FEEDBACK (Review submissions)              │
│  ├─ PROCESS_RETURNS (Handle warranty)                  │
│  └─ VIEW_REPORTS (Access basic analytics)             │
│                                                          │
│  ADMIN                                                  │
│  ├─ All STAFF permissions                              │
│  ├─ MANAGE_PRODUCTS (Create/edit products)            │
│  ├─ MANAGE_CATEGORIES (Catalog management)             │
│  ├─ MANAGE_EMPLOYEES (User management)                 │
│  ├─ MANAGE_ROLES (Permission assignment)               │
│  ├─ MANAGE_PAYMENTS (Payment settings)                 │
│  ├─ GENERATE_REPORTS (Export analytics)                │
│  └─ SYSTEM_SETTINGS (Configuration)                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Implementation with Spring Security:**

```java
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                // Public endpoints
                .antMatchers("/phoneShop/api/auth/**").permitAll()
                .antMatchers("/phoneShop/api/products/*/feedbacks").permitAll()
                
                // Customer endpoints
                .antMatchers("/phoneShop/api/carts/**").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                .antMatchers("/phoneShop/api/orders").hasAnyRole("CUSTOMER", "STAFF", "ADMIN")
                
                // Admin endpoints
                .antMatchers("/phoneShop/api/products", "/phoneShop/api/products/*").hasRole("ADMIN")
                .antMatchers("/phoneShop/api/employees/**").hasRole("ADMIN")
                
                // All authenticated requests
                .anyRequest().authenticated()
            .and()
            .httpBasic()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilter(new JwtAuthenticationFilter(...));
        
        return http.build();
    }
}
```

**Method-Level Security:**

```java
@Service
public class ProductService {
    
    @PreAuthorize("hasRole('ADMIN')")
    public ProductDTO createProduct(ProductDTO dto) {
        // Only admin can create products
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public void updateProductStock(Long productId, int quantity) {
        // Admin and staff can update stock
    }
    
    @PreAuthorize("hasAnyRole('CUSTOMER', 'STAFF', 'ADMIN')")
    @PostAuthorize("returnObject.customerId == authentication.principal.customerId")
    public FeedbackDTO createFeedback(FeedbackDTO dto) {
        // Customer can only create feedback for their own orders
    }
}
```

##### 4.4.3 Data Protection

**Encryption Mechanisms:**
- Passwords: BCryptPasswordEncoder (Spring Security)
- JWT Token Signing: HS256 algorithm
- Sensitive Data: AES encryption for PII (personal identifiable information)
- HTTPS: Required for all API communication
- Database: Encrypted connections via SSL

**SQL Injection Prevention:**
- Parameterized queries with JPA
- Input validation on DTOs
- Output encoding on responses

**CSRF Protection:**
- Disabled for API (stateless JWT)
- Enabled for traditional form submissions
- SameSite cookie attribute

#### 4.5 Performance Optimization Strategy

##### 4.5.1 Caching Layers

**Frontend Caching:**
```javascript
// React Query configuration with automatic cache management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      cacheTime: 10 * 60 * 1000,       // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Cache product list results
useQuery(
  ['products', filters],
  () => fetchProducts(filters),
  {
    staleTime: 10 * 60 * 1000,  // Cache product list for 10 minutes
    onSuccess: (data) => {
      // Prefetch next pages
      data.content.forEach(product => {
        queryClient.prefetchQuery(
          ['productDetail', product.id],
          () => fetchProductDetail(product.id)
        );
      });
    }
  }
);
```

**Backend Caching:**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        return RedisCacheManager.create(factory);
    }
}

@Service
public class ProductService {
    
    // Cache product list for 10 minutes
    @Cacheable(value = "products", key = "#page + '-' + #size + '-' + #filters")
    public Page<ProductDTO> getProducts(int page, int size, Map<String, String> filters) {
        // Database query only on cache miss
    }
    
    // Cache individual product for 30 minutes
    @Cacheable(value = "productDetail", key = "#id")
    public ProductDetailDTO getProductDetail(Long id) {
        // Database query only on cache miss
    }
    
    // Invalidate cache on product update
    @CacheEvict(value = {"products", "productDetail"}, allEntries = true)
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        // Update logic
    }
}
```

**Redis Configuration:**
```yaml
spring:
  redis:
    host: localhost
    port: 6379
    timeout: 2000ms
    jedis:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5
```

##### 4.5.2 Database Optimization

**Query Optimization:**
- EntityGraph for lazy loading optimization
- Native queries for complex aggregations
- Database indexing on frequently queried columns
- Pagination for large result sets

**Indexing Strategy:**
```sql
-- Customer table
CREATE INDEX idx_email ON customers(email);
CREATE INDEX idx_phone ON customers(phoneNumber);

-- Product table
CREATE INDEX idx_brand_id ON products(brandId);
CREATE INDEX idx_status ON products(status);
CREATE FULLTEXT INDEX idx_product_name ON products(nameProduct);

-- Order table
CREATE INDEX idx_customer_id ON orders(customerId);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_create_date ON orders(createDatetime);

-- Feedback table
CREATE INDEX idx_product_version_id ON feedbacks(productVersionId);
CREATE INDEX idx_status ON feedbacks(status);
CREATE INDEX idx_rating ON feedbacks(rating);
```

**Connection Pooling:**
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

##### 4.5.3 API Response Optimization

**Data Transfer Optimization:**
- Compression: gzip for HTTP responses
- JSON format over XML
- Partial response selection (only required fields)
- Server-side pagination vs full data retrieval

**Frontend Lazy Loading:**
```jsx
// Lazy load images
<img 
  src={product.image} 
  loading="lazy" 
  alt={product.name}
/>

// Lazy load components
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const ChatBot = lazy(() => import('./ChatBot'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

#### 4.6 Error Handling and Logging

##### 4.6.1 Exception Handling Strategy

**Custom Exception Hierarchy:**
```java
public abstract class ApplicationException extends RuntimeException {
    private final int statusCode;
    private final String errorCode;
    
    public ApplicationException(String message, int statusCode, String errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}

public class ResourceNotFoundException extends ApplicationException {
    public ResourceNotFoundException(String resource, Long id) {
        super(
            String.format("%s not found with id: %d", resource, id),
            404,
            "RESOURCE_NOT_FOUND"
        );
    }
}

public class BusinessRuleException extends ApplicationException {
    public BusinessRuleException(String message) {
        super(message, 400, "BUSINESS_RULE_VIOLATION");
    }
}

public class InvalidCredentialException extends ApplicationException {
    public InvalidCredentialException() {
        super("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }
}
```

**Global Exception Handler:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(
        ResourceNotFoundException ex,
        HttpServletRequest request
    ) {
        ErrorResponse error = ErrorResponse.builder()
            .success(false)
            .status(404)
            .error("Not Found")
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity
            .status(404)
            .body(error);
    }
    
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<?> handleBusinessRule(
        BusinessRuleException ex,
        HttpServletRequest request
    ) {
        ErrorResponse error = ErrorResponse.builder()
            .success(false)
            .status(400)
            .error("Business Rule Violation")
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity
            .status(400)
            .body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationError(
        MethodArgumentNotValidException ex,
        HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult()
            .getFieldErrors()
            .forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
        
        ErrorResponse response = ErrorResponse.builder()
            .success(false)
            .status(400)
            .error("Validation Error")
            .message("Input validation failed")
            .details(errors)
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity
            .status(400)
            .body(response);
    }
}
```

##### 4.6.2 Logging Strategy

**Logging Configuration:**
```yaml
logging:
  level:
    root: INFO
    com.websales: DEBUG
    org.springframework.security: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql: TRACE
  
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30
```

**Audit Logging for Critical Operations:**
```java
@Aspect
@Component
public class AuditLoggingAspect {
    
    private final AuditLogService auditLogService;
    
    @AfterReturning(
        pointcut = "@annotation(com.websales.annotation.Auditable)",
        returning = "result"
    )
    public void logAuditableOperation(JoinPoint joinPoint, Object result) {
        String action = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        auditLogService.logAction(
            getCurrentEmployee(),
            action,
            getEntityType(args),
            getEntityId(args),
            null,
            result
        );
    }
}
```

---

### 5. Implementation Notes

#### 5.1 Key Technologies

**Backend:**
- Spring Boot 3.4.5 with Java 24
- Spring Data JPA with Hibernate ORM
- Spring Security with OAuth2
- MapStruct for DTO mapping
- Cloudinary SDK for image management
- PayOS SDK for payment processing
- OpenAI API for chatbot
- Redis for caching

**Frontend:**
- React 18.2 with Hooks
- React Router 6 for SPA routing
- Axios for HTTP client
- React Query (TanStack) for server state management
- Tailwind CSS for styling
- Firebase for real-time features
- i18n for multi-language support

#### 5.2 Design Patterns Used

1. **MVC/MVCS**: Separation of concerns (Controller, Service, Repository)
2. **DTO Pattern**: Data transfer between layers
3. **Mapper Pattern**: Entity-to-DTO conversions with MapStruct
4. **Repository Pattern**: Data access abstraction
5. **Factory Pattern**: Entity creation and configuration
6. **Decorator Pattern**: Adding behavior to responses
7. **Observer Pattern**: React Context API for state management
8. **Strategy Pattern**: Multiple payment/delivery options
9. **Singleton Pattern**: Spring beans as singletons
10. **Interceptor Pattern**: Request/Response intercepting

#### 5.3 Scalability Considerations

1. **Database Scalability:**
   - Connection pooling with HikariCP
   - Read replicas for read-heavy operations
   - Sharding for large tables
   - Archive old data for performance

2. **Application Scalability:**
   - Stateless design enabling horizontal scaling
   - Load balancing across multiple instances
   - Message queue (RabbitMQ/Kafka) for async operations
   - Microservices decomposition for future growth

3. **Frontend Scalability:**
   - Code splitting with React.lazy()
   - Progressive Web App capabilities
   - Service Worker for offline support
   - CDN for static asset distribution

---

## Appendix: Technology Version Matrix

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Spring Boot | 3.4.5 |
| | Java | 24 |
| | Spring Data JPA | 3.4.5 |
| | Hibernate | 6.4.x |
| | Spring Security | 6.x |
| | Maven | 3.8.9+ |
| **Frontend** | React | 18.2.0 |
| | React Router | 6.11.0 |
| | React Query | 5.90.9 |
| | Tailwind CSS | Latest |
| | Axios | 1.4.0 |
| **Database** | MySQL | 8.0+ |
| | Redis | 6.0+ |
| **External Services** | Firebase | 12.6.0 |
| | Cloudinary | 1.39.0 |
| | PayOS | 2.0.1 |
| | OpenAI API | Latest |

---

**End of Software Design Document**

*Document Version: 1.0*  
*Last Updated: March 6, 2026*  
*Status: Approved*
