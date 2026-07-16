import { db } from '../Firebase/firebase.js';

import {
  collection,
  query,
  where,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const container = document.getElementById('dayContainer');

const title = document.getElementById('day-title');

const hoursLayer = document.querySelector('.hours-layer');

const eventsLayer = document.querySelector('.events-layer');

const now = new Date();

if (!container || !hoursLayer || !eventsLayer) {
  console.error('Brak wymaganych elementów kalendarza');
}

const days = [
  'niedziela',
  'poniedziałek',
  'wtorek',
  'środa',
  'czwartek',
  'piątek',
  'sobota',
];

const months = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

let events = [];

title.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;

/*
=========================================
        POBIERANIE EVENTÓW
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
      events = data.events;

      renderDay();

      return;
    }
  } catch (error) {
    console.log('Backend offline - Firebase');
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


    const eventsRef = collection(
      db,
      'users',
      uid,
      'events',
    );


    const snapshot = await getDocs(eventsRef);


    events = [];


    snapshot.forEach((item) => {

      events.push({

        id: item.id,

        ...item.data(),

      });

    });


    console.log('Firebase events:', events);


    renderDay();


  } catch (error) {

    console.error(
      'Firebase events error:',
      error
    );

  }
}
/*
=========================================
        DATY
=========================================
*/

function getTodayDate() {
  return (
    `${now.getFullYear()}-` +
    `${String(now.getMonth() + 1).padStart(2, '0')}-` +
    `${String(now.getDate()).padStart(2, '0')}`
  );
}

function getTodayEvents() {
  const today = getTodayDate();

  return events.filter((event) => {
    if (!event.event_date) {
      return false;
    }

    return event.event_date.substring(0, 10) === today;
  });
}

/*
=========================================
        EVENT HELPERS
=========================================
*/

function isAllDay(event) {
  return (
    event.all_day === true || event.all_day === 1 || event.all_day === 'true'
  );
}

function timeToMinutes(time) {
  if (!time) {
    return 0;
  }

  const parts = time.substring(0, 5).split(':').map(Number);

  return parts[0] * 60 + parts[1];
}

function getEventTimes(event) {
  const start = timeToMinutes(event.start_time);

  let end = event.end_time ? timeToMinutes(event.end_time) : start + 60;

  if (end <= start) {
    end = start + 60;
  }

  return {
    start,

    end: Math.min(end, 1440),
  };
}

function eventsOverlap(a, b) {
  const aTime = getEventTimes(a);

  const bTime = getEventTimes(b);

  return aTime.start < bTime.end && aTime.end > bTime.start;
}

function createEventElement(event) {
  const element = document.createElement('div');

  element.className = 'day-event';

  element.style.background = event.color || '#7c5cff';

  element.innerHTML = `

      <strong>
          ${event.title}
      </strong>


      ${
        event.location
          ? `

          <small>
              ${event.location}
          </small>

        `
          : ''
      }

  `;

  return element;
}
function renderDay() {
  hoursLayer.innerHTML = '';

  eventsLayer.innerHTML = '';

  const todayEvents = getTodayEvents();

  /*
  =========================
        GODZINY 00-24
  =========================
  */

  for (let i = 0; i < 24; i++) {
    const hour = document.createElement('div');

    hour.className = 'hour';

    if (i === now.getHours()) {
      hour.classList.add('current');
    }

    hour.innerHTML = `

        <div class="time">

            ${String(i).padStart(2, '0')}:00

        </div>

    `;

    hoursLayer.appendChild(hour);
  }

  /*
  =========================
        EVENTY CAŁODNIOWE
  =========================
  */

  const calendarEvents = todayEvents.map((event) => {
    if (isAllDay(event)) {
      return {
        ...event,

        start_time: '00:00',

        end_time: '24:00',

        all_day: true,
      };
    }

    return event;
  });

  /*
  =========================
        SORTOWANIE
  =========================
  */

  calendarEvents.sort((a, b) => {
    return getEventTimes(a).start - getEventTimes(b).start;
  });

  /*
  =========================
        KOLUMNY
  =========================
  */

  const columns = [];

  calendarEvents.forEach((event) => {
    let placed = false;

    for (let i = 0; i < columns.length; i++) {
      const collision = columns[i].some((item) => {
        return eventsOverlap(item, event);
      });

      if (!collision) {
        columns[i].push(event);

        event.column = i;

        placed = true;

        break;
      }
    }

    if (!placed) {
      event.column = columns.length;

      columns.push([event]);
    }
  });

  /*
  =========================
        ILOŚĆ KOLUMN
  =========================
  */

  calendarEvents.forEach((event) => {
    const overlapping = calendarEvents.filter((item) => {
      return eventsOverlap(item, event);
    });

    event.totalColumns = Math.max(
      ...overlapping.map((item) => item.column + 1),
    );
  });

  /*
  =========================
        RENDER EVENTÓW
  =========================
  */

  calendarEvents.forEach((event) => {
    const element = createEventElement(event);

    const { start, end } = getEventTimes(event);

    /*
        POZYCJA Y

        1 godzina = 100px

    */

    element.style.top = `${(start / 60) * 100}px`;

    /*
        WYSOKOŚĆ EVENTU

    */

    element.style.height = `${((end - start) / 60) * 100}px`;

    /*
        SZEROKOŚĆ

    */

    const width = 100 / event.totalColumns;

    element.style.width = `calc(${width}% - 10px)`;

    element.style.left = `calc(${event.column * width}% + 5px)`;

    element.style.right = 'auto';

    if (event.all_day) {
      element.style.zIndex = '2';
    } else {
      element.style.zIndex = '10';
    }

    eventsLayer.appendChild(element);
  });
}

/*
=========================================
        START
=========================================
*/

window.addEventListener('load', () => {
  loadEvents();

  setTimeout(() => {
    const current = document.querySelector('.current');

    if (current) {
      current.scrollIntoView({
        behavior: 'smooth',

        block: 'center',
      });
    }
  }, 500);
});
