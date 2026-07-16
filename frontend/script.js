import { auth, db } from './Firebase/firebase.js';

import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

import {
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const form = document.querySelector('form');

// komponent błędów

const errorBox = document.getElementById('errorBox');

const errorMessage = document.getElementById('errorMessage');

const errorButton = document.getElementById('errorButton');

const registerButton = document.getElementById('registerButton');

function showError(message) {
  errorMessage.innerHTML = message.replace(/\n/g, '<br>');

  errorBox.classList.add('show');
}

function hideError() {
  errorBox.classList.remove('show');
}

errorButton.addEventListener('click', hideError);

registerButton.addEventListener('click', () => {
  window.location.href = 'register/register.html';
});

// ================================
// FIREBASE LOGIN
// ================================

async function loginFirebase(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  const user = result.user;

  const token = await user.getIdToken();

  localStorage.setItem('token', token);

  localStorage.setItem('firebaseUID', user.uid);

  localStorage.setItem('loginProvider', 'firebase');

  const userRef = doc(db, 'users', user.uid);

  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    const data = snapshot.data();

    localStorage.setItem('userName', data.name || '');

    if (data.hasDetails) {
      window.location.href = 'home/home.html';
    } else {
      window.location.href = 'addDetails/addDetails.html';
    }
  } else {
    window.location.href = 'addDetails/addDetails.html';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  const password = document.getElementById('password').value;

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

    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,

        password,
      }),

      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();

    console.log('Backend login:', data);

    if (data.success) {
      localStorage.setItem('token', data.token);

      localStorage.setItem('loginProvider', 'backend');

      if (data.hasDetails) {
        window.location.href = 'home/home.html';
      } else {
        window.location.href = 'addDetails/addDetails.html';
      }

      return;
    }

    showError('Logowanie nie powiodło się.');

    return;
  } catch (error) {
    console.log('Backend offline:', error.message);
  }

  /*
=================================
        FIREBASE
=================================
*/

  try {
    await loginFirebase(email, password);
  } catch (error) {
    console.error('Firebase login error:', error);

    switch (error.code) {
      case 'auth/user-not-found':
        showError('• Nie znaleziono konta.');

        break;

      case 'auth/wrong-password':
        showError('• Niepoprawne hasło.');

        break;

      case 'auth/invalid-credential':
        showError('• Niepoprawny email lub hasło.');

        break;

      default:
        showError('• Logowanie nie powiodło się.');
    }
  }
});
