import { auth, db } from '../Firebase/firebase.js';

import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

import {
  doc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

console.log('Register JS loaded');

console.log('Firebase auth:', auth);

console.log('Firebase db:', db);

const form = document.querySelector('form');

const emailInput = document.getElementById('email');

const passwordInput = document.getElementById('password');

const confirmPasswordInput = document.getElementById('confirmPassword');

const errorBox = document.getElementById('errorBox');

const errorMessage = document.getElementById('errorMessage');

const errorButton = document.getElementById('errorButton');

function addError(input) {
  input.classList.add('error');
}

function removeError(input) {
  input.classList.remove('error');
}

function showError(message) {
  errorMessage.innerHTML = message.replace(/\n/g, '<br>');

  errorBox.classList.add('show');
}

function hideError() {
  errorBox.classList.remove('show');
}

errorButton.addEventListener('click', hideError);

async function registerFirebase(email, password) {
  console.log('Firebase registration started');

  console.log({
    email,
    passwordLength: password.length,
  });

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  console.log('Firebase user created:', credential.user);

  const user = credential.user;

  await setDoc(
    doc(db, 'users', user.uid),

    {
      email,

      name: '',

      gender: '',

      hasDetails: false,

      createdAt: new Date(),
    },
  );

  console.log('Firestore user document created');

  const token = await user.getIdToken();

  localStorage.setItem('token', token);

  localStorage.setItem('loginProvider', 'firebase');

  localStorage.setItem('firebaseUID', user.uid);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  const password = passwordInput.value;

  const confirmPassword = confirmPasswordInput.value;

  [emailInput, passwordInput, confirmPasswordInput].forEach(removeError);

  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    addError(emailInput);

    errors.push('• Niepoprawny adres e-mail.');
  }

  if (password.length < 8) {
    addError(passwordInput);

    errors.push('• Hasło musi mieć minimum 8 znaków.');
  }

  if (password !== confirmPassword) {
    addError(passwordInput);

    addError(confirmPasswordInput);

    errors.push('• Hasła nie są takie same.');
  }

  if (errors.length) {
    showError(errors.join('\n'));

    return;
  }

  /*
=================================
        BACKEND POSTGRESQL
=================================
*/

  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('http://localhost:3000/register', {
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

    console.log('Backend response:', data);

    if (response.ok) {
      localStorage.setItem('token', data.token);

      localStorage.setItem('loginProvider', 'backend');

      window.location.href = '../addDetails/addDetails.html';

      return;
    }

    showError(data.message || 'Rejestracja nie powiodła się.');

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
    await registerFirebase(email, password);

    console.log('Firebase registration success');

    window.location.href = '../addDetails/addDetails.html';
  } catch (error) {
    console.error('FULL FIREBASE ERROR:', error);

    console.log('FIREBASE ERROR CODE:', error.code);

    console.log('FIREBASE ERROR MESSAGE:', error.message);

    switch (error.code) {
      case 'auth/email-already-in-use':
        addError(emailInput);

        showError('• Konto z tym adresem e-mail już istnieje.');

        break;

      case 'auth/weak-password':
        addError(passwordInput);

        showError('• Hasło jest zbyt słabe.');

        break;

      case 'auth/invalid-email':
        addError(emailInput);

        showError('• Niepoprawny adres e-mail.');

        break;

      case 'auth/operation-not-allowed':
        showError('• Logowanie e-mail/hasło jest wyłączone w Firebase.');

        break;

      case 'auth/invalid-api-key':
        showError('• Niepoprawny Firebase API Key.');

        break;

      default:
        showError(
          `• Firebase nie utworzył konta.

Kod:
${error.code}

${error.message}`,
        );
    }
  }
});
