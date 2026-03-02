# MilkTix API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "usernameOrEmail": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "type": "Bearer",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "ATTENDEE"
  }
}
```

## Events

### List Events
```http
GET /events
```

Returns all published upcoming events.

### Get Event Details
```http
GET /events/{id}
```

### Create Event (Organizer/Admin only)
```http
POST /events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Summer Pool Party",
  "description": "Join us for fun!",
  "startDateTime": "2026-06-15T14:00:00",
  "endDateTime": "2026-06-15T22:00:00",
  "venueName": "The W Hotel",
  "venueAddress": "7277 E Camelback Rd",
  "venueCity": "Scottsdale",
  "venueState": "AZ",
  "venueZip": "85251",
  "categoryIds": ["uuid1", "uuid2"],
  "ticketTypes": [
    {
      "name": "General Admission",
      "description": "Access to pool party",
      "price": 25.00,
      "quantityAvailable": 100
    },
    {
      "name": "VIP",
      "description": "VIP area + drinks",
      "price": 75.00,
      "quantityAvailable": 50
    }
  ]
}
```

## Categories

### List Categories
```http
GET /categories
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Pool Party",
    "description": "Summer pool parties",
    "color": "#3B82F6"
  }
]
```

## Orders

### Create Order
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": "uuid",
  "items": [
    {
      "ticketTypeId": "uuid",
      "quantity": 2
    }
  ],
  "billingName": "John Doe",
  "billingEmail": "john@example.com"
}
```

### Get My Orders
```http
GET /orders/my
Authorization: Bearer {token}
```

## Tickets

### Get My Tickets
```http
GET /tickets/my
Authorization: Bearer {token}
```

### Check In Ticket (Organizer/Admin only)
```http
POST /tickets/{ticketNumber}/checkin
Authorization: Bearer {token}
```

## Error Responses

```json
{
  "timestamp": "2026-03-01T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Error description",
  "path": "/api/events"
}
```