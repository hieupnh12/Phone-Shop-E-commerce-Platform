# Cấu Trúc Frontend - Web Sales Project

## Tổng Quan
Dự án frontend được xây dựng bằng **React 18** với **React Router v6** và **Tailwind CSS** cho styling. Đây là một ứng dụng web bán hàng với 2 phần chính: Client và Admin.

## Công Nghệ Sử Dụng

### Core Dependencies
- **React 18.2.0** - UI Framework
- **React Router DOM 6.11.0** - Routing
- **Axios 1.4.0** - HTTP Client
- **js-cookie 3.0.5** - Cookie Management
- **query-string 9.3.1** - URL Query Parsing

### Styling & UI
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **PostCSS 8.4.24** - CSS Processing
- **Autoprefixer 10.4.14** - CSS Vendor Prefixes

### Development Tools
- **React Scripts 5.0.1** - Build tools
- **Testing Library** - Testing utilities

## Cấu Trúc Thư Mục

```
frontend/
├── public/                     # Static files
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── api/                    # API Configuration
│   │   └── index.js           # Axios client setup
│   ├── components/            # Reusable Components
│   │   ├── common/            # Common UI components
│   │   │   ├── Button.jsx
│   │   │   ├── CartItem.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Tooltip.jsx
│   │   └── layout/            # Layout Components
│   │       ├── AdminLayout.jsx
│   │       ├── ClientLayout.jsx
│   │       ├── ClientSidebar.jsx
│   │       ├── Footer.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   ├── constants/             # Application Constants
│   │   ├── httpMethod.js
│   │   └── status.js
│   ├── contexts/              # React Contexts
│   │   ├── AuthContext.js     # Authentication state
│   │   └── CartContext.js     # Shopping cart state
│   ├── pages/                 # Page Components
│   │   ├── admin/             # Admin pages
│   │   │   └── HomeAdmin.jsx
│   │   ├── auth/              # Authentication pages
│   │   │   └── Login.js
│   │   └── client/            # Client pages
│   │       ├── Cart.jsx
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── NotFound.jsx
│   │       ├── Products/
│   │       │   ├── index.jsx
│   │       │   └── ProductDetail.jsx
│   │       └── Signup.jsx
│   ├── reducers/              # State Reducers
│   │   ├── authReducer.js
│   │   ├── cartReducer.js
│   │   └── index.js
│   ├── routes/                # Route Components
│   │   └── AdminRoute.jsx     # Admin route protection
│   ├── services/              # API Services
│   │   ├── api.js            # Main API service
│   │   └── test.js           # Test API calls
│   ├── App.js                # Main App component
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
├── package.json
├── tailwind.config.js        # Tailwind configuration
└── postcss.config.js         # PostCSS configuration
```

## Kiến Trúc Ứng Dụng

### 1. Routing Structure
```javascript
// Main Layout (Client)
/ → Home
/products/:id → ProductDetail
/cart → Cart
/login → Login
/signup → Signup

// Admin Layout
/admin → HomeAdmin (Protected)
```

### 2. State Management
- **AuthContext**: Quản lý trạng thái authentication
- **CartContext**: Quản lý giỏ hàng
- **Local Storage**: Lưu trữ token và cart data

### 3. API Integration
- **Base URL**: Configurable via environment variables
- **Interceptors**: Auto token injection và error handling
- **Services**: Modular API services

## Component Architecture

### Layout Components
- **MainLayout**: Wrapper với Header + Footer
- **Header**: Navigation với cart icon và user menu
- **Footer**: Site footer
- **AdminLayout**: Admin-specific layout

### Common Components
- **Button**: Reusable button component
- **InputField**: Form input component
- **Modal**: Modal dialog component
- **ProductCard**: Product display card
- **Pagination**: Data pagination component

### Context Providers
- **AuthProvider**: Authentication state management
- **CartProvider**: Shopping cart state management

## API Services Structure

### Authentication Services
```javascript
authService = {
  login(email, password),
  register(userData),
  getCurrentUser(),
  refreshToken()
}
```

### Product Services
```javascript
productService = {
  getProducts(filters),
  getProduct(id),
  getFeaturedProducts(),
  getCategories(),
  searchProducts(query)
}
```

### Cart Services
```javascript
cartService = {
  getCart(),
  addToCart(productId, quantity),
  updateCartItem(itemId, quantity),
  removeFromCart(itemId),
  clearCart()
}
```

### Admin Services
```javascript
adminService = {
  // Product management
  createProduct(productData),
  updateProduct(id, productData),
  deleteProduct(id),
  
  // Order management
  getAllOrders(filters),
  updateOrderStatus(id, status),
  
  // Dashboard
  getDashboardStats()
}
```

## Styling & Theming

### Tailwind Configuration
- **Primary Colors**: Blue palette (#3b82f6, #2563eb, #1d4ed8)
- **Secondary Colors**: Gray palette (#64748b, #475569, #334155)
- **Custom Classes**: btn-primary, btn-secondary

### CSS Architecture
- **Utility-first**: Sử dụng Tailwind classes
- **Component-scoped**: Custom components với Tailwind
- **Responsive**: Mobile-first design approach

## Authentication Flow

### Login Process
1. User submits credentials
2. API call to `/auth/login`
3. Token stored in localStorage
4. User state updated in AuthContext
5. Redirect to appropriate page

### Route Protection
- **AdminRoute**: Checks user role before access
- **Token Validation**: Auto-logout on token expiry
- **Persistent Login**: Token verification on app load

## Cart Management

### Cart State
- **Local Storage**: Cart persistence
- **Context State**: Real-time cart updates
- **API Integration**: Server-side cart sync

### Cart Operations
- **Add to Cart**: Product addition with quantity
- **Update Quantity**: Modify item quantities
- **Remove Items**: Delete cart items
- **Clear Cart**: Empty entire cart

## Development Workflow

### Scripts
```bash
npm start      # Development server
npm build      # Production build
npm test       # Run tests
npm eject      # Eject from Create React App
```

### Environment Variables
- `REACT_APP_API_URL`: Production API URL
- `REACT_APP_API_URL_LOCAL`: Development API URL

## Best Practices

### Code Organization
- **Separation of Concerns**: Clear separation between UI, logic, and data
- **Component Reusability**: Common components for consistency
- **Context Usage**: Global state management for auth and cart

### Error Handling
- **API Interceptors**: Centralized error handling
- **User Feedback**: Toast notifications for user actions
- **Fallback UI**: Error boundaries and loading states

### Performance
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Optimization**: React.memo for expensive components

## Security Considerations

### Token Management
- **Secure Storage**: localStorage for token persistence
- **Auto Refresh**: Token refresh mechanism
- **Logout on Expiry**: Automatic logout on token expiry

### Route Protection
- **Role-based Access**: Admin route protection
- **Authentication Guards**: Login requirement for protected routes

## Future Enhancements

### Planned Features
- **Product Search**: Advanced search functionality
- **User Profiles**: User account management
- **Order History**: Order tracking and history
- **Payment Integration**: Payment gateway integration
- **Real-time Updates**: WebSocket integration for real-time features

### Technical Improvements
- **State Management**: Redux integration for complex state
- **Testing**: Comprehensive test coverage
- **Performance**: Bundle optimization and lazy loading
- **Accessibility**: WCAG compliance
- **PWA**: Progressive Web App features