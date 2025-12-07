# 🚗 Vehicle Rental System API

A robust backend API for managing a vehicle rental system with user authentication, role-based authorization, and comprehensive booking management.

## 🌐 Live API

**Base URL:** `https://your-project-name.vercel.app`

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

- **User Management**
  - User registration with role-based access (Admin/Customer)
  - Secure authentication using JWT
  - Password hashing with bcrypt
  - Profile management

- **Vehicle Management**
  - CRUD operations for vehicles
  - Vehicle availability tracking
  - Support for multiple vehicle types (car, bike, van, SUV)
  - Admin-only vehicle operations

- **Booking System**
  - Create and manage vehicle bookings
  - Automatic price calculation based on rental duration
  - Real-time vehicle availability updates
  - Role-based booking permissions
  - Booking status management (active, cancelled, returned)

- **Security**
  - JWT-based authentication
  - Role-based authorization
  - Password encryption
  - SQL injection prevention
  - Input validation

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Deployment:** Vercel

## 📊 Database Schema

### Users Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password | TEXT | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| role | VARCHAR(20) | CHECK (admin/customer) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Vehicles Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| vehicle_name | VARCHAR(200) | NOT NULL |
| type | VARCHAR(20) | CHECK (car/bike/van/SUV) |
| registration_number | VARCHAR(50) | UNIQUE, NOT NULL |
| daily_rent_price | DECIMAL(10,2) | NOT NULL, > 0 |
| availability_status | VARCHAR(20) | CHECK (available/booked) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### Bookings Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| customer_id | INTEGER | FOREIGN KEY (users.id) |
| vehicle_id | INTEGER | FOREIGN KEY (vehicles.id) |
| rent_start_date | DATE | NOT NULL |
| rent_end_date | DATE | NOT NULL, > start_date |
| total_price | DECIMAL(10,2) | NOT NULL, > 0 |
| status | VARCHAR(20) | CHECK (active/cancelled/returned) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```
git clone https://github.com/israk03/vehicle-rental-system.git
cd vehicle-rental-system
```

2. **Install dependencies**
```
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```
PORT=5000
CONNECTION_STR=postgresql://username:password@localhost:5432/vehicle_rental
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

4. **Create PostgreSQL database**
```
psql -U postgres
CREATE DATABASE vehicle_rental;
\q
```

5. **Run the application**

Development mode:
```
npm run dev
```

Build for production:
```
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 5000 |
| CONNECTION_STR | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| JWT_SECRET | Secret key for JWT signing | your_secret_key_min_32_chars |
| JWT_EXPIRES_IN | JWT token expiration time | 7d |
| NODE_ENV | Environment mode | development/production |

## 📡 API Endpoints

### Authentication

#### Register User
```
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "phone": "01712345678",
  "role": "customer"
}
```

**Response (201):**
```
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "01712345678",
    "role": "customer"
  }
}
```

#### Login User
```
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01712345678",
      "role": "customer"
    }
  }
}
```

---

### Vehicles

#### Create Vehicle (Admin Only)
```
POST /api/v1/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_name": "Toyota Camry 2024",
  "type": "car",
  "registration_number": "ABC-1234",
  "daily_rent_price": 50,
  "availability_status": "available"
}
```

#### Get All Vehicles (Public)
```
GET /api/v1/vehicles
```

#### Get Vehicle by ID (Public)
```
GET /api/v1/vehicles/:vehicleId
```

#### Update Vehicle (Admin Only)
```
PUT /api/v1/vehicles/:vehicleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicle_name": "Toyota Camry 2024 Premium",
  "daily_rent_price": 55
}
```

#### Delete Vehicle (Admin Only)
```
DELETE /api/v1/vehicles/:vehicleId
Authorization: Bearer <token>
```

---

### Users

#### Get All Users (Admin Only)
```
GET /api/v1/users
Authorization: Bearer <token>
```

#### Update User (Admin or Own Profile)
```
PUT /api/v1/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "01799999999"
}
```

#### Delete User (Admin Only)
```
DELETE /api/v1/users/:userId
Authorization: Bearer <token>
```

---

### Bookings

#### Create Booking (Customer/Admin)
```
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "vehicle_id": 2,
  "rent_start_date": "2025-12-10",
  "rent_end_date": "2025-12-15"
}
```

**Response (201):**
```
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "vehicle_id": 2,
    "rent_start_date": "2025-12-10",
    "rent_end_date": "2025-12-15",
    "total_price": "250.00",
    "status": "active",
    "vehicle": {
      "vehicle_name": "Honda Civic 2023",
      "daily_rent_price": "50.00"
    }
  }
}
```

#### Get All Bookings (Role-Based)
```
GET /api/v1/bookings
Authorization: Bearer <token>
```

**Admin:** Returns all bookings with customer details  
**Customer:** Returns only their own bookings

#### Update Booking (Role-Based)
```
PUT /api/v1/bookings/:bookingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Customer:** Can cancel their bookings before start date  
**Admin:** Can mark bookings as returned

---

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Token Generation
- Tokens are generated upon successful login
- Default expiration: 7 days
- Token contains user ID, name, email, and role

### Role-Based Access

| Endpoint | Admin | Customer |
|----------|-------|----------|
| POST /vehicles | ✅ | ❌ |
| GET /vehicles | ✅ | ✅ |
| PUT /vehicles/:id | ✅ | ❌ |
| DELETE /vehicles/:id | ✅ | ❌ |
| GET /users | ✅ | ❌ |
| PUT /users/:id | ✅ | ✅ (own only) |
| DELETE /users/:id | ✅ | ❌ |
| POST /bookings | ✅ | ✅ (own only) |
| GET /bookings | ✅ (all) | ✅ (own only) |
| PUT /bookings/:id | ✅ | ✅ (own only) |

## 🧪 Testing

### Using Postman

1. Import the Postman collection (if provided)
2. Set environment variables:
   - `base_url`: `http://localhost:5000` or your deployed URL
   - `admin_token`: Token from admin login
   - `customer_token`: Token from customer login

### Manual Testing

1. **Register an admin user** (role: "admin")
2. **Login** to get JWT token
3. **Create vehicles** using admin token
4. **Register a customer** (role: "customer")
5. **Create bookings** using customer token
6. **Test various endpoints** with appropriate tokens

### Test Scenarios

- ✅ User registration with validation
- ✅ Login with correct/incorrect credentials
- ✅ Vehicle CRUD operations
- ✅ Booking creation with price calculation
- ✅ Role-based access control
- ✅ Booking cancellation rules
- ✅ Vehicle availability updates
- ✅ Deletion constraints (active bookings)

## 📦 Deployment

### Deploy to Vercel

1. **Prepare the project**
   - Ensure `vercel.json` exists in root
   - Update `src/server.ts` to export app

2. **Set up database**
   - Create PostgreSQL database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
   - Note the connection string

3. **Push to GitHub**
```
git add .
git commit -m "Ready for deployment"
git push origin main
```

4. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `CONNECTION_STR`
     - `JWT_SECRET`
     - `PORT`
     - `NODE_ENV`
   - Click Deploy

5. **Verify deployment**
   - Visit your deployed URL
   - Test health check endpoint
   - Test user registration and login

## 📁 Project Structure

vehicle-rental-system/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── index.ts           # Environment configuration
│   │   └── db.ts              # Database connection & initialization
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── logger.ts          # Request logging middleware
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.service.ts
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.service.ts
│   │   ├── vehicle/
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── vehicle.controller.ts
│   │   │   └── vehicle.service.ts
│   │   └── booking/
│   │       ├── booking.routes.ts
│   │       ├── booking.controller.ts
│   │       └── booking.service.ts
│   └── types/
│       └── express/
│           └── index.d.ts     # TypeScript type extensions
├── .env                       # Environment variables (not in repo)
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🔧 Scripts

```
# Development
npm run dev          # Run with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Run compiled code

# Deployment
npm run vercel-build # Vercel build command
```

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server errors |

### Error Response Format

```
{
  "success": false,
  "message": "Error description",
  "errors": "Detailed error information"
}
```





## 👤 Author

- Name: Mohammad Israk Chowdhury
- GitHub: [@israk03](https://github.com/israk03)
- Email: israkchowdhury03@gmail.com

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [JWT](https://jwt.io/) - Authentication
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vercel](https://vercel.com/) - Deployment platform

---

**Built with ❤️ for Apollo Level 2 Web Development Course**
```

***
