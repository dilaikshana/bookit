# Architecture Decisions

## 1. Simple Full-Stack Structure

BookIt uses one Express server and a static frontend:

- `server.js` contains the backend API and static file hosting.
- `public/` contains HTML, CSS, and vanilla JavaScript.
- `data/bookings.json` stores booking records.

This keeps the project easy to run, explain, and review.

## 2. No Frontend Framework

The frontend uses plain HTML, CSS, and JavaScript. React, Vite, and other frontend frameworks are intentionally excluded because the project brief requires a simple public frontend.

## 3. JSON File Storage

Bookings are stored in `data/bookings.json` instead of a database. This is suitable for the local assessment/demo scope and avoids external services.

## 4. Server-Side Conflict Validation

The backend is the source of truth for booking availability. Frontend checks are not trusted to prevent double-booking.

A booking conflicts when the same resource and date have overlapping confirmed times:

```text
existing.startTime < new.endTime && existing.endTime > new.startTime
```

This allows adjacent bookings such as `09:00-10:00` and `10:00-11:00`.

## 5. Cancelled Bookings

Cancelling a booking changes its status to `cancelled`. Cancelled bookings are ignored by overlap detection, so their time slot can be booked again.

## 6. Dashboard Layout

The dashboard is the main screen and includes:

- Overview statistics
- Five resource cards
- Quick Booking form
- Today's bookings

The sidebar provides navigation to the dashboard, daily bookings, and create booking views.

## 7. Port Handling

The server starts on port `3000` by default. If that port is occupied, it tries the next available port automatically so the app can still launch locally.

## 8. Scope Boundaries

The project intentionally does not include:

- Authentication
- User accounts
- Admin roles
- Notifications
- Payments
- External integrations
- Production database infrastructure
