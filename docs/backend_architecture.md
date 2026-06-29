# Backend & Database Architecture

Detailed design of the Express API server, socket channels, and database connectors.

---

## 1. API Endpoint Specification

### Authentication
* `POST /api/auth/login`: User token validation (Firebase OAuth).
* `GET /api/auth/profile`: Customer history & loyalty statistics.

### Reservations
* `GET /api/reservations/availability`: Real-time table allocations.
* `POST /api/reservations/book`: Place table booking (updates PG `reservations`).

### Orders & Checkout
* `POST /api/orders/checkout`: Place online order (Razorpay/Stripe payload).
* `GET /api/orders/:id/track`: Live status tracking (Socket.io pipe).

### AI Sommelier
* `POST /api/ai/sommelier`: Prompt matching and reserve wine suggestions.

### Admin Operations
* `GET /api/admin/crm/search`: Direct lookups on `crm_profiles`.
* `POST /api/admin/waitlist/auto-assign`: AI waitlist assignment.
* `POST /api/admin/inventory/reorder`: Supply chain trigger.

---

## 2. Real-Time Socket.io Channels
* **`/order-status`**: Pushes kitchen prep progression (`pending` -> `preparing` -> `ready`).
* **`/waitlist-updates`**: Alerts host desk of walk-in queue changes.
* **`/table-status`**: Real-time seating occupancy sync.

---

## 3. Background Services & Cron Tasks
* **Reservation Reminders**: Auto-runs every 30 minutes, dispatching WhatsApp/SMS alerts via Twilio for upcoming tables.
* **Demand Forecast Compiler**: Weekly aggregation script feeding historical reservations into predictive stats.
