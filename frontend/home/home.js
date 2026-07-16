import { db } from '../Firebase/firebase.js';

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const welcome = document.getElementById('username');

const timeElement = document.getElementById('time');

const dateElement = document.getElementById('date');

const addNoteButton = document.getElementById('addNote');

const latestNote = document.getElementById('latest-note');

addNoteButton.addEventListener('click', () => {
  window.location.href = '../addNote/addNote.html';
});

// ===============================
// ZEGAR
// ===============================

function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, '0');

  const minutes = String(now.getMinutes()).padStart(2, '0');

  timeElement.textContent = `${hours}:${minutes}`;

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

  dateElement.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ===============================
// POMOCNICZE
// ===============================

function escapeHTML(text) {
  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}

function fixCheckboxHTML(html) {
  return html

    .replace(/<\/span>\s*<\/p>\s*<p>/g, '</span> ')

    .replace(/<p><br><\/p>/g, '');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',

    month: 'long',

    year: 'numeric',
  });
}

// ===============================
// FIREBASE USER
// ===============================

async function loadFirebaseUser() {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    return false;
  }

  const userRef = doc(db, 'users', uid);

  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();

    welcome.textContent = data.name || 'Użytkowniku';

    return true;
  }

  return false;
}

// ===============================
// FIREBASE NOTES
// ===============================

async function loadFirebaseLatestNote() {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    return;
  }

  const notesRef = collection(db, 'notes');

  const q = query(
    notesRef,

    where('id_user', '==', uid),

    orderBy('created_at', 'desc'),

    limit(1),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    latestNote.innerHTML = '<p>Brak notatek</p>';

    return;
  }

  const note = snapshot.docs[0].data();

  latestNote.innerHTML = `

        <h4>
            ${escapeHTML(note.title)}
        </h4>


        <div class="latest-content">

            ${fixCheckboxHTML(note.content)}

        </div>


        <span>

            ${formatDate(note.created_at)}

        </span>

    `;
}

// ===============================
// BACKEND USER
// ===============================

async function loadBackendUser() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success) {
    welcome.textContent = data.name;

    return true;
  }

  return false;
}

// ===============================
// BACKEND NOTES
// ===============================

async function loadBackendNotes() {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:3000/notes', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.success && data.notes.length) {
    const note = data.notes[0];

    latestNote.innerHTML = `

            <h4>
                ${escapeHTML(note.title)}
            </h4>


            <div class="latest-content">

                ${fixCheckboxHTML(note.content)}

            </div>


            <span>
                ${formatDate(note.created_at)}
            </span>

        `;
  } else {
    latestNote.innerHTML = '<p>Brak notatek</p>';
  }
}

// ===============================
// START
// ===============================

async function startHome() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../login/login.html';

    return;
  }

  try {
    await loadBackendUser();

    await loadBackendNotes();

    console.log('Backend działa');
  } catch (error) {
    console.log('Backend offline, Firebase');

    await loadFirebaseUser();

    await loadFirebaseLatestNote();
  }
}

startHome();

updateClock();

setInterval(updateClock, 1000);
