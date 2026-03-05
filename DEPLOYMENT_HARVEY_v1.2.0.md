# MilkTix v1.2.0 Deployment to Harvey - COMPLETE

## Deployment Summary

**Date:** March 5, 2026  
**Version:** 1.2.0  
**Server:** Harvey (milktix.com)  
**Status:** ✅ SUCCESSFUL

---

## What's New in v1.2.0

### 1. CMS-Editable Static Pages
- About, Contact, Terms, Privacy pages now fetch content from database
- Fallback to hardcoded content if no CMS entry exists
- Admin can edit pages via `/admin/content`

### 2. Blog System
- Full blog with public listing and individual post pages
- Admin blog management at `/admin/blog`
- Categories, tags, featured posts, view counting

### 3. Host-Specific Promo Codes
- Organizers can create promo codes for all their events
- Admin can view and manage all promo codes
- Scope: GLOBAL, EVENT_SPECIFIC, HOST_SPECIFIC

### 4. Admin Order Management
- Complete order visibility for customer support
- Process refunds (full or partial)
- Cancel orders with reason
- Resend confirmation emails

---

## Deployment Steps Executed

### 1. Pre-Deployment Backup
```bash
# Database backed up to /tmp/backup_pre_v1.2.0.sql
```

### 2. Docker Images Built
- `milktix-backend:1.2.0` (272MB)
- `milktix-frontend:1.2.0` (62.9MB)

### 3. Images Transferred to Harvey
```bash
scp backend-1.2.0.tar.gz harvey:/tmp/
scp frontend-1.2.0.tar.gz harvey:/tmp/
docker load < backend-1.2.0.tar.gz
docker load < frontend-1.2.0.tar.gz
```

### 4. Database Migrations Applied
```sql
-- User status and active columns
-- CMS pages table
-- Promo codes tables
-- Blog posts table
-- Order refund fields
```

### 5. Containers Started
```bash
docker run -d --name milktix-backend --network database \
  -p 8082:8080 milktix-backend:1.2.0

docker run -d --name milktix-frontend --network database \
  -p 3000:80 milktix-frontend:1.2.0
```

---

## Container Status

| Container | Image | Status | Ports |
|-----------|-------|--------|-------|
| milktix-backend | milktix-backend:1.2.0 | Running | 8082:8080 |
| milktix-frontend | milktix-frontend:1.2.0 | Running | 3000:80 |

---

## Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8082 |
| API Events | http://localhost:8082/api/events |

---

## New Routes Available

### Public
- `/blog` - Blog listing
- `/blog/:slug` - Single blog post
- `/page/:slug` - CMS pages

### Admin
- `/admin/blog` - Blog management
- `/admin/orders` - Order management
- `/admin/promo-codes` - Promo codes
- `/admin/content` - CMS pages

### Organizer
- `/organizer/promo-codes` - Host promo codes

---

## Post-Deployment Tasks

1. ✅ Database migrations applied
2. ✅ CMS pages seeded (about, contact)
3. ✅ Containers running and healthy
4. ⏳ SSL/HTTPS configuration (if needed)
5. ⏳ Reverse proxy configuration (if needed)

---

## Rollback Plan

If issues occur:
```bash
# Stop new containers
docker rm -f milktix-backend milktix-frontend

# Restore database
docker exec -i postgres-poison psql -U poison -d poison < /tmp/backup_pre_v1.2.0.sql

# Start previous version images
docker run -d --name milktix-backend [previous-image]
docker run -d --name milktix-frontend [previous-image]
```

---

## Issues Resolved During Deployment

1. **Database Credentials** - Used correct postgres credentials (poison/poison_password_change_me)
2. **Database Column `active`** - Added migration for User.active column
3. **Network Configuration** - Connected containers to 'database' network
4. **CMS Pages Table** - Fixed id default value (gen_random_uuid())

---

## Monitoring

Check logs:
```bash
# Backend logs
docker logs -f milktix-backend

# Frontend logs
docker logs -f milktix-frontend
```

Health checks:
```bash
# Backend API
curl http://localhost:8082/api/events

# Frontend
curl http://localhost:3000
```

---

**Deployment Completed Successfully! 🎉**
