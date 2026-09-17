# BookIt

BookIt is a simple resource booking dashboard for shared company resources such as meeting rooms, projectors, and laptop devices.

## Features

- 5 seeded resources
- Dashboard summary cards
- Quick booking form
- Create booking form
- Bookings list for selected date
- Cancel booking action
- Overlap prevention for confirmed bookings
- Local JSON storage

## Tech Stack

- Node.js 20+
- Express.js
- HTML
- CSS
- Vanilla JavaScript
- JSON file storage

## Folder Structure

```text
BookIt/
|-- public/
|   |-- index.html
|   |-- style.css
|   `-- app.js
|-- data/
|   `-- bookings.json
|-- server.js
|-- package.json
`-- README.md
```

## Installation

```bash
cd BookIt
npm install
```

## Run the app

```bash
npm start
```

Open http://localhost:3000 in the browser.

## API

- GET /api/resources
- GET /api/bookings
- GET /api/bookings?date=YYYY-MM-DD
- POST /api/bookings
- PATCH /api/bookings/:id/cancel
- GET /api/dashboard

## Booking Rule

Two confirmed bookings overlap when:

```text
existing.startTime < new.endTime && existing.endTime > new.startTime
```

This means 09:00-10:00 and 10:00-11:00 do not overlap.

## Validation

The backend validates:

- resource
- date
- start time
- end time
- name
- purpose
- end time must be later than start time
- valid resource ID

## Storage

Bookings are stored in `data/bookings.json`.

## Known Limitations

- This is a local demo project, not a production multi-user system.
- No login, auth, admin, or notifications are included.
