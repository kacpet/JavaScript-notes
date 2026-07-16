import { db } from '../Firebase/firebase.js';

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const container = document.getElementById('notes-container');

const addNoteButton = document.getElementById('addNote');

const modal = document.getElementById('delete-modal');

const deleteText = document.getElementById('delete-text');

const cancelButton = document.getElementById('cancel-delete');

const confirmButton = document.getElementById('confirm-delete');

let noteToDelete = null;

const previewModal = document.getElementById('preview-modal');

const previewTitle = document.getElementById('preview-title');

const previewText = document.getElementById('preview-text');

const previewDate = document.getElementById('preview-date');

const closePreview = document.getElementById('close-preview');

closePreview.addEventListener('click', () => {
  previewModal.classList.remove('show');
});

previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.classList.remove('show');
  }
});

function openDeleteModal(id, title) {
  noteToDelete = id;

  deleteText.textContent = `Czy na pewno chcesz usunąć notatkę "${title}"?`;

  modal.classList.add('show');
}

cancelButton.addEventListener('click', () => {
  modal.classList.remove('show');

  noteToDelete = null;
});

confirmButton.addEventListener('click', async () => {
  await deleteNote(noteToDelete);

  modal.classList.remove('show');

  noteToDelete = null;
});

addNoteButton.addEventListener('click', () => {
  window.location.href = '../addNote/addNote.html';
});

/*
=================================
        LOAD NOTES
=================================
*/

async function loadNotes() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../login/login.html';

    return;
  }

  try {
    const response = await fetch('http://localhost:3000/notes', {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      displayNotes(data.notes);

      return;
    }
  } catch (error) {
    console.log('Backend offline - Firebase');
  }

  await loadFirebaseNotes();
}

/*
=================================
        FIREBASE NOTES
=================================
*/

async function loadFirebaseNotes() {
  try {
    const uid = localStorage.getItem('firebaseUID');

    if (!uid) {
      console.log('Brak Firebase UID');

      return;
    }

    const notesRef = collection(db, 'users', uid, 'notes');

    const snapshot = await getDocs(notesRef);

    const notes = [];

    snapshot.forEach((item) => {
      notes.push({
        id: item.id,

        ...item.data(),
      });
    });

    notes.sort((a, b) => {
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });

    displayNotes(notes);
  } catch (error) {
    console.error('Firebase notes error', error);
  }
}
function displayNotes(notes) {
  container.innerHTML = '';

  if (notes.length === 0) {
    container.innerHTML = `

<p id="no-notes">
    Brak dostępnych notatek
</p>

`;

    return;
  }

  notes.forEach((note) => {
    const card = document.createElement('div');

    card.className = 'note-card';

    card.innerHTML = `

<button

class="delete-note"

data-id="${note.id}"

data-title="${escapeHTML(note.title)}"

>

✕

</button>



<h3>

${escapeHTML(note.title)}

</h3>



<div class="note-content">

${fixCheckboxHTML(note.content)}

</div>



<span>

${formatDate(note.createdAt)}

</span>



<button

class="edit-note"

data-id="${note.id}"

>

Edytuj

</button>


`;

    container.appendChild(card);

    card.addEventListener('dblclick', () => {
      openPreview(note);
    });
  });

  document.querySelectorAll('.delete-note').forEach((button) => {
    button.addEventListener('click', () => {
      openDeleteModal(
        button.dataset.id,

        button.dataset.title,
      );
    });
  });

  document.querySelectorAll('.edit-note').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.href = `../addNote/addNote.html?id=${button.dataset.id}`;
    });
  });
}

/*
=================================
        DELETE NOTE
=================================
*/

async function deleteNote(id) {
  const token = localStorage.getItem('token');

  /*
==========================
BACKEND
==========================
*/

  try {
    const response = await fetch(
      `http://localhost:3000/notes/${id}`,

      {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (data.success) {
      loadNotes();

      return;
    }
  } catch (error) {
    console.log('Backend offline');
  }

  /*
==========================
FIREBASE DELETE
==========================
*/

  try {
    const uid = localStorage.getItem('firebaseUID');

    if (!uid) {
      return;
    }

    await deleteDoc(
      doc(
        db,

        'users',

        uid,

        'notes',

        id,
      ),
    );

    await loadFirebaseNotes();
  } catch (error) {
    console.error('Firebase delete error', error);
  }
}

function fixCheckboxHTML(html) {
  return html

    .replace(/<\/span>\s*<\/p>\s*<p>/g, '</span> ')

    .replace(/<p><br><\/p>/g, '');
}

function openPreview(note) {
  previewTitle.textContent = note.title;

  previewText.innerHTML = fixCheckboxHTML(note.content);

  previewDate.textContent = formatDate(note.createdAt);

  previewModal.classList.add('show');
}

function formatDate(date) {
  let noteDate;

  /*
Firebase Timestamp
*/

  if (date && date.toDate) {
    noteDate = date.toDate();
  }

  /*
Normal Date
*/
  else {
    noteDate = new Date(date);
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

  const weekday = days[noteDate.getDay()];

  const day = noteDate.getDate();

  const month = months[noteDate.getMonth()];

  const year = noteDate.getFullYear();

  const hours = String(noteDate.getHours()).padStart(2, '0');

  const minutes = String(noteDate.getMinutes()).padStart(2, '0');

  return `${weekday}, ${day} ${month} ${year} • ${hours}:${minutes}`;
}

function escapeHTML(text) {
  const div = document.createElement('div');

  div.textContent = text;

  return div.innerHTML;
}

loadNotes();
