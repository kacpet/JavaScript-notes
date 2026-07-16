import { db } from '../Firebase/firebase.js';

import {
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const calendarGrid = document.getElementById('calendarGrid');

const monthTitle = document.getElementById('monthTitle');

const prevMonth = document.getElementById('prevMonth');

const nextMonth = document.getElementById('nextMonth');

const addEventButton = document.getElementById('addEvent');

let currentDate = new Date();

let events = [];

const months = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

const days = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

/*
=========================================
        POBIERANIE WYDARZEŃ
=========================================
*/

async function loadEvents() {
  const token = localStorage.getItem('token');

  /*
  =========================
        BACKEND
  =========================
  */

  try {
    const response = await fetch('http://localhost:3000/events', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.events) {
      events = generateRecurringEvents(data.events);

      renderCalendar();

      return;
    }
  } catch (error) {
    console.log('Backend offline');
  }

  /*
  =========================
        FIREBASE
  =========================
  */

  await loadFirebaseEvents();
}

async function loadFirebaseEvents() {
  try {
    const uid = localStorage.getItem('firebaseUID');

    if (!uid) {
      console.log('Brak Firebase UID');

      return;
    }

    const snapshot = await getDocs(collection(db, 'users', uid, 'events'));

    const firebaseEvents = [];

    snapshot.forEach((item) => {
      firebaseEvents.push({
        id: item.id,

        ...item.data(),
      });
    });

    events = generateRecurringEvents(firebaseEvents);

    renderCalendar();
  } catch (error) {
    console.error('Firebase events error:', error);
  }
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  if (value.toDate && typeof value.toDate === 'function') {
    return formatDate(value.toDate());
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  return value.substring(0, 10);
}

function parseDate(date) {
  const [year, month, day] = date.split('-');

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

/*
=========================================
        POWTARZALNE WYDARZENIA
=========================================
*/

function generateRecurringEvents(sourceEvents) {
  const generated = [];

  const yearNow = currentDate.getFullYear();

  const monthNow = currentDate.getMonth() + 1;

  const monthStart = `${yearNow}-${String(monthNow).padStart(2, '0')}-01`;

  const lastDay = new Date(yearNow, monthNow, 0).getDate();

  const monthEnd = `${yearNow}-${String(monthNow).padStart(2, '0')}-${String(
    lastDay,
  ).padStart(2, '0')}`;

  sourceEvents.forEach((event) => {
    const start = normalizeDate(event.event_date);

    if (!start) {
      return;
    }
    /*
    =========================
        ZWYKŁE WYDARZENIE
    =========================
    */

    if (!event.is_repeat) {
      generated.push({
        ...event,

        event_date: start,
      });

      return;
    }

    let [year, month, day] = start.split('-').map(Number);

    const repeatEvery = Number(event.repeat_every) || 1;

    const repeatUntil = event.repeat_until
      ? normalizeDate(event.repeat_until)
      : '9999-12-31';

    while (true) {
      const formatted = `${year}-${String(month).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;

      if (formatted > repeatUntil) {
        break;
      }

      if (formatted >= monthStart && formatted <= monthEnd) {
        generated.push({
          ...event,

          event_date: formatted,
        });
      }

      switch (event.repeat_type) {
        case 'daily':
          day += repeatEvery;

          while (day > new Date(year, month, 0).getDate()) {
            day -= new Date(year, month, 0).getDate();

            month++;

            if (month > 12) {
              month = 1;

              year++;
            }
          }

          break;

        case 'weekly': {
          const next = new Date(year, month - 1, day);

          next.setDate(next.getDate() + 7 * repeatEvery);

          year = next.getFullYear();

          month = next.getMonth() + 1;

          day = next.getDate();

          break;
        }

        case 'monthly': {
          month += repeatEvery;

          while (month > 12) {
            month -= 12;

            year++;
          }

          const maxDay = new Date(year, month, 0).getDate();

          if (day > maxDay) {
            day = maxDay;
          }

          break;
        }

        case 'yearly':
          year += repeatEvery;

          break;

        default:
          return;
      }
    }
  });

  return generated;
}

function getDayEvents(day) {
  const year = currentDate.getFullYear();

  const month = String(currentDate.getMonth() + 1).padStart(2, '0');

  const date = String(day).padStart(2, '0');

  const fullDate = `${year}-${month}-${date}`;

  return events.filter((event) => {
    return normalizeDate(event.event_date) === fullDate;
  });
}

function getEventColors(dayEvents) {
  const colors = dayEvents.map((event) => event.color).filter(Boolean);

  if (colors.length === 0) {
    return '#7c5cff';
  }

  if (colors.length === 1) {
    return colors[0];
  }

  const parts = colors.map((color, index) => {
    const start = index * (100 / colors.length);

    const end = (index + 1) * (100 / colors.length);

    return `${color} ${start}% ${end}%`;
  });

  return `
    linear-gradient(
      135deg,
      ${parts.join(',')}
    )
  `;
}

function renderCalendar() {
  calendarGrid.innerHTML = '';

  const year = currentDate.getFullYear();

  const month = currentDate.getMonth();

  monthTitle.textContent = `${months[month]} ${year}`;

  days.forEach((day) => {
    const element = document.createElement('div');

    element.className = 'day-name';

    element.textContent = day;

    calendarGrid.appendChild(element);
  });

  const firstDay = new Date(year, month, 1);

  let startDay = firstDay.getDay();

  startDay = startDay === 0 ? 6 : startDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');

    empty.className = 'day empty';

    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');

    cell.className = 'day';

    const number = document.createElement('div');

    number.className = 'day-number';

    number.textContent = day;

    cell.appendChild(number);

    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      cell.classList.add('today');
    }

    const dayEvents = getDayEvents(day);

    dayEvents.forEach((event) => {
      const eventElement = document.createElement('div');

      eventElement.className = 'calendar-event';

      eventElement.style.background = event.color || '#7c5cff';

      let text = event.title;

      if (event.start_time) {
        text += ` ${event.start_time.slice(0, 5)}`;
      }

      eventElement.textContent = text;

      cell.appendChild(eventElement);
    });

    calendarGrid.appendChild(cell);
  }
}

addEventButton.addEventListener('click', () => {
  window.location.href = '../addEvent/addEvent.html';
});

prevMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);

  loadEvents();
});

nextMonth.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);

  loadEvents();
});

loadEvents();
