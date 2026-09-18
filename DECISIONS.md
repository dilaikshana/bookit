1. Adjacent Bookings

Decision:
Adjacent bookings are allowed.

Example:
A booking from 09:00–10:00 and another booking from 10:00–11:00 are not considered a conflict.

Why Chosen:
The bookings do not overlap because the first booking ends exactly when the second booking starts.

2. Past Date Booking

Decision:
Past dates are not allowed for new bookings.

Options Considered:

Allow bookings for past dates
Reject bookings for dates earlier than today

Why Chosen:
Past bookings are no longer useful for new scheduling. Rejecting past dates keeps the booking data meaningful.

3. Cancelled Booking Availability

Decision:
Cancelled bookings do not block the resource time slot.

Why Chosen:
Once a booking is cancelled, the resource should become available for another booking during that time.

4. Booking Time Validation

Decision:
The end time must be later than the start time.

Why Chosen:
A booking must have a valid positive time duration. Same-time or reversed time ranges should not be accepted.

5. Booking Date Requirement

Decision:
A booking date is mandatory.

Why Chosen:
Every booking must belong to a specific day so that bookings can be displayed and managed correctly.

6. Conflict Validation

Decision:
Only bookings for the same resource and the same date are checked for time conflicts.

Why Chosen:
Different resources can be booked at the same time without causing a conflict.

7. Booking Status

Decision:
New bookings are created with confirmed status.

Why Chosen:
The application does not require an approval workflow, so a successfully created booking is immediately confirmed.