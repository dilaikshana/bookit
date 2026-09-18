# AI Usage

## Purpose

AI assistance was used to help build and refine the BookIt resource booking system.

## Areas Where AI Helped

- Planned the simple Express.js and vanilla JavaScript architecture.
- Generated and refined the dashboard layout, forms, tables, and responsive styling.
- Implemented REST API routes for resources, bookings, dashboard statistics, and cancellation.
- Added server-side booking validation.
- Implemented overlap detection so one resource cannot have two overlapping confirmed bookings.
- Checked edge cases such as cancelled bookings and adjacent time slots.
- Helped debug port conflicts and simplified the project structure.
- Reviewed JavaScript syntax and verified API behavior with local tests.

## Core Business Rule

The backend rejects a new booking when the same resource and date have overlapping confirmed times:

```text
existing.startTime < new.endTime && existing.endTime > new.startTime
```

Cancelled bookings do not block a resource. Adjacent bookings such as `09:00-10:00` and `10:00-11:00` are allowed.

## Human Review

The final implementation was reviewed and adjusted manually to match the required BookIt scope:

- No React or Vite
- No database or external services
- No authentication
- Static frontend in `public/`
- Express backend in `server.js`
- JSON persistence in `data/bookings.json`

## Validation Performed

- Installed dependencies with `npm install`.
- Checked JavaScript syntax with `node --check`.
- Confirmed the server starts with `npm start`.
- Confirmed the resources API returns five resources.
- Confirmed overlapping bookings return HTTP `409`.
- Confirmed adjacent bookings are accepted.
- Confirmed cancellation changes the booking status to `cancelled`.

## Actual Prompts Used

1. "Create a simple Express.js backend for a resource booking system with booking conflict validation."

2. "Implement overlap validation so two confirmed bookings for the same resource cannot overlap."

3. "Review the booking validation logic and identify edge cases such as cancelled bookings and adjacent time slots."

## AI Output Rejected or Corrected

AI initially suggested treating `09:00-10:00` and `10:00-11:00` as overlapping bookings.

I rejected this because the assessment brief specifically gives this as an open decision and requires the developer to decide and document the behaviour. I decided that adjacent bookings are allowed, so the overlap condition was implemented using:

existing.startTime < new.endTime &&
existing.endTime > new.startTime

This means `09:00-10:00` and `10:00-11:00` are accepted.