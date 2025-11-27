# Feedback System - Implementation Guide

## Quick Start

### For Backend Developers

1. **Build the backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

2. **Verify endpoints are accessible**
   - POST `/api/feedbacks` - Create feedback
   - GET `/api/feedbacks/product/{productId}` - List feedbacks
   - GET `/api/feedbacks/product/{productId}?rating=5` - Filter by rating
   - GET `/api/feedbacks/my-feedbacks` - Get my feedbacks
   - PUT `/api/feedbacks/{id}` - Update feedback
   - DELETE `/api/feedbacks/{id}` - Delete feedback
   - GET `/api/feedbacks/stats/product/{productId}` - Get stats

3. **Database Setup**
   - Create table via migration or JPA auto-ddl
   - Schema will be auto-created if using `spring.jpa.hibernate.ddl-auto=update`

### For Frontend Developers

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Test the feature**
   - Login as customer
   - Navigate to `/feedbacks` page
   - Select a completed order
   - Select a product from the order
   - Rate and write feedback
   - Submit

### For QA Testers

#### Test Scenarios

**Scenario 1: Create Feedback**
- [ ] Login as customer
- [ ] Navigate to `/feedbacks` page
- [ ] Click "Viết đánh giá mới" (Write new feedback)
- [ ] Select a completed order from dropdown
- [ ] Products from order appear in dropdown
- [ ] Select a product
- [ ] Rate with stars (1-5)
- [ ] Write feedback content (max 500 chars)
- [ ] Submit feedback
- [ ] Success message displayed
- [ ] Form resets

**Scenario 2: View Product Feedbacks**
- [ ] Go to product detail page
- [ ] Scroll to feedback section
- [ ] See feedbacks sorted by date (newest first)
- [ ] See customer names, ratings, dates, content
- [ ] See rating statistics bar chart with distribution
- [ ] See average rating prominently displayed
- [ ] Filter by rating (1-5 stars)
- [ ] Pagination works (next/previous pages)

**Scenario 3: Manage Own Feedbacks**
- [ ] Login as customer
- [ ] Navigate to `/feedbacks` page
- [ ] See all feedbacks you've submitted
- [ ] Click edit on a feedback
- [ ] Modify rating and content
- [ ] Click update
- [ ] See updated feedback
- [ ] Click delete
- [ ] Confirmation dialog appears
- [ ] Feedback removed after confirmation

**Scenario 4: Prevent Duplicate**
- [ ] Submit feedback for product A
- [ ] Try to submit another feedback for same product
- [ ] System shows error: "Bạn đã đánh giá sản phẩm này rồi"
- [ ] Cannot submit duplicate

**Scenario 5: Authorization**
- [ ] Login as customer A
- [ ] View customer B's feedback
- [ ] Edit/delete buttons not visible
- [ ] If you try to manually call API to delete another's feedback
- [ ] Get 401 Unauthorized response

## Architecture Diagrams

### Data Flow - Create Feedback
```
Customer (Frontend)
    ↓
FeedbackForm Component
    ↓
POST /api/feedbacks (with JWT token)
    ↓
FeedbackController.createFeedback()
    ↓
FeedbackService.createFeedback()
    ├─ Check duplicate (existsByCustomerIdAndProductId)
    ├─ Create Feedback entity
    └─ Save to database
    ↓
Return FeedbackDTO
    ↓
Display success message
```

### Data Flow - List Feedbacks
```
Product Detail Page
    ↓
FeedbackList Component
    ↓
GET /api/feedbacks/product/{productId}?rating={optional}
    ↓
FeedbackController.getFeedbacksByProduct()
    ↓
FeedbackService.getFeedbacksByProductAndRating() [if rating filter]
    OR
FeedbackService.getFeedbacksByProduct() [if no filter]
    ↓
Return Page<FeedbackDTO>
    ↓
Render feedback list with pagination
```

### Rating Stats Flow
```
Product Detail Page
    ↓
RatingStats Component
    ↓
GET /api/feedbacks/stats/product/{productId}
    ↓
FeedbackService.getRatingStats()
    ├─ Get all feedbacks for product
    ├─ Calculate average rating
    ├─ Count each rating (5★, 4★, 3★, 2★, 1★)
    └─ Return RatingStatsDTO
    ↓
Render as bar chart with percentages
```

## Configuration

### Backend Configuration
No additional configuration needed. All defaults work.

Optional in `application.yml`:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Create/update tables automatically
    show-sql: false
    properties:
      hibernate:
        format_sql: true
```

### Frontend Configuration
Set API base URL in `src/api/index.js`:
```javascript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
```

## Localization

All user-facing strings are in translation files:
- `src/locales/vi/common.json` - Vietnamese
- `src/locales/en/common.json` - English
- `src/locales/ja/common.json` - Japanese

To add new strings:
1. Add key to all 3 translation files
2. Import `useLanguage()` hook
3. Use `t('feedback.keyName')`

## Troubleshooting

### Issue: "Bạn đã đánh giá sản phẩm này rồi"
**Solution**: This is expected behavior. Each customer can only rate a product once.

### Issue: Completed orders not showing
**Problem**: `orderService.getCompletedOrders()` might be calling wrong endpoint
**Solution**: Verify backend endpoint returns orders with status="COMPLETED"

### Issue: Cannot edit/delete own feedbacks
**Problem**: Authorization check failing
**Solution**: Verify JWT token is being sent in Authorization header

### Issue: Rating filter not working
**Problem**: API not receiving rating parameter
**Solution**: Check `getFeedbacksByProduct` is passing rating to URL params

### Issue: Form says "Chưa có đơn hàng hoàn thành nào"
**Problem**: Customer has no completed orders
**Solution**: Create and complete an order first

## API Contract

### Create Feedback
```
POST /api/feedbacks
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "product_id": 123,
  "rate": 5,
  "content": "Great product!"
}

Response 201:
{
  "feedback_id": 1,
  "customer_id": 1,
  "product_id": 123,
  "date": "2024-01-15T10:30:00",
  "rate": 5,
  "content": "Great product!",
  "status": true,
  "customer_name": "John Doe",
  "product_name": "iPhone 15"
}
```

### List Feedbacks with Filter
```
GET /api/feedbacks/product/123?rating=5&page=0&size=10
Content-Type: application/json

Response 200:
{
  "content": [{...}, {...}],
  "totalPages": 3,
  "totalElements": 25,
  "currentPage": 0,
  "size": 10
}
```

### Get Rating Stats
```
GET /api/feedbacks/stats/product/123

Response 200:
{
  "average_rating": 4.5,
  "total_reviews": 100,
  "five_star_count": 60,
  "four_star_count": 30,
  "three_star_count": 8,
  "two_star_count": 1,
  "one_star_count": 1
}
```

## Performance Notes

- Feedback queries use indexes on (product_id, date) for efficient sorting
- Rating stats are calculated on-demand (not cached)
- Consider caching stats in Redis if many requests
- Pagination prevents loading all feedbacks at once
- Frontend lazy-loads feedback components

## Security Notes

- All endpoints check JWT authentication
- Customers can only edit/delete their own feedbacks
- SQL injection prevented via JPA parameterized queries
- XSS prevention through React's built-in escaping
- CSRF token handled by Spring Security

## Future Enhancements

See `FEEDBACK_SYSTEM_SUMMARY.md` for planned features.
