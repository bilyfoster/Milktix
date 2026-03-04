# MilkTix Enterprise Roadmap

## Current Status (v1.0.3)

### ✅ What's Built (MVP)

**Backend (Java Spring Boot):**
- JWT authentication with 3 roles: ADMIN, ORGANIZER, ATTENDEE
- Basic event CRUD (create by organizer/admin)
- Ticket types management
- Order creation with Stripe payment intent
- QR code generation for tickets
- Basic check-in endpoint
- PostgreSQL database

**Frontend (React + TypeScript):**
- Public event listing
- Event detail page with ticket selection
- Working login/register (just fixed!)
- Basic checkout modal
- Responsive design

---

## Phase 1: Core Platform (User Management) 🔴 CRITICAL

### Missing: Organizer Request & Approval Workflow
```
Current: Users register → All are ATTENDEES
Needed: Users register → Can request ORGANIZER role → Admin approves
```

**Backend Tasks:**
- [ ] Create `OrganizerRequest` entity (userId, status: PENDING/APPROVED/REJECTED, businessName, taxId, etc.)
- [ ] `POST /api/organizer/request` - Submit request
- [ ] `GET /api/admin/organizer-requests` - List pending
- [ ] `POST /api/admin/organizer-requests/{id}/approve` - Approve
- [ ] `POST /api/admin/organizer-requests/{id}/reject` - Reject
- [ ] Email notification on approval/rejection

**Frontend Tasks:**
- [ ] "Become an Organizer" page with application form
- [ ] Request status page for users
- [ ] Admin queue for approvals

### Missing: User Profile Management
- [ ] `GET/PUT /api/users/profile` - View/update profile
- [ ] `POST /api/users/change-password`
- [ ] `POST /api/users/avatar` - Upload profile picture
- [ ] Profile page UI
- [ ] "My Tickets" page (exists backend, needs UI)

### Missing: Password Reset Flow
- [ ] `POST /api/auth/forgot-password` - Send reset email
- [ ] `POST /api/auth/reset-password` - Reset with token
- [ ] Email template for password reset

---

## Phase 2: Organizer Dashboard 🔴 CRITICAL

### Missing: Organizer Dashboard UI
```
Current: No organizer-specific UI
Needed: Full dashboard for event management
```

**Pages Needed:**
- [ ] `/organizer/dashboard` - Overview with stats
- [ ] `/organizer/events` - My events list
- [ ] `/organizer/events/create` - Create event (form exists, needs improvement)
- [ ] `/organizer/events/{id}/edit` - Edit event
- [ ] `/organizer/events/{id}/tickets` - Manage ticket types
- [ ] `/organizer/events/{id}/orders` - View orders
- [ ] `/organizer/events/{id}/attendees` - Guest list
- [ ] `/organizer/events/{id}/check-in` - Check-in interface
- [ ] `/organizer/reports` - Event reports

**Backend APIs Needed:**
- [ ] `GET /api/organizer/events` - My events
- [ ] `GET /api/organizer/events/{id}/stats` - Event stats (tickets sold, revenue)
- [ ] `GET /api/organizer/events/{id}/attendees` - Attendee list with filters
- [ ] `PUT /api/events/{id}` - Update event
- [ ] `DELETE /api/events/{id}` - Cancel event
- [ ] `PUT /api/ticket-types/{id}` - Update ticket type
- [ ] `DELETE /api/ticket-types/{id}` - Delete ticket type

---

## Phase 3: Admin Dashboard 🔴 CRITICAL

### Missing: Admin Control Panel

**User Management:**
- [ ] `GET /api/admin/users` - List all users with filters
- [ ] `PUT /api/admin/users/{id}/role` - Change role
- [ ] `PUT /api/admin/users/{id}/status` - Activate/deactivate
- [ ] `GET /api/admin/users/{id}/orders` - User's order history

**Event Management:**
- [ ] `GET /api/admin/events` - All events with filters
- [ ] `PUT /api/admin/events/{id}/status` - Change status (publish/unpublish)
- [ ] `DELETE /api/admin/events/{id}` - Delete event

**Organizer Request Management:**
- [ ] See Phase 1

**Platform Configuration:**
- [ ] `GET/PUT /api/admin/config` - Platform settings
  - Platform fee percentage
  - Fixed fee amount
  - Stripe settings
  - Email settings
  - etc.

**Admin Dashboard UI:**
- [ ] `/admin/dashboard` - Platform overview stats
- [ ] `/admin/users` - User management
- [ ] `/admin/events` - Event moderation
- [ ] `/admin/organizer-requests` - Approval queue
- [ ] `/admin/settings` - Platform configuration
- [ ] `/admin/reports` - Platform-wide reports

---

## Phase 4: Check-in System 🔴 CRITICAL

### Missing: Mobile-Friendly Check-in Interface

**Backend:**
- [ ] `POST /api/checkin/verify` - Verify ticket (returns ticket info)
- [ ] `POST /api/checkin` - Mark as checked in
- [ ] `POST /api/checkin/undo` - Undo check-in (for mistakes)
- [ ] `GET /api/events/{id}/checkin-stats` - Check-in statistics
- [ ] WebSocket for real-time check-in updates

**Frontend:**
- [ ] `/checkin` - Mobile-optimized check-in page
- [ ] QR code scanner (using camera)
- [ ] Manual ticket number entry
- [ ] Attendee list with search
- [ ] Real-time stats during event

**Features:**
- [ ] Offline mode (sync when back online)
- [ ] Multiple check-in stations per event
- [ ] Check-in by ticket type (e.g., VIP only)

---

## Phase 5: Payments, Fees & Payouts 🔴 CRITICAL

### Current State
- Stripe payment intent created
- Basic order creation

### Missing: Complete Payment Flow

**Fee Structure:**
- [ ] Platform fee configuration (%, fixed amount)
- [ ] Fee display during checkout
- [ ] Organizer payout calculation

**Stripe Integration:**
- [ ] Proper webhook handling for:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- [ ] Sandbox vs Production mode toggle
- [ ] Save Stripe customer for reuse

**Payouts to Organizers:**
- [ ] `GET /api/organizer/payouts` - Payout history
- [ ] `GET /api/organizer/balance` - Current balance
- [ ] `POST /api/organizer/payouts/request` - Request withdrawal
- [ ] Connect Stripe Connect for automatic payouts
- [ ] Or manual payout approval by admin

**Refund Handling:**
- [ ] `POST /api/organizer/orders/{id}/refund` - Issue refund
- [ ] Partial refund support
- [ ] Refund policy configuration per event

**Frontend:**
- [ ] Payment success/failure pages
- [ ] "My Orders" with download tickets
- [ ] Email receipts

---

## Phase 6: Reporting & Analytics 🟡 IMPORTANT

### Organizer Reports
- [ ] Sales by ticket type
- [ ] Revenue over time
- [ ] Attendee demographics
- [ ] Check-in rates
- [ ] Export to CSV/PDF

### Admin Reports
- [ ] Platform-wide revenue
- [ ] Active organizers
- [ ] Total tickets sold
- [ ] Fee revenue
- [ ] Top events
- [ ] Export capabilities

### Email Notifications
- [ ] Welcome email
- [ ] Ticket purchase confirmation with QR code
- [ ] Event reminders (24h, 1h before)
- [ ] Organizer: New sale notification
- [ ] Organizer: Daily sales summary
- [ ] Password reset
- [ ] Organizer approval/rejection

---

## Phase 7: Enterprise Features 🟡 NICE TO HAVE

### API & Integrations
- [ ] Public API with API keys
- [ ] Rate limiting
- [ ] Webhooks for external integrations
- [ ] Zapier integration

### Data Export
- [ ] Export all my events (JSON/CSV)
- [ ] Export attendee lists
- [ ] Export financial reports

### White-Label / Customization
- [ ] Custom domain per organizer
- [ ] White-label ticket emails
- [ ] Custom branding options

### Advanced Features
- [ ] Promo codes / discounts
- [ ] Group ticketing
- [ ] Waitlist for sold-out events
- [ ] Reserved seating
- [ ] Multi-day events
- [ ] Recurring events

---

## Implementation Priority

### Must Have (Phase 1-5) - Minimum Viable Product
1. ✅ Basic auth (login/register) - DONE
2. 🔴 Organizer request/approval workflow
3. 🔴 Organizer dashboard (create/manage events)
4. 🔴 Admin dashboard (user/event management)
5. 🔴 Check-in system with QR scanning
6. 🔴 Complete Stripe integration with webhooks
7. 🔴 Email notifications

### Should Have (Phase 6)
8. 🟡 Reporting and analytics
9. 🟡 User profile management
10. 🟡 Password reset

### Nice to Have (Phase 7)
11. 🟢 Public API
12. 🟢 Promo codes
13. 🟢 Advanced features (waitlist, reserved seating, etc.)

---

## Technical Considerations

### Security
- [ ] Rate limiting on all endpoints
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens for state-changing operations

### Performance
- [ ] Database indexing
- [ ] Caching (Redis)
- [ ] Image optimization
- [ ] CDN for static assets

### Scalability
- [ ] Horizontal scaling ready
- [ ] Database connection pooling
- [ ] Async processing for emails/webhooks

---

## Database Schema Additions Needed

```sql
-- Organizer requests
CREATE TABLE organizer_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(255),
    business_description TEXT,
    tax_id VARCHAR(100),
    website VARCHAR(255),
    status VARCHAR(20), -- PENDING, APPROVED, REJECTED
    admin_notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Platform settings
CREATE TABLE platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP
);

-- Payouts
CREATE TABLE payouts (
    id UUID PRIMARY KEY,
    organizer_id UUID REFERENCES users(id),
    amount DECIMAL(10,2),
    status VARCHAR(20), -- PENDING, PAID, FAILED
    stripe_transfer_id VARCHAR(255),
    created_at TIMESTAMP,
    paid_at TIMESTAMP
);

-- Email templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    subject VARCHAR(255),
    body TEXT,
    is_active BOOLEAN
);
```

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 | 2-3 days | User management, organizer requests, password reset |
| Phase 2 | 4-5 days | Organizer dashboard, event management |
| Phase 3 | 3-4 days | Admin dashboard, user/event management |
| Phase 4 | 3-4 days | Check-in system, QR scanning |
| Phase 5 | 3-4 days | Stripe webhooks, payouts, refunds |
| Phase 6 | 2-3 days | Reports, email notifications |
| **Total MVP** | **17-23 days** | Full production-ready platform |

---

## Next Steps

1. **Approve this roadmap**
2. **Decide on email service** (SendGrid, AWS SES, etc.)
3. **Set up Stripe Connect** for organizer payouts (or manual payouts)
4. **Start Phase 1 development**

Would you like me to start implementing Phase 1 (User Management & Organizer Requests)?
