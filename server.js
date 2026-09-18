const express = require('express');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'bookings.json');

const RESOURCES = [
  { id: 'room-1', name: 'Meeting Room 1', type: 'Meeting Room' },
  { id: 'room-2', name: 'Meeting Room 2', type: 'Meeting Room' },
  { id: 'projector', name: 'Projector', type: 'Equipment' },
  { id: 'camera-kit', name: 'Camera Kit', type: 'Equipment' },
  { id: 'demo-laptop', name: 'Demo Laptop', type: 'Device' }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readBookings() {
  try {
    const file = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    return [];
  }
}

function writeBookings(bookings) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2));
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toMinutes(timeValue) {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
    return null;
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(existing, incoming) {
  if (!existing || !incoming) return false;
  if (existing.status !== 'confirmed') return false;
  if (existing.resourceId !== incoming.resourceId) return false;
  if (existing.date !== incoming.date) return false;

  const existingStart = toMinutes(existing.startTime);
  const existingEnd = toMinutes(existing.endTime);
  const incomingStart = toMinutes(incoming.startTime);
  const incomingEnd = toMinutes(incoming.endTime);

  if ([existingStart, existingEnd, incomingStart, incomingEnd].includes(null)) {
    return false;
  }

  return existingStart < incomingEnd && existingEnd > incomingStart;
}

function getResourceName(resourceId) {
  const resource = RESOURCES.find((item) => item.id === resourceId);
  return resource ? resource.name : 'This resource';
}

function isBookingActiveNow(booking) {
  if (booking.status !== 'confirmed' || booking.date !== getTodayDate()) {
    return false;
  }

  const currentTime = new Date();
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = toMinutes(booking.startTime);
  const endMinutes = toMinutes(booking.endTime);

  return startMinutes !== null && endMinutes !== null
    && startMinutes <= currentMinutes
    && currentMinutes < endMinutes;
}

function validateBooking(payload) {
  const errors = [];

  if (!payload.resourceId) errors.push('Please select a resource.');
  if (!payload.date) errors.push('Please select a date.');
  if (payload.date && payload.date < getTodayDate()) {
    errors.push('Bookings cannot be made for a past date.');
  }
  if (!payload.startTime) errors.push('Please enter a start time.');
  if (!payload.endTime) errors.push('Please enter an end time.');
  if (!payload.name || !String(payload.name).trim()) errors.push('Please enter your name.');
  if (!payload.purpose || !String(payload.purpose).trim()) errors.push('Please enter the purpose.');

  if (payload.startTime && payload.endTime) {
    const startMinutes = toMinutes(payload.startTime);
    const endMinutes = toMinutes(payload.endTime);

    if (startMinutes === null || endMinutes === null) {
      errors.push('Please enter valid times in HH:MM format.');
    } else if (endMinutes <= startMinutes) {
      errors.push('End time must be later than start time.');
    }
  }

  if (payload.resourceId) {
    const exists = RESOURCES.some((resource) => resource.id === payload.resourceId);
    if (!exists) {
      errors.push('Selected resource does not exist.');
    }
  }

  return errors;
}

function getDashboardStats() {
  const today = getTodayDate();
  const bookings = readBookings();
  const todayBookings = bookings.filter((booking) => booking.date === today && booking.status !== 'cancelled');
  const confirmedBookings = bookings.filter((booking) => {
    return booking.date === today && booking.status === 'confirmed';
  });
  const activeBookings = confirmedBookings.filter(isBookingActiveNow);

  const availableResources = RESOURCES.filter((resource) => {
    return !activeBookings.some((booking) => booking.resourceId === resource.id);
  }).length;

  return {
    totalResources: RESOURCES.length,
    todayBookings: todayBookings.length,
    availableResources,
    confirmedBookings: confirmedBookings.length,
    cancelledBookings: bookings.filter((booking) => {
      return booking.date === today && booking.status === 'cancelled';
    }).length
  };
}

app.get('/api/resources', (req, res) => {
  res.json(RESOURCES);
});

app.get('/api/bookings', (req, res) => {
  const { date } = req.query;
  const bookings = readBookings();

  const result = date 
    ? bookings.filter((booking) => booking.date === date)
    : bookings;

  result.sort((a, b) => a.startTime.localeCompare(b.startTime));
  res.json(result);
});

app.get('/api/dashboard', (req, res) => {
  res.json(getDashboardStats());
});

app.post('/api/bookings', (req, res) => {
  const payload = req.body || {};
  const errors = validateBooking(payload);

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0] });
  }

  const booking = {
    id: randomUUID(),
    resourceId: payload.resourceId,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    name: String(payload.name).trim(),
    purpose: String(payload.purpose).trim(),
    status: 'confirmed'
  };

  const bookings = readBookings();
  const conflict = bookings.find((existing) => overlaps(existing, booking));

  if (conflict) {
    return res.status(409).json({
      error: `${getResourceName(conflict.resourceId)} is already booked from ${conflict.startTime} to ${conflict.endTime}.`
    });
  }

  bookings.push(booking);
  writeBookings(bookings);

  res.status(201).json({ message: 'Booking created successfully.', booking });
});

app.patch('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const bookings = readBookings();
  const booking = bookings.find((item) => item.id === id);

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found.' });
  }

  booking.status = 'cancelled';
  writeBookings(bookings);

  res.json({ message: 'Booking cancelled.', booking });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`BookIt server is running at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    throw error;
  });
}

startServer(PORT);
