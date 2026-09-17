*BookIt Code Review*

Bugs and Design Problems

 1. Overlap logic treats touching bookings as a conflict

- *Line:* 5
- Problem: `09:00-10:00` and `10:00-11:00` are considered overlapping because `<=` and `>=` are used.
- Fix:Use `a.start < b.end && a.end > b.start`.
- Severity: Medium

 2. Loose equality is used for resource ID

- *Line:* 10
- Problem: `==` can match different types, such as number `1` and string `"1"`, which can cause unexpected conflicts.
- Fix: Use strict equality `===`.
- Severity: Low

 3. Booking ID can be duplicated

- *Line:*15
- Problem: Using `bookings.length + 1` can create duplicate IDs after bookings are removed or when multiple requests happen close together.
- Fix:Use a reliable unique ID such as `crypto.randomUUID()`.
-Severity: Medium

4. Database save is not awaited

- *Line:* 20
- Problem: `saveToDatabase(booking)` is called without `await`, so the function can return success before the booking is actually saved.
- Fix: Use `await saveToDatabase(booking)`.
- Severity: High

 5. Cancellation can crash when booking does not exist

- *Lines:* 25-26
- Problem: If the ID is not found, `booking` is `undefined` and `booking.status` causes an error.
- Fix:  Check `if (!booking)` and return a clear not-found error.
- everity:High

 6. Cancelled bookings are not considered properly in conflict checking

- *Line:* 10
- Problem: The conflict check does not ignore cancelled bookings, so a cancelled booking can still block a new booking.
- Fix: Only check bookings where `b.status === 'confirmed'`.
- everity: High

 7. `bookingsForDay()` may fail because of date/time handling

- *Line:*32
- Problem: It assumes `b.start` is a Date object; if the stored value is a string, `.toISOString()` can fail.
- Fix:Convert the stored value to a Date before using `toISOString()`.
- Severity: Medium

8. Date filtering can have timezone problems

- *Line:* 32
- Problem:toISOString()` converts the date to UTC, so a booking near midnight can appear under the wrong day for the user's local timezone.
- Fix: Compare dates using the application's agreed local timezone.
- Severity: Medium

