# MilkTix Feature Implementation Task

## Priority Features for Overnight Development

### 1. Artist/Organizer Flow
- [ ] Sign up / Register as organizer
- [ ] Create event (title, description, date, venue, image)
- [ ] Manage event (edit, publish/unpublish, cancel)
- [ ] Create ticket types (GA, VIP, Early Bird, etc.)
- [ ] Manage tickets (pricing, quantity, availability dates)
- [ ] Check-in guests (QR code scanner or manual entry)

### 2. Guest/Attendee Flow
- [ ] Browse events
- [ ] Save/bookmark events (wishlist)
- [ ] Buy tickets (select ticket type, quantity, checkout)
- [ ] View ticket history (past purchases)
- [ ] Show digital ticket (QR code for entry)

### 3. UI Cleanup
- [ ] Remove all sales copy from Home page
- [ ] Remove fake numbers ("10,000+ organizers", "$24,580 revenue", etc.)
- [ ] Replace with actual content or remove entirely

### 4. Backend API Requirements
- [ ] Authentication endpoints (register, login, JWT)
- [ ] Event CRUD endpoints
- [ ] Ticket type CRUD endpoints
- [ ] Order/purchase endpoints
- [ ] Check-in endpoints
- [ ] User profile endpoints (saved events, order history)

### 5. Database Schema
- [ ] Users table (organizers vs attendees)
- [ ] Events table
- [ ] TicketTypes table
- [ ] Orders table
- [ ] OrderItems table
- [ ] SavedEvents table (wishlist)
- [ ] CheckIns table

## Technical Notes
- Backend: Java Spring Boot
- Frontend: React + TypeScript + Tailwind
- Database: PostgreSQL
- Authentication: JWT tokens
- Mobile-first responsive design

## Files to Modify
- Backend:
  - AuthController.java
  - EventController.java
  - TicketController.java
  - OrderController.java
  - UserController.java
  - Various Entity classes
  - Repository interfaces
  - SecurityConfig.java

- Frontend:
  - Home.tsx (remove sales copy)
  - Register.tsx (add organizer option)
  - New: OrganizerDashboard.tsx
  - New: CreateEvent.tsx
  - New: ManageTickets.tsx
  - New: CheckIn.tsx
  - New: SavedEvents.tsx
  - New: OrderHistory.tsx
  - authStore.ts (update for roles)
