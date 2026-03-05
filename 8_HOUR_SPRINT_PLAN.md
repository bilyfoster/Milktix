# MilkTix 8-Hour Enterprise Sprint Plan
**Goal:** Transform MilkTix into a professional, enterprise-grade event management platform
**Time:** 8 hours | **Version Target:** 1.1.0

---

## Current State Analysis

### Production Data (SAFE on harvey/milktix.com)
- 37 Events published
- 2 Hosts (Drag Queen Productions, Phoenix Drag Productions)
- 3 Locations (The Rainbow Lounge, Scottsdale Event Center)
- Enterprise database schema already exists

### Critical Gaps Identified
1. No User Management interface
2. Cannot edit events after creation
3. No bulk operations
4. No data export capabilities
5. Limited admin dashboard

---

## 8-Hour Sprint Breakdown

### HOUR 1-2: Data Persistence and User Management API
**Priority: CRITICAL**

**Backend Tasks:**
- Create AdminUserController with endpoints:
  - GET /api/admin/users - List users with pagination, filters
  - PUT /api/admin/users/{id}/role - Change user role
  - PUT /api/admin/users/{id}/status - Activate/deactivate user
  - POST /api/admin/users/bulk - Bulk operations
  
- Create UserListResponse DTO
- Add status field to User entity (ACTIVE, INACTIVE, SUSPENDED)
- Add lastLogin field to User entity

### HOUR 2-3: Event Edit API
**Priority: CRITICAL**

**Backend Tasks:**
- Enhance EventController with:
  - PUT /api/organizer/events/{id} - Full event update
  - PATCH /api/organizer/events/{id} - Partial update
  - DELETE /api/organizer/events/{id} - Soft delete
  
- Create EventUpdateRequest DTO
- Create BulkEventUpdateRequest DTO
- Create AdminEventController

### HOUR 3-4: Bulk Operations Engine
**Priority: HIGH**

**Backend Tasks:**
- Create BulkOperationService
- Create BulkOperationResponse DTO
- Create BulkOperation entity for audit trail

### HOUR 4-6: Admin Dashboard UI
**Priority: HIGH**

**Frontend Tasks:**
- Create AdminUsers.tsx page with data table
- Create AdminEvents.tsx page with filters
- Create EventEdit.tsx page
- Update AdminLayout.tsx

### HOUR 6-7: Organizer Dashboard Enhancements
**Priority: MEDIUM**

**Frontend Tasks:**
- Enhance MyEvents.tsx
- Create EventEdit.tsx in organizer folder
- Enhance Dashboard.tsx with stats

### HOUR 7-8: Data Export and Production Deployment
**Priority: HIGH**

**Backend Tasks:**
- Create ExportService for CSV export
- Create ReportController

**Production Tasks:**
- Backup production database on harvey
- Deploy new version to harvey
- Run database migrations
- Verify all features working

---

## Key Features to Implement

### User Management
- List all users with pagination
- Filter by role, status
- Bulk activate/deactivate
- View user order history

### Event Management
- Edit events (all fields)
- Bulk publish/unpublish
- Bulk delete
- Export to CSV
- Duplicate events

### Dashboard Improvements
- Stats cards (events, tickets, revenue)
- Recent activity feed
- Quick action buttons
- Charts and graphs

### Data Persistence
- Database backups
- Volume management
- Migration strategy
