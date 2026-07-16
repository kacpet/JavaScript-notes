import { db } from '../Firebase/firebase.js';

import {
  doc,
  setDoc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const titleInput = document.getElementById('title');

const saveButton = document.getElementById('save-note');

const boldBtn = document.getElementById('bold-btn');

const italicBtn = document.getElementById('italic-btn');

const underlineBtn = document.getElementById('underline-btn');

const h1Btn = document.getElementById('h1-btn');

const h2Btn = document.getElementById('h2-btn');

const ulBtn = document.getElementById('ul-btn');

const olBtn = document.getElementById('ol-btn');

const checkboxBtn = document.getElementById('checkbox-btn');

const linkBtn = document.getElementById('link-btn');

const linkModal = document.getElementById('link-modal');

const linkNameInput = document.getElementById('link-name');

const linkUrlInput = document.getElementById('link-url');

const addLinkBtn = document.getElementById('add-link');

const cancelLinkBtn = document.getElementById('cancel-link');

const urlParams = new URLSearchParams(window.location.search);

const editNoteId = urlParams.get('id');

let savedRange = null;

const Embed = Quill.import('blots/embed');

class CheckboxBlot extends Embed {
  static create() {
    const node = super.create();

    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';

    node.appendChild(checkbox);

    return node;
  }

  static value() {
    return true;
  }
}

CheckboxBlot.blotName = 'checkbox';

CheckboxBlot.tagName = 'span';

CheckboxBlot.className = 'quill-checkbox';

Quill.register(CheckboxBlot);

// ===============================
// LINK FORMAT
// ===============================

const Link = Quill.import('formats/link');

Link.sanitize = function (url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }

  return url;
};

Quill.register(Link, true);

// ===============================
// QUILL
// ===============================

const quill = new Quill('#content', {
  theme: 'snow',

  modules: {
    toolbar: false,
  },

  placeholder: '',
});

quill.root.addEventListener('click', (e) => {
  const link = e.target.closest('a');

  if (!link) {
    return;
  }

  if (!e.ctrlKey) {
    return;
  }

  e.preventDefault();

  window.open(link.href, '_blank');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Control') {
    quill.root.classList.add('ctrl-pressed');
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'Control') {
    quill.root.classList.remove('ctrl-pressed');
  }
});

checkboxBtn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) {
    quill.focus();

    return;
  }

  quill.insertEmbed(range.index, 'checkbox', true);

  quill.insertText(range.index + 1, ' ');

  quill.setSelection(range.index + 2);

  quill.focus();
});

linkBtn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) {
    quill.focus();

    return;
  }

  savedRange = range;

  linkModal.classList.add('active');

  linkNameInput.value = '';

  linkUrlInput.value = '';

  linkNameInput.focus();
});

addLinkBtn.addEventListener('click', () => {
  const name = linkNameInput.value.trim();

  const url = linkUrlInput.value.trim();

  if (name === '' || url === '') {
    alert('Uzupełnij nazwę i link');

    return;
  }

  if (!savedRange) {
    closeLinkModal();

    return;
  }

  quill.setSelection(savedRange.index, savedRange.length);

  quill.insertText(savedRange.index, name);

  quill.formatText(savedRange.index, name.length, 'link', url);

  quill.setSelection(savedRange.index + name.length);

  closeLinkModal();

  quill.focus();
});

cancelLinkBtn.addEventListener('click', () => {
  closeLinkModal();
});

function closeLinkModal() {
  linkModal.classList.remove('active');
}
function updateToolbar() {
  const range = quill.getSelection();

  if (!range) {
    return;
  }

  const format = quill.getFormat(range.index, range.length);

  boldBtn.classList.toggle('active', format.bold === true);

  italicBtn.classList.toggle('active', format.italic === true);

  underlineBtn.classList.toggle('active', format.underline === true);

  h1Btn.classList.toggle('active', format.header === 1);

  h2Btn.classList.toggle('active', format.header === 2);

  ulBtn.classList.toggle('active', format.list === 'bullet');

  olBtn.classList.toggle('active', format.list === 'ordered');
}

quill.on('selection-change', updateToolbar);

quill.on('text-change', () => {
  setTimeout(updateToolbar, 0);
});

// ===============================
// FORMAT FUNCTIONS
// ===============================

function toggleFormat(type) {
  const range = quill.getSelection();

  if (!range) {
    return;
  }

  const format = quill.getFormat(range.index, range.length);

  quill.format(type, !format[type]);

  quill.focus();

  updateToolbar();
}

// ===============================
// TEXT STYLE BUTTONS
// ===============================

boldBtn.addEventListener('click', () => toggleFormat('bold'));

italicBtn.addEventListener('click', () => toggleFormat('italic'));

underlineBtn.addEventListener('click', () => toggleFormat('underline'));

// ===============================
// HEADERS
// ===============================

h1Btn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) return;

  const format = quill.getFormat(range.index, range.length);

  quill.format('header', format.header === 1 ? false : 1);

  quill.focus();

  updateToolbar();
});

h2Btn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) return;

  const format = quill.getFormat(range.index, range.length);

  quill.format('header', format.header === 2 ? false : 2);

  quill.focus();

  updateToolbar();
});

// ===============================
// LISTS
// ===============================

ulBtn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) return;

  const format = quill.getFormat(range.index, range.length);

  quill.format('list', format.list === 'bullet' ? false : 'bullet');

  quill.focus();

  updateToolbar();
});

olBtn.addEventListener('click', () => {
  const range = quill.getSelection();

  if (!range) return;

  const format = quill.getFormat(range.index, range.length);

  quill.format('list', format.list === 'ordered' ? false : 'ordered');

  quill.focus();

  updateToolbar();
});

// ===============================
// LOAD NOTE FOR EDIT
// ===============================

async function loadNoteForEdit() {
  if (!editNoteId) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:3000/notes/${editNoteId}`, {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      titleInput.value = data.note.title;

      quill.root.innerHTML = data.note.content;

      return;
    }
  } catch (error) {
    console.log('Backend offline - Firebase');
  }

  // Firebase fallback

  try {
    await loadFirebaseNote();
  } catch (error) {
    console.error(error);

    alert('Nie udało się pobrać notatki');
  }
}

// ===============================
// SAVE NOTE
// ===============================
async function saveFirebaseNote(title, content) {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    throw new Error('Brak Firebase UID');
  }

  const noteId = editNoteId || crypto.randomUUID();

  await setDoc(
    doc(db, 'users', uid, 'notes', noteId),

    {
      title,

      content,

      createdAt: new Date(),

      updatedAt: new Date(),
    },

    {
      merge: true,
    },
  );

  return noteId;
}

async function loadFirebaseNote() {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    throw new Error('Brak Firebase UID');
  }

  const snapshot = await getDoc(doc(db, 'users', uid, 'notes', editNoteId));

  if (snapshot.exists()) {
    const note = snapshot.data();

    titleInput.value = note.title;

    quill.root.innerHTML = note.content;
  }
}

saveButton.addEventListener('click', async () => {
  const title = titleInput.value.trim();

  const content = quill.root.innerHTML.trim();

  if (title === '' || content === '<p><br></p>') {
    alert('Uzupełnij wszystkie pola');

    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '../login/login.html';

    return;
  }

  try {
    const url = editNoteId
      ? `http://localhost:3000/notes/${editNoteId}`
      : 'http://localhost:3000/addNote';

    const method = editNoteId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,

      headers: {
        'Content-Type': 'application/json',

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title,

        content,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert(editNoteId ? 'Zmieniono notatkę' : 'Dodano notatkę');

      window.location.href = '../notes/notes.html';
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log('Backend offline - zapis Firebase');

    try {
      await saveFirebaseNote(title, content);

      alert('Dodano notatkę Firebase');

      window.location.href = '../notes/notes.html';
    } catch (firebaseError) {
      console.error(firebaseError);

      alert('Nie udało się zapisać notatki');
    }
  }
});

// ===============================
// START
// ===============================

window.addEventListener('load', async () => {
  await loadNoteForEdit();

  quill.focus();

  updateToolbar();
});
