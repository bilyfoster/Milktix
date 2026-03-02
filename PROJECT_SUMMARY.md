# MilkTix - Project Summary

## Overview
A modern event ticketing platform built with Java Spring Boot backend and React TypeScript frontend. Replaces the WordPress version with a custom-built solution.

## Architecture

### Backend (Java 21 + Spring Boot)
- **Framework**: Spring Boot 3.2.3
- **Database**: PostgreSQL (production), H2 (development)
- **Security**: JWT authentication with Spring Security
- **Payment**: Stripe integration
- **QR Codes**: ZXing library for ticket generation

### Frontend (React 18 + TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (auth), React Query (server state)
- **Payments**: Stripe Elements
- **Routing**: React Router

## Features Implemented

### ✅ Completed
1. **User Management**
   - Registration/Login with JWT
   - Role-based access (Admin, Organizer, Attendee)
   - Password hashing with BCrypt

2. **Event Management**
   - Create, read events
   - Event categories
   - Multiple ticket types per event
   - Event status (Draft, Published, Cancelled, Completed)
   - Venue information with address

3. **Ticketing System**
   - Multiple ticket types (GA, VIP, etc.)
   - Price tiers
   - Inventory management
   - Min/max per order limits
   - Sales window (start/end dates)

4. **Order & Payment**
   - Cart functionality
   - Stripe payment integration
   - Order creation and tracking
   - Fee calculation (2.9% + $0.30)

5. **QR Code Generation**
   - Unique ticket numbers
   - QR codes for check-in
   - Ticket verification endpoint

6. **Frontend UI**
   - Responsive design
   - Event listing page
   - Event detail page with ticket selection
   - Login/Register pages
   - Checkout modal with Stripe

### 🚧 In Progress / TODO
1. **Email Notifications**
   - Send tickets via email
   - Order confirmations
   - Event reminders

2. **Admin Dashboard**
   - Event analytics
   - Sales reports
   - User management
   - Check-in interface

3. **Check-in System**
   - Mobile scanner app
   - Real-time check-in tracking
   - Attendee list export

4. **Additional Features**
   - Event search/filter
   - Past events archive
   - Organizer profiles
   - Event images/upload
   - Refund processing
   - Promo codes

## Project Structure

```
milktix/
├── backend/
│   ├── src/main/java/com/milktix/
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── service/         # Business logic
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── security/        # JWT, auth filters
│   │   └── config/          # Configuration
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
│   │   ├── utils/           # API client
│   │   ├── types/           # TypeScript types
│   │   └── hooks/           # Custom hooks
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - List published events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create event (Organizer/Admin)

### Categories
- `GET /api/categories` - List categories

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/{id}/payment-intent` - Create Stripe payment intent
- `GET /api/orders/my` - Get my orders

### Tickets
- `GET /api/tickets/my` - Get my tickets
- `POST /api/tickets/{number}/checkin` - Check in ticket
- `GET /api/tickets/{number}/verify` - Verify ticket

## Environment Variables

### Backend
```
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend
```
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Running Locally

### Option 1: Docker Compose (Recommended)
```bash
cd /root/.openclaw/workspace/projects/milktix
docker-compose up -d
```

### Option 2: Manual
```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Deployment

### Build for Production
```bash
# Backend
cd backend
./mvnw clean package -DskipTests

# Frontend
cd frontend
npm run build
```

### Deploy to Server
1. Copy `backend/target/*.jar` to server
2. Copy `frontend/dist/` to web server
3. Set environment variables
4. Run with `java -jar milktix-backend.jar`

## Next Steps

1. **Test the application** - Run locally and verify all features work
2. **Add email service** - Integrate SendGrid/AWS SES for ticket emails
3. **Build admin dashboard** - Create organizer/admin interface
4. **Mobile check-in app** - Build scanner for ticket validation
5. **Deploy to production** - Set up on your server

## Comparison to MenPlayPHX

MilkTix now has:
- ✅ Event listings with images and descriptions
- ✅ Multiple ticket types and pricing
- ✅ Secure payment processing
- ✅ User accounts and authentication
- ✅ QR code tickets for check-in
- ✅ Mobile-responsive design

Missing (to add):
- Email ticket delivery
- Admin event management UI
- Check-in scanner interface
- Event categories/tags display
- Past events archive