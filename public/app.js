const dateToday = new Date().toISOString().slice(0, 10);
const navigationButtons = document.querySelectorAll('.nav-link');
const quickBookingForm = document.getElementById('quickBookingForm');
const createBookingForm = document.getElementById('createBookingForm');
const quickResourceSelect = document.getElementById('quickResource');
const createResourceSelect = document.getElementById('createResource');
const bookingDatePicker = document.getElementById('bookingDatePicker');
const quickStatus = document.getElementById('quickStatus');
const createStatus = document.getElementById('createStatus');
const statsGrid = document.getElementById('statsGrid');
const todayBookings = document.getElementById('todayBookings');
const dashboardResourceGrid = document.getElementById('dashboardResourceGrid');
const bookingTable = document.getElementById('bookingTable');

function setStatus(element, message, type = '') {
  element.textContent = message;
  element.className = `status-message ${type}`.trim();
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function setActiveSection(sectionId) {
  document.querySelectorAll('.panel').forEach((panel) => {
    panel.classList.toggle('active-section', panel.id === sectionId);
    panel.classList.toggle('hidden-section', panel.id !== sectionId);
  });

  navigationButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.section === sectionId);
  });
}

async function fetchResources() {
  const response = await fetch('/api/resources');
  const resources = await response.json();

  const options = resources
    .map((resource) => `<option value="${resource.id}">${resource.name}</option>`)
    .join('');

  quickResourceSelect.innerHTML = options;
  createResourceSelect.innerHTML = options;

  quickResourceSelect.value = resources[0]?.id || '';
  createResourceSelect.value = resources[0]?.id || '';
  const quickDate = document.getElementById('quickDate');
  const createDate = document.querySelector('#createBookingForm input[name="date"]');
  quickDate.min = dateToday;
  createDate.min = dateToday;
  quickDate.value = dateToday;
  createDate.value = dateToday;
}

async function fetchDashboard() {
  const [dashboardResponse, bookingsResponse] = await Promise.all([
    fetch('/api/dashboard'),
    fetch(`/api/bookings?date=${dateToday}`)
  ]);
  const data = await dashboardResponse.json();
  const todayBookings = await bookingsResponse.json();
  const confirmedBookings = todayBookings.filter(
    (booking) => String(booking.status).toLowerCase() === 'confirmed'
  ).length;

  const summary = [
    { label: 'Total Resources', value: data.totalResources },
    { label: "Today's Bookings", value: data.todayBookings },
    { label: 'Confirmed Bookings', value: confirmedBookings }
  ];

  statsGrid.innerHTML = summary
    .map((item) => `
      <div class="stat-card">
        <div class="stat-value">${item.value}</div>
        <div class="stat-label">${item.label}</div>
      </div>
    `)
    .join('');
}

async function fetchTodayBookings() {
  const response = await fetch(`/api/bookings?date=${dateToday}`);
  const bookings = await response.json();

  if (!bookings.length) {
    todayBookings.innerHTML = '<p class="empty-state">No bookings scheduled for today.</p>';
    return;
  }

  const rows = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .map((booking) => `
      <tr>
        <td>${booking.startTime} – ${booking.endTime}</td>
        <td>${booking.resourceId}</td>
        <td>${booking.name}</td>
        <td>${booking.purpose}</td>
        <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
        <td>${booking.status === 'confirmed' ? `<button class="cancel-btn" data-cancel-id="${booking.id}">Cancel</button>` : 'Cancelled'}</td>
      </tr>
    `)
    .join('');

  todayBookings.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Resource</th>
          <th>Person</th>
          <th>Purpose</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function fetchResourceView() {
  const response = await fetch('/api/resources');
  const resources = await response.json();

  dashboardResourceGrid.innerHTML = resources.map((resource) => `
    <div class="resource-card">
      <div class="resource-icon">${resource.id === 'room-1' || resource.id === 'room-2' ? '🏢' : resource.id === 'projector' ? '📽️' : resource.id === 'camera-kit' ? '📷' : '💻'}</div>
      <div class="resource-type">${resource.type}</div>
      <div class="resource-name">${resource.name}</div>
      <p class="resource-status">Available</p>
      <button class="primary-btn" type="button" data-book-resource="${resource.id}">Booking</button>
    </div>
  `).join('');

  document.querySelectorAll('[data-book-resource]').forEach((button) => {
    button.addEventListener('click', () => {
      createResourceSelect.value = button.dataset.bookResource;
      document.querySelector('#createBookingForm input[name="date"]').value = dateToday;
      setActiveSection('create-booking');
    });
  });
}

async function fetchBookingsView(dateValue = dateToday) {
  const response = await fetch(`/api/bookings?date=${dateValue}`);
  const bookings = await response.json();

  if (!bookings.length) {
    bookingTable.innerHTML = '<p class="empty-state">No bookings scheduled for this date.</p>';
    return;
  }

  const rows = bookings
    .map((booking) => `
      <tr>
        <td>${booking.startTime} – ${booking.endTime}</td>
        <td>${getResourceName(booking.resourceId)}</td>
        <td>${booking.name}</td>
        <td>${booking.purpose}</td>
        <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
        <td>
          ${booking.status === 'confirmed' ? `<button class="cancel-btn" data-cancel-id="${booking.id}">Cancel</button>` : 'Cancelled'}
        </td>
      </tr>
    `)
    .join('');

  bookingTable.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Resource</th>
          <th>Person</th>
          <th>Purpose</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  bindCancellationButtons();
}

function bindCancellationButtons() {
  document.querySelectorAll('[data-cancel-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.cancelId;
      const response = await fetch(`/api/bookings/${id}/cancel`, { method: 'PATCH' });
      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Unable to cancel booking.');
        return;
      }

      alert(result.message || 'Booking cancelled.');
      refreshAll();
    });
  });
}

function getResourceName(resourceId) {
  const resourceMap = {
    'room-1': 'Meeting Room 1',
    'room-2': 'Meeting Room 2',
    projector: 'Projector',
    'camera-kit': 'Camera Kit',
    'demo-laptop': 'Demo Laptop'
  };

  return resourceMap[resourceId] || resourceId;
}

async function submitBooking(form, statusElement) {
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    setStatus(statusElement, result.error || 'Unable to create booking.', 'error');
    return false;
  }

  setStatus(statusElement, result.message || 'Booking created successfully.', 'success');
  form.reset();
  const dateValue = dateToday;
  if (form.id === 'quickBookingForm') {
    quickResourceSelect.value = 'room-1';
    document.getElementById('quickDate').value = dateValue;
  }
  if (form.id === 'createBookingForm') {
    createResourceSelect.value = 'room-1';
    document.querySelector('#createBookingForm input[name="date"]').value = dateValue;
  }

  refreshAll();
  return true;
}

async function refreshAll() {
  await fetchDashboard();
  await fetchTodayBookings();
  await fetchResourceView();
  await fetchBookingsView(bookingDatePicker.value || dateToday);
}

navigationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.hasAttribute('data-daily-bookings')) {
      bookingDatePicker.value = dateToday;
      fetchBookingsView(dateToday);
    }

    setActiveSection(button.dataset.section);
  });
});

quickBookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitBooking(quickBookingForm, quickStatus);
});

createBookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await submitBooking(createBookingForm, createStatus);
});

bookingDatePicker.addEventListener('change', (event) => {
  fetchBookingsView(event.target.value);
});

bookingDatePicker.value = dateToday;

(async function init() {
  await fetchResources();
  await refreshAll();
  setActiveSection('dashboard');
})();
