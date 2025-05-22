# Veje's Subscription Box API

A robust RESTful API for managing a subscription-based fruits and vegetables e-commerce platform built with Node.js, Express, TypeORM, and PostgreSQL.

## System Architecture

### Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Payment Integration**: Mobile Money, Visa

### Core Components

#### 1. Authentication Service

- User registration and authentication
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control (Customer, Admin)
- Rate limiting middleware

#### 2. Product Management System

- Product catalog with categories (fruits, vegetables)
- Inventory tracking and management
- Product metadata (nutritional info, origin, etc.)

#### 3. Subscription Management

- Subscription plans and pricing tiers
- Recurring billing integration
- Subscription lifecycle management
- Box customization options

#### 4. Order Processing

- Shopping cart functionality
- Checkout process
- Order status tracking
- Order history

#### 5. Loyalty & Promotion Engine

- Points accumulation and redemption
- Referral tracking and rewards
- Coupon code generation and validation
- Dynamic discount application

#### 6. Payment Gateway Integration

- Secure payment processing
- Multiple payment method support
- Transaction logging
- Refund processing

#### 7. Delivery Management

- Delivery scheduling
- Address validation
- Delivery status tracking
- Integration with delivery providers

#### 8. Analytics & Reporting

- Sales and revenue reports
- Customer acquisition metrics
- Subscription retention analytics
- Inventory forecasting

#### 9. Admin Dashboard API

- Customer management
- Order administration
- Inventory control
- System configuration

## Database Schema

### Key Entities

1. **Users**

   - id (PK)
   - email
   - password (hashed)
   - firstName
   - lastName
   - role (enum: customer, admin)
   - phoneNumber
   - createdAt
   - updatedAt

2. **Products**

   - id (PK)
   - name
   - description
   - category (enum: fruit, vegetable)
   - price
   - unit (enum: kg, piece, bunch)
   - imageUrl
   - nutritionalInfo
   - origin
   - inStock
   - stockQuantity
   - createdAt
   - updatedAt

3. **SubscriptionPlans**

   - id (PK)
   - name
   - description
   - price
   - frequency (enum: weekly, biweekly, monthly)
   - boxSize
   - isActive
   - createdAt
   - updatedAt

4. **Subscriptions**

   - id (PK)
   - userId (FK)
   - planId (FK)
   - status (enum: active, paused, cancelled)
   - startDate
   - nextDeliveryDate
   - paymentMethod
   - createdAt
   - updatedAt

5. **Orders**

   - id (PK)
   - userId (FK)
   - subscriptionId (FK, nullable for one-time orders)
   - status (enum: pending, processing, shipped, delivered, cancelled)
   - totalAmount
   - paymentStatus
   - deliveryAddress
   - deliveryDate
   - createdAt
   - updatedAt

6. **OrderItems**

   - id (PK)
   - orderId (FK)
   - productId (FK)
   - quantity
   - unitPrice
   - subtotal

7. **ShoppingCart**

   - id (PK)
   - userId (FK)
   - createdAt
   - updatedAt

8. **CartItems**

   - id (PK)
   - cartId (FK)
   - productId (FK)
   - quantity
   - addedAt

9. **LoyaltyPoints**

   - id (PK)
   - userId (FK)
   - points
   - transactionType (enum: earned, redeemed)
   - source (enum: purchase, referral, subscription)
   - transactionDate

10. **Referrals**

    - id (PK)
    - referrerId (FK to Users)
    - referredUserId (FK to Users)
    - status (enum: pending, completed)
    - reward
    - createdAt

11. **Coupons**

    - id (PK)
    - code
    - discountType (enum: percentage, fixed)
    - discountValue
    - minOrderValue
    - maxUsage
    - currentUsage
    - expiryDate
    - isActive

12. **Payments**

    - id (PK)
    - orderId (FK)
    - amount
    - paymentMethod
    - transactionId
    - status
    - paymentDate

13. **Deliveries**
    - id (PK)
    - orderId (FK)
    - status
    - trackingNumber
    - deliveryPartner
    - estimatedDeliveryDate
    - actualDeliveryDate
    - notes

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/refresh-token` - Refresh JWT
- `POST /api/auth/logout` - Logout (invalidate token)
- `GET /api/auth/me` - Get current user details

### Products

- `GET /api/products` - List all products (paginated)
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories` - List product categories
- `GET /api/products/category/:category` - List products by category
- `POST /api/products` - Create a product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Subscription Plans

- `GET /api/subscription-plans` - List all subscription plans
- `GET /api/subscription-plans/:id` - Get plan details
- `POST /api/subscription-plans` - Create a plan (admin)
- `PUT /api/subscription-plans/:id` - Update a plan (admin)
- `DELETE /api/subscription-plans/:id` - Delete a plan (admin)

### Subscriptions

- `GET /api/subscriptions` - List user's subscriptions
- `GET /api/subscriptions/:id` - Get subscription details
- `POST /api/subscriptions` - Create a new subscription
- `PUT /api/subscriptions/:id` - Update subscription (pause, resume, modify)
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Shopping Cart

- `GET /api/cart` - View shopping cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders

- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/cancel` - Cancel an order

### Checkout

- `POST /api/checkout` - Process checkout
- `GET /api/checkout/payment-methods` - List available payment methods

### Loyalty & Referrals

- `GET /api/loyalty/points` - Get user's loyalty points
- `GET /api/loyalty/history` - View points history
- `POST /api/loyalty/redeem` - Redeem points
- `POST /api/referrals/generate` - Generate referral code
- `GET /api/referrals` - List user's referrals

### Coupons

- `GET /api/coupons` - List available coupons
- `POST /api/coupons/validate` - Validate a coupon code
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)

### Admin

- `GET /api/admin/users` - List all users
- `GET /api/admin/orders` - List all orders with filters
- `GET /api/admin/inventory` - Inventory status
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/subscriptions` - Subscription analytics

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/VejeStore/Veje_BE
   cd vejes-subscription-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```
   # Server
   PORT=3000
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=veje_subscription
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_secure_jwt_secret

   # Payment Integration
   PAYPCK_API_KEY=your_mobile_money_key

   ```

4. **Set up the database**

   ```bash
   # Create PostgreSQL database
   psql -U postgres -c "CREATE DATABASE veje_subscription"

   # Run migrations
   npm run typeorm migration:run
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the API documentation**
   Open your browser and go to `http://localhost:3000/api-docs`

## Development Guidelines

### Directory Structure

```
project-root/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── entities/         # TypeORM entities
│   ├── migrations/       # Database migrations
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── validators/       # Input validation
│   ├── app.ts            # Express app setup
│   └── server.ts         # Entry point
├── tests/                # Test files
├── .env                  # Environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

### Coding Standards

- Follow ESLint and Prettier configurations
- Write unit tests for all services
- Document all functions and endpoints
- Follow REST API best practices

### Commit Guidelines

- Use conventional commit messages
- Run tests before committing

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/auth.test.ts

# Generate test coverage
npm run test:coverage
```

## Deployment

### Production Setup

1. Configure production environment variables
2. Build the application
   ```bash
   npm run build
   ```
3. Start the production server
   ```bash
   npm start
   ```

## Security Considerations

- All API endpoints except authentication and product listing require JWT authentication
- Passwords are hashed using bcrypt with appropriate salt rounds
- Implement rate limiting on authentication endpoints to prevent brute force attacks
- Use HTTPS in production
- Sanitize all user inputs to prevent SQL injection
- Implement proper error handling to avoid information leakage
