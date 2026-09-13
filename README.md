# FeastFlow

A MongoDB-backed restaurant discovery and food ordering platform. The React/Vite client has motion-led discovery, filters, menus, cart, checkout, tracking, account history, and an admin overview. Express provides JWT-secured REST APIs, role controls, persisted carts/orders, coupon validation, reviews, favourites, notifications, and owner-scoped management.

## Run locally

1. Install MongoDB Community Server and start it.
2. Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET`.
3. From this directory run `npm install`, then `npm run install:all`.
4. Seed catalog and accounts: `npm run seed`.
5. Start both apps: `npm run dev`.

Frontend: http://localhost:5173 · API: http://localhost:5000

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@feastflow.com | Password123! |
| Restaurant owner | owner@feastflow.com | Password123! |
| Customer | customer@feastflow.com | Password123! |

## Structure

`frontend/src` contains reusable UI, global app state, API client, pages and responsive CSS. `backend/models` defines Mongoose relationships; `backend/server.js` contains the REST application and role gates; `backend/seed.js` produces 22 restaurants, 110 menu items, categories, offers, coupons and sample accounts. Full endpoint notes are in [API.md](API.md).
