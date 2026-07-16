import { db } from '../Firebase/firebase.js';

import {
  doc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const form = document.getElementById('detailsForm');

const genderButtons = document.querySelectorAll('.gender-btn');

const genderInput = document.getElementById('gender');

// wybór płci

genderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    genderButtons.forEach((btn) => {
      btn.classList.remove('active');
    });

    button.classList.add('active');

    genderInput.value = button.dataset.gender;
  });
});

// Firebase zapis danych

async function saveFirebaseDetails(name, gender) {
  const uid = localStorage.getItem('firebaseUID');

  if (!uid) {
    throw new Error('Brak Firebase UID');
  }

  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    name,

    gender,

    hasDetails: true,
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();

  const gender = genderInput.value;

  if (!name) {
    alert('Podaj imię.');

    return;
  }

  if (!gender) {
    alert('Wybierz płeć.');

    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    alert('Sesja wygasła. Zaloguj się ponownie.');

    window.location.href = '../login/login.html';

    return;
  }

  /*
=================================
        BACKEND POSTGRESQL
=================================
*/

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 3000);

    const response = await fetch('http://localhost:3000/addDetails', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,

        gender,
      }),

      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    console.log('Backend:', data);

    if (response.ok && data.success) {
      localStorage.setItem('userName', name);

      window.location.href = '../home/home.html';

      return;
    }
  } catch (error) {
    console.log('Backend offline:', error.message);
  }

  try {
    await saveFirebaseDetails(name, gender);

    console.log('Firebase details saved');

    localStorage.setItem('userName', name);

    window.location.href = '../home/home.html';
  } catch (error) {
    console.error('Firebase error:', error);

    alert('Nie udało się zapisać danych.');
  }
});
