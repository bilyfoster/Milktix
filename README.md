# MilkTix - Event Ticketing Platform

A modern event ticketing platform built with Java Spring Boot and React.

## Quick Start

```bash
# Start all services
docker compose up -d

# Access the app
http://localhost:3000
```

## Architecture

- **Backend:** Java Spring Boot, PostgreSQL
- **Frontend:** React, TypeScript, Tailwind CSS
- **Infrastructure:** Docker, Traefik

## Deployment

Deployed on Harvey (207.244.251.233) via Docker Compose.

## Environment Variables

- `JWT_SECRET` - JWT signing key
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret