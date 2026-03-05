# MilkTix v1.1.0 Enterprise Deployment Guide

## 🎯 What's New in v1.1.0

### Major Features
1. **User Management System**
   - List all users with pagination, sorting, filtering
   - Activate/deactivate users
   - Change user roles (Admin, Organizer, Attendee)
   - Bulk user operations
   - View user order history

2. **Event Edit Functionality**
   - Full event editing for organizers
   - Edit ticket types (price, quantity, sale dates)
   - Publish/unpublish events
   - Duplicate events
   - Soft delete (cancel events)

3. **Bulk Operations**
   - Bulk publish/unpublish events
   - Bulk delete events
   - Bulk activate/deactivate users
   - CSV export of events

4. **Enhanced Admin Dashboard**
   - User management page
   - Event management with filters
   - Stats cards on organizer dashboard
   - Quick action buttons

5. **Data Persistence**
   - Database migration for user status
   - Audit logging support
   - Export capabilities

---

## 🚀 Deployment Steps

### Pre-Deployment Checklist
- [ ] Backup production database
- [ ] Verify images built: `milktix-backend:1.1.0` and `milktix-frontend:1.1.0`
- [ ] Check production has enough disk space
- [ ] Notify users of maintenance window (if needed)

### Step 1: Backup Production Database
```bash
ssh harvey
docker exec milktix-db pg_dump -U milktix milktix > /opt/milktix/backup_pre_v1.1.0_$(date +%Y%m%d).sql
```

### Step 2: Deploy New Images
```bash
ssh harvey
cd /opt/milktix

# Update docker-compose to use v1.1.0 images
# Or update latest tags:
docker pull milktix-backend:1.1.0
docker pull milktix-frontend:1.1.0

# Stop current containers
docker compose down

# Start with new images
docker compose up -d
```

### Step 3: Run Database Migrations
```bash
ssh harvey
docker exec -i milktix-db psql -U milktix milktix < backend/src/main/resources/db/migration/V2__add_user_status.sql
```

Migration SQL:
```sql
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
ALTER TABLE users ADD COLUMN status user_status DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
```

### Step 4: Verify Deployment
```bash
# Check containers are running
docker ps | grep milktix

# Check backend health
curl http://localhost:8082/api/health

# Check frontend
curl -s -o /dev/null -w "%{http_code}" http://milktix.com

# Verify version in footer
curl -s http://milktix.com | grep "v1.1.0"
```

---

## 📋 Database Migration Details

### V2__add_user_status.sql
```sql
-- Create user status enum
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Add status column to users table
ALTER TABLE users ADD COLUMN status user_status DEFAULT 'ACTIVE';

-- Add last login tracking
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

-- Create indexes for performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
```

### Rollback (if needed)
```sql
-- Revert migration
ALTER TABLE users DROP COLUMN status;
ALTER TABLE users DROP COLUMN last_login;
DROP TYPE user_status;
```

---

## 🔐 New API Endpoints

### Admin User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/users | List users (paginated, filterable) |
| GET | /api/admin/users/{id} | Get user details |
| PUT | /api/admin/users/{id}/role | Change user role |
| PUT | /api/admin/users/{id}/status | Activate/deactivate |
| POST | /api/admin/users/bulk | Bulk operations |

### Event Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | /api/organizer/events/{id} | Update event |
| PATCH | /api/organizer/events/{id} | Partial update |
| DELETE | /api/organizer/events/{id} | Cancel event |
| POST | /api/admin/events/bulk | Bulk operations |
| GET | /api/admin/events/export | Export CSV |

---

## 🧪 Testing Checklist

### Admin Features
- [ ] Access /admin/users page
- [ ] Filter users by role
- [ ] Activate/deactivate a user
- [ ] Bulk select and activate users
- [ ] Access /admin/events page
- [ ] Export events to CSV
- [ ] Bulk publish events

### Organizer Features
- [ ] Edit existing event
- [ ] Update ticket type prices
- [ ] Duplicate an event
- [ ] View dashboard stats
- [ ] Quick actions work

### Data Integrity
- [ ] All existing events still visible
- [ ] All existing hosts/locations intact
- [ ] User logins still work
- [ ] Orders data preserved

---

## 🚨 Rollback Plan

If issues occur:

1. Stop containers:
```bash
docker compose down
```

2. Restore database:
```bash
docker exec -i milktix-db psql -U milktix milktix < /opt/milktix/backup_pre_v1.1.0_YYYYMMDD.sql
```

3. Revert to previous images:
```bash
# Edit docker-compose.yml to use previous version
docker compose up -d
```

---

## 📊 Production Data Status

**Current Production Data (harvey):**
- 37 Events
- 2 Hosts (Drag Queen Productions, Phoenix Drag Productions)
- 3 Locations (The Rainbow Lounge, Scottsdale Event Center)
- Multiple users with orders

**All data will be preserved during upgrade.**

---

## 🔧 Post-Deployment Tasks

1. **Update Admin Password** - Change from default `admin123`
2. **Review User Roles** - Ensure all organizers have correct permissions
3. **Test Bulk Operations** - Verify on test events first
4. **Monitor Logs** - Check for errors: `docker logs -f milktix-backend`
5. **Update Documentation** - Share new features with team

---

## 📞 Support

If deployment fails:
1. Check logs: `docker logs milktix-backend` and `docker logs milktix-frontend`
2. Verify database connection
3. Check migration ran successfully
4. Rollback if necessary
