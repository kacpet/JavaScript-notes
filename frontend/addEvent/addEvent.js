import { db } from '../Firebase/firebase.js';

import {
  doc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const allDayCheckbox = document.getElementById('allDay');

const repeatCheckbox = document.getElementById('repeat');

const repeatType = document.getElementById('repeatType');

const timeFields = document.getElementById('timeFields');

const repeatSettings = document.getElementById('repeatSettings');

const weekdays = document.getElementById('weekdays');

const form = document.getElementById('eventForm');

// ==========================
// UKRYWANIE GODZIN
// ==========================

function updateTimeFields() {
  if (allDayCheckbox.checked) {
    timeFields.classList.add('hidden');
  } else {
    timeFields.classList.remove('hidden');
  }
}

// ==========================
// CYKLICZNOŚĆ
// ==========================

function updateRepeatSettings() {
  if (repeatCheckbox.checked) {
    repeatSettings.classList.remove('hidden');

    updateWeekdays();
  } else {
    repeatSettings.classList.add('hidden');

    weekdays.classList.add('hidden');
  }
}

// ==========================
// WYBÓR DNI
// ==========================

function updateWeekdays() {
  if (repeatType.value === 'days') {
    weekdays.classList.remove('hidden');
  } else {
    weekdays.classList.add('hidden');
  }
}

allDayCheckbox.addEventListener('change', updateTimeFields);

repeatCheckbox.addEventListener('change', updateRepeatSettings);

repeatType.addEventListener('change', updateWeekdays);

updateTimeFields();

updateRepeatSettings();

// ==========================
// FIREBASE SAVE
// ==========================

async function saveFirebaseEvent(eventData) {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    throw new Error('Brak Firebase UID');
  }

  const eventId = crypto.randomUUID();

  await setDoc(
    doc(
      db,

      'users',

      uid,

      'events',

      eventId,
    ),

    {
      title: eventData.title,

      description: eventData.description,

      event_date: eventData.date,

      location: eventData.location,

      all_day: eventData.allDay,

      start_time: eventData.startTime,

      end_time: eventData.endTime,

      is_repeat: eventData.repeat,

      repeat_type: eventData.repeatType,

      repeat_every: eventData.repeatEvery,

      repeat_days: eventData.repeatDays,

      repeat_until: eventData.repeatUntil,

      color: eventData.color,

      createdAt: new Date(),

      updatedAt: new Date(),
    },
  );
}

// ==========================
// ZAPIS WYDARZENIA
// ==========================

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    alert('Musisz być zalogowany');

    return;
  }

  const selectedWeekdays = [
    ...document.querySelectorAll('input[name="weekdays"]:checked'),
  ].map((checkbox) => checkbox.value);

  const eventData = {
    title: document.getElementById('eventName').value,

    description: document.getElementById('eventDescription').value,

    date: document.getElementById('eventDate').value,

    location: document.getElementById('location').value,

    allDay: allDayCheckbox.checked,

    startTime: allDayCheckbox.checked
      ? null
      : document.getElementById('startTime').value,

    endTime: allDayCheckbox.checked
      ? null
      : document.getElementById('endTime').value,

    repeat: repeatCheckbox.checked,

    repeatType: repeatCheckbox.checked ? repeatType.value : null,

    repeatEvery: repeatCheckbox.checked
      ? Number(document.getElementById('repeatEvery').value)
      : null,

    repeatDays: repeatCheckbox.checked ? selectedWeekdays : [],

    repeatUntil: repeatCheckbox.checked
      ? document.getElementById('repeatUntil').value
      : null,

    color: document.getElementById('eventColor').value,
  };

  /*
    =========================
          BACKEND
    =========================
    */

  try {
    const response = await fetch(
      'http://localhost:3000/events',

      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(eventData),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Nie udało się dodać wydarzenia');
    }

    alert('Wydarzenie dodane');

    form.reset();

    updateTimeFields();

    updateRepeatSettings();

    return;
  } catch (error) {
    console.log('Backend offline - Firebase');
  }

  /*
    =========================
          FIREBASE
    =========================
    */

  try {
    await saveFirebaseEvent(eventData);

    alert('Wydarzenie zapisane Firebase');

    form.reset();

    updateTimeFields();

    updateRepeatSettings();
  } catch (firebaseError) {
    console.error(firebaseError);

    alert('Nie udało się zapisać wydarzenia');
  }
});
