# BookIt

BookIt is a simple resource booking application for shared company resources such as meeting rooms, projectors, and laptop devices.

## Features

* View bookable resources
* Create a booking
* Prevent overlapping confirmed bookings
* View all bookings for a selected day
* Cancel a booking
* Validate booking input with clear error messages
* 5 seeded resources

## Tech Stack

* Node.js 20+
* Express.js
* HTML
* CSS
* Vanilla JavaScript
* JSON file storage

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

Open:

```text
http://localhost:3000
```

## Booking Validation

The application validates:

* Resource is required
* Date is required
* Start time is required
* End time is required
* Person's name is required
* Purpose is required
* End time must be later than start time
* Valid resource ID
* Past booking dates are not allowed

## Booking Conflict Rule

Two confirmed bookings for the same resource cannot overlap.

Adjacent bookings such as:

```text
09:00 - 10:00
10:00 - 11:00
```

are allowed.

Cancelled bookings do not block new bookings.

## Storage

Bookings are stored in:

```text
data/bookings.json
```

## Project Status

All core requirements are implemented.

No stretch feature was added because the core requirements were prioritized within the assessment time.

## Known Limitations

* Local/demo application only
* No user accounts or authentication
* No admin panel
* No email notifications
* No deployment

